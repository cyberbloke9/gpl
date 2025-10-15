import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAutoSave } from '@/hooks/useAutoSave';
import { HourSelector } from './HourSelector';
import { GeneratorSection } from './GeneratorSection';
import { GeneratorInputRow } from './GeneratorInputRow';
import { GeneratorLog } from '@/types/generator';
import { 
  validateWindingTemperature, 
  validateBearingTemperature, 
  validateOilTemperature,
  validateVoltage,
  validateFrequency,
  validatePowerFactor
} from '@/lib/generatorValidation';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Save, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Accordion } from '@/components/ui/accordion';

interface GeneratorLogFormProps {
  isFinalized: boolean;
  onDateChange: (date: string) => void;
}

export function GeneratorLogForm({ isFinalized }: GeneratorLogFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [formData, setFormData] = useState<Partial<GeneratorLog>>({});
  const [loggedHours, setLoggedHours] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const currentHour = new Date().getHours();
  const isCurrentHour = selectedHour === currentHour;
  const isEditable = isCurrentHour && !isFinalized;

  // Fetch logs for the selected date
  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('generator_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate);

      if (error) {
        console.error('Error fetching logs:', error);
        return;
      }

      if (data) {
        const hours = data.map((log) => log.hour);
        setLoggedHours(hours);

        const currentLog = data.find((log) => log.hour === selectedHour);
        if (currentLog) {
          setFormData(currentLog);
        } else {
          setFormData({});
        }
      }
    };

    fetchLogs();
  }, [user, selectedDate, selectedHour]);

  // Auto-lock when hour changes
  useEffect(() => {
    const interval = setInterval(() => {
      const newHour = new Date().getHours();
      if (newHour !== currentHour) {
        setSelectedHour(newHour);
        toast({
          title: 'Hour Changed',
          description: `Hour ${newHour}:00 is now active. Previous hour is locked.`,
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [currentHour, toast]);

  const updateField = (field: keyof GeneratorLog, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === '' ? null : parseFloat(value),
    }));
  };

  // === Validation Function ===
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validate power factor (0-1)
    if (formData.gen_power_factor !== undefined && formData.gen_power_factor !== null) {
      if (formData.gen_power_factor < 0 || formData.gen_power_factor > 1) {
        errors.push('Power Factor must be between 0 and 1');
      }
    }

    // Validate frequency (45-55 Hz)
    if (formData.gen_frequency !== undefined && formData.gen_frequency !== null) {
      if (formData.gen_frequency < 45 || formData.gen_frequency > 55) {
        errors.push('Frequency must be between 45-55 Hz');
      }
    }

    // Validate bearing temperatures (0-200°C)
    const bearingFields = [
      'bearing_g_de_brg_main_ch7', 'bearing_g_nde_brg_stand_ch8',
      'bearing_thrust_1_ch9', 'bearing_thrust_2_ch10',
      'bearing_bgb_low_speed_ch11', 'bearing_bgb_high_speed_ch12',
      'bearing_tgb_low_speed_ch13', 'bearing_tgb_high_speed_ch14'
    ];
    bearingFields.forEach(field => {
      const value = formData[field as keyof GeneratorLog] as number | undefined;
      if (value !== undefined && value !== null) {
        if (value < 0 || value > 200) {
          errors.push(`${field} must be between 0-200°C`);
        }
      }
    });

    // Validate oil temperatures (0-150°C)
    const oilTempFields = ['topu_oil_temperature', 'gblos_oil_temperature'];
    oilTempFields.forEach(field => {
      const value = formData[field as keyof GeneratorLog] as number | undefined;
      if (value !== undefined && value !== null) {
        if (value < 0 || value > 150) {
          errors.push(`${field} must be between 0-150°C`);
        }
      }
    });

    // Validate percentage fields (0-100%)
    const percentageFields = ['intake_gv_percentage', 'intake_rb_percentage', 'topu_oil_level', 'gblos_oil_level'];
    percentageFields.forEach(field => {
      const value = formData[field as keyof GeneratorLog] as number | undefined;
      if (value !== undefined && value !== null) {
        if (value < 0 || value > 100) {
          errors.push(`${field} must be between 0-100%`);
        }
      }
    });

    // Validate non-negative fields
    const nonNegativeFields = [
      'gen_current_r', 'gen_current_y', 'gen_current_b',
      'gen_voltage_ry', 'gen_voltage_yb', 'gen_voltage_br',
      'gen_kw', 'gen_kvar', 'gen_kva', 'gen_rpm',
      'gen_mwh', 'gen_mvarh', 'gen_mvah',
      'avr_field_current', 'avr_field_voltage',
      'intake_water_pressure', 'tail_race_net_head',
      'topu_oil_pressure', 'gblos_oil_pressure',
      'cooling_main_pressure', 'cooling_los_flow', 'cooling_bearing_flow'
    ];
    nonNegativeFields.forEach(field => {
      const value = formData[field as keyof GeneratorLog] as number | undefined;
      if (value !== undefined && value !== null && value < 0) {
        errors.push(`${field} must be non-negative`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const saveLogEntry = async (showToast: boolean = true): Promise<boolean> => {
    if (!user) {
      console.error('[saveLogEntry] No user');
      return false;
    }

    if (!isEditable) {
      console.error('[saveLogEntry] Fields are disabled');
      if (showToast) {
        toast({
          title: 'Cannot Save',
          description: 'You can only edit data for the current hour.',
          variant: 'destructive',
        });
      }
      return false;
    }

    // Validate before saving
    const validation = validateForm();
    if (!validation.isValid) {
      console.error('[saveLogEntry] Validation failed:', validation.errors);
      if (showToast) {
        toast({
          title: 'Validation Error',
          description: validation.errors.join('. '),
          variant: 'destructive',
        });
      }
      return false;
    }

    setIsSaving(true);

    const payload = {
      user_id: user.id,
      date: selectedDate,
      hour: selectedHour,
      winding_temp_r1: formData.winding_temp_r1 ?? null,
      winding_temp_r2: formData.winding_temp_r2 ?? null,
      winding_temp_y1: formData.winding_temp_y1 ?? null,
      winding_temp_y2: formData.winding_temp_y2 ?? null,
      winding_temp_b1: formData.winding_temp_b1 ?? null,
      winding_temp_b2: formData.winding_temp_b2 ?? null,
      bearing_g_de_brg_main_ch7: formData.bearing_g_de_brg_main_ch7 ?? null,
      bearing_g_nde_brg_stand_ch8: formData.bearing_g_nde_brg_stand_ch8 ?? null,
      bearing_thrust_1_ch9: formData.bearing_thrust_1_ch9 ?? null,
      bearing_thrust_2_ch10: formData.bearing_thrust_2_ch10 ?? null,
      bearing_bgb_low_speed_ch11: formData.bearing_bgb_low_speed_ch11 ?? null,
      bearing_bgb_high_speed_ch12: formData.bearing_bgb_high_speed_ch12 ?? null,
      bearing_tgb_low_speed_ch13: formData.bearing_tgb_low_speed_ch13 ?? null,
      bearing_tgb_high_speed_ch14: formData.bearing_tgb_high_speed_ch14 ?? null,
      gen_current_r: formData.gen_current_r ?? null,
      gen_current_y: formData.gen_current_y ?? null,
      gen_current_b: formData.gen_current_b ?? null,
      gen_voltage_ry: formData.gen_voltage_ry ?? null,
      gen_voltage_yb: formData.gen_voltage_yb ?? null,
      gen_voltage_br: formData.gen_voltage_br ?? null,
      gen_kw: formData.gen_kw ?? null,
      gen_kvar: formData.gen_kvar ?? null,
      gen_kva: formData.gen_kva ?? null,
      gen_frequency: formData.gen_frequency ?? null,
      gen_power_factor: formData.gen_power_factor ?? null,
      gen_rpm: formData.gen_rpm ?? null,
      gen_mwh: formData.gen_mwh ?? null,
      gen_mvarh: formData.gen_mvarh ?? null,
      gen_mvah: formData.gen_mvah ?? null,
      avr_field_current: formData.avr_field_current ?? null,
      avr_field_voltage: formData.avr_field_voltage ?? null,
      intake_gv_percentage: formData.intake_gv_percentage ?? null,
      intake_rb_percentage: formData.intake_rb_percentage ?? null,
      intake_water_pressure: formData.intake_water_pressure ?? null,
      intake_water_level: formData.intake_water_level ?? null,
      tail_race_water_level: formData.tail_race_water_level ?? null,
      tail_race_net_head: formData.tail_race_net_head ?? null,
      topu_oil_pressure: formData.topu_oil_pressure ?? null,
      topu_oil_temperature: formData.topu_oil_temperature ?? null,
      topu_oil_level: formData.topu_oil_level ?? null,
      gblos_oil_pressure: formData.gblos_oil_pressure ?? null,
      gblos_oil_temperature: formData.gblos_oil_temperature ?? null,
      gblos_oil_level: formData.gblos_oil_level ?? null,
      cooling_main_pressure: formData.cooling_main_pressure ?? null,
      cooling_los_flow: formData.cooling_los_flow ?? null,
      cooling_bearing_flow: formData.cooling_bearing_flow ?? null,
      remarks: formData.remarks ?? null,
      logged_at: new Date().toISOString(),
    };

    console.log('📤 Sending payload:', payload);

    const { error } = await supabase.from('generator_logs').upsert(payload, {
      onConflict: 'user_id,date,hour',
    });

    setIsSaving(false);

    if (error) {
      console.error('🔴 FULL SUPABASE ERROR:', error);

      let errorMessage = error.message || 'Failed to save log entry';

      // Parse check constraint violations (23514)
      if (error.code === '23514') {
        if (error.message.includes('gen_power_factor')) {
          errorMessage = 'Power Factor must be between 0 and 1';
        } else if (error.message.includes('gen_frequency')) {
          errorMessage = 'Frequency must be between 45-55 Hz';
        } else if (error.message.includes('bearing') && error.message.includes('check')) {
          errorMessage = 'Bearing temperature must be between 0-200°C';
        } else if (error.message.includes('oil_temperature')) {
          errorMessage = 'Oil temperature must be between 0-150°C';
        } else if (error.message.includes('percentage') || error.message.includes('level')) {
          errorMessage = 'Percentage values must be between 0-100%';
        } else {
          errorMessage = 'Invalid value detected. Please check all fields.';
        }
      }

      // Parse unique constraint violations (23505)
      if (error.code === '23505') {
        errorMessage = 'A log entry for this hour already exists';
      }

      if (showToast) {
        toast({
          title: 'Error Saving',
          description: errorMessage,
          variant: 'destructive',
        });
      }

      return false;
    }

    if (showToast) {
      toast({
        title: 'Saved',
        description: 'Generator log saved successfully.',
      });
    }

    // Refresh logged hours
    if (!loggedHours.includes(selectedHour)) {
      setLoggedHours([...loggedHours, selectedHour]);
    }

    return true;
  };

  const handleSaveClick = async () => {
    await saveLogEntry(true);
  };

  const autoSaveWrapper = async () => {
    await saveLogEntry(false);
  };

  const { status: autoSaveStatus } = useAutoSave({
    data: formData,
    onSave: autoSaveWrapper,
    delay: 2000,
    enabled: isEditable && Object.keys(formData).length > 0,
  });

  const handleClear = () => {
    if (!isEditable) return;
    if (confirm('Clear all data for this hour?')) {
      setFormData({});
    }
  };

  const navigateHour = (direction: number) => {
    const newHour = selectedHour + direction;
    if (newHour >= 0 && newHour <= 23) {
      setSelectedHour(newHour);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col space-y-2">
            <CardTitle className="text-lg sm:text-xl">Generator Log Sheet</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Gayatri Power Private Limited • {format(new Date(selectedDate), "PPP")}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {loggedHours.length}/24 hours logged
            </Badge>
            {!isEditable && selectedHour < currentHour && (
              <Badge variant="outline" className="text-xs sm:text-sm">
                🔒 Locked - View Only
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 sm:pt-6 space-y-6">
          {/* Hour Grid Selector */}
          <HourSelector
            selectedHour={selectedHour}
            onHourSelect={setSelectedHour}
            loggedHours={loggedHours}
            currentHour={currentHour}
          />

          {/* Status indicator */}
          {selectedHour < currentHour && (
            <p className="text-xs text-muted-foreground">⏱ This hour has passed - viewing only</p>
          )}
          {selectedHour === currentHour && !isFinalized && (
            <p className="text-xs text-green-600">✓ Current hour - editable until {currentHour}:59</p>
          )}

          <Accordion type="multiple" defaultValue={['winding', 'bearing', 'electrical']} className="space-y-3 sm:space-y-4">
            {/* Section 1: Generator Winding Temperatures */}
            <GeneratorSection
              value="winding"
              title="GENERATOR WINDING TEMPERATURES"
              fieldCount={6}
              disabled={!isEditable}
            >
          <GeneratorInputRow
            label="R1 (Red Phase)"
            value={formData.winding_temp_r1 ?? ''}
            onChange={(val) => updateField('winding_temp_r1', val)}
            disabled={!isEditable}
            unit="°C"
            validation={validateWindingTemperature(formData.winding_temp_r1)}
          />
          <GeneratorInputRow
            label="R2 (Red Phase)"
            value={formData.winding_temp_r2 ?? ''}
            onChange={(val) => updateField('winding_temp_r2', val)}
            disabled={!isEditable}
            unit="°C"
            validation={validateWindingTemperature(formData.winding_temp_r2)}
          />
          <GeneratorInputRow
            label="Y1 (Yellow Phase)"
            value={formData.winding_temp_y1 ?? ''}
            onChange={(val) => updateField('winding_temp_y1', val)}
            disabled={!isEditable}
            unit="°C"
            validation={validateWindingTemperature(formData.winding_temp_y1)}
          />
          <GeneratorInputRow
            label="Y2 (Yellow Phase)"
            value={formData.winding_temp_y2 ?? ''}
            onChange={(val) => updateField('winding_temp_y2', val)}
            disabled={!isEditable}
            unit="°C"
            validation={validateWindingTemperature(formData.winding_temp_y2)}
          />
          <GeneratorInputRow
            label="B1 (Blue Phase)"
            value={formData.winding_temp_b1 ?? ''}
            onChange={(val) => updateField('winding_temp_b1', val)}
            disabled={!isEditable}
            unit="°C"
            validation={validateWindingTemperature(formData.winding_temp_b1)}
          />
          <GeneratorInputRow
            label="B2 (Blue Phase)"
            value={formData.winding_temp_b2 ?? ''}
            onChange={(val) => updateField('winding_temp_b2', val)}
            disabled={!isEditable}
            unit="°C"
            validation={validateWindingTemperature(formData.winding_temp_b2)}
          />
            </GeneratorSection>

            {/* Section 2: Bearing Temperatures */}
            <GeneratorSection
              value="bearing"
              title="BEARING TEMPERATURES"
              fieldCount={8}
              disabled={!isEditable}
            >
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-sm text-primary mb-2">Generator Drive End (G.DE)</h5>
              <div className="space-y-2 pl-4">
                <GeneratorInputRow
                  label="G.DE BRG MAIN (CH7)"
                  value={formData.bearing_g_de_brg_main_ch7 ?? ''}
                  onChange={(val) => updateField('bearing_g_de_brg_main_ch7', val)}
                  disabled={!isEditable}
                  unit="°C"
                  validation={validateBearingTemperature(formData.bearing_g_de_brg_main_ch7)}
                />
                <GeneratorInputRow
                  label="G.NDE BRG STAND (CH8)"
                  value={formData.bearing_g_nde_brg_stand_ch8 ?? ''}
                  onChange={(val) => updateField('bearing_g_nde_brg_stand_ch8', val)}
                  disabled={!isEditable}
                  unit="°C"
                  validation={validateBearingTemperature(formData.bearing_g_nde_brg_stand_ch8)}
                />
              </div>
            </div>

            <div>
              <h5 className="font-medium text-sm text-primary mb-2">Gear Shaft</h5>
              <div className="space-y-2 pl-4">
                <GeneratorInputRow
                  label="THRUST -1 (CH9)"
                  value={formData.bearing_thrust_1_ch9 ?? ''}
                  onChange={(val) => updateField('bearing_thrust_1_ch9', val)}
                  disabled={!isEditable}
                  unit="°C"
                  validation={validateBearingTemperature(formData.bearing_thrust_1_ch9)}
                />
                <GeneratorInputRow
                  label="THRUST -2 (CH10)"
                  value={formData.bearing_thrust_2_ch10 ?? ''}
                  onChange={(val) => updateField('bearing_thrust_2_ch10', val)}
                  disabled={!isEditable}
                  unit="°C"
                  validation={validateBearingTemperature(formData.bearing_thrust_2_ch10)}
                />
              </div>
            </div>

            <div>
              <h5 className="font-medium text-sm text-primary mb-2">Driven Shaft</h5>
              <div className="space-y-2 pl-4">
                <GeneratorInputRow
                  label="B.G.B LOW SPEED (CH11)"
                  value={formData.bearing_bgb_low_speed_ch11 ?? ''}
                  onChange={(val) => updateField('bearing_bgb_low_speed_ch11', val)}
                  disabled={!isEditable}
                  unit="°C"
                  validation={validateBearingTemperature(formData.bearing_bgb_low_speed_ch11)}
                />
                <GeneratorInputRow
                  label="B.G.B HIGH SPEED (CH12)"
                  value={formData.bearing_bgb_high_speed_ch12 ?? ''}
                  onChange={(val) => updateField('bearing_bgb_high_speed_ch12', val)}
                  disabled={!isEditable}
                  unit="°C"
                  validation={validateBearingTemperature(formData.bearing_bgb_high_speed_ch12)}
                />
                <GeneratorInputRow
                  label="T.G.B LOW SPEED (CH13)"
                  value={formData.bearing_tgb_low_speed_ch13 ?? ''}
                  onChange={(val) => updateField('bearing_tgb_low_speed_ch13', val)}
                  disabled={!isEditable}
                  unit="°C"
                  validation={validateBearingTemperature(formData.bearing_tgb_low_speed_ch13)}
                />
                <GeneratorInputRow
                  label="T.G.B HIGH SPEED (CH14)"
                  value={formData.bearing_tgb_high_speed_ch14 ?? ''}
                  onChange={(val) => updateField('bearing_tgb_high_speed_ch14', val)}
                  disabled={!isEditable}
                  unit="°C"
                  validation={validateBearingTemperature(formData.bearing_tgb_high_speed_ch14)}
                />
              </div>
            </div>
          </div>
            </GeneratorSection>

            {/* Section 3: Electrical Parameters */}
            <GeneratorSection
              value="electrical"
              title="3.3 KV GENERATOR - ELECTRICAL PARAMETERS"
              fieldCount={15}
              disabled={!isEditable}
            >
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-sm text-primary mb-2">Three-Phase Current</h5>
              <div className="space-y-2 pl-4">
                <GeneratorInputRow
                  label="R Phase Current"
                  value={formData.gen_current_r ?? ''}
                  onChange={(val) => updateField('gen_current_r', val)}
                  disabled={!isEditable}
                  unit="A"
                  step="0.01"
                />
                <GeneratorInputRow
                  label="Y Phase Current"
                  value={formData.gen_current_y ?? ''}
                  onChange={(val) => updateField('gen_current_y', val)}
                  disabled={!isEditable}
                  unit="A"
                  step="0.01"
                />
                <GeneratorInputRow
                  label="B Phase Current"
                  value={formData.gen_current_b ?? ''}
                  onChange={(val) => updateField('gen_current_b', val)}
                  disabled={!isEditable}
                  unit="A"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <h5 className="font-medium text-sm text-primary mb-2">Line-to-Line Voltage</h5>
              <div className="space-y-2 pl-4">
                <GeneratorInputRow
                  label="RY Phase Voltage"
                  value={formData.gen_voltage_ry ?? ''}
                  onChange={(val) => updateField('gen_voltage_ry', val)}
                  disabled={!isEditable}
                  unit="V"
                  step="0.01"
                  validation={validateVoltage(formData.gen_voltage_ry)}
                />
                <GeneratorInputRow
                  label="YB Phase Voltage"
                  value={formData.gen_voltage_yb ?? ''}
                  onChange={(val) => updateField('gen_voltage_yb', val)}
                  disabled={!isEditable}
                  unit="V"
                  step="0.01"
                  validation={validateVoltage(formData.gen_voltage_yb)}
                />
                <GeneratorInputRow
                  label="BR Phase Voltage"
                  value={formData.gen_voltage_br ?? ''}
                  onChange={(val) => updateField('gen_voltage_br', val)}
                  disabled={!isEditable}
                  unit="V"
                  step="0.01"
                  validation={validateVoltage(formData.gen_voltage_br)}
                />
              </div>
            </div>

            <div>
              <h5 className="font-medium text-sm text-primary mb-2">Power and Frequency</h5>
              <div className="space-y-2 pl-4">
                <GeneratorInputRow
                  label="KW"
                  value={formData.gen_kw ?? ''}
                  onChange={(val) => updateField('gen_kw', val)}
                  disabled={!isEditable}
                  unit="kW"
                  step="0.01"
                />
                <GeneratorInputRow
                  label="KVAR"
                  value={formData.gen_kvar ?? ''}
                  onChange={(val) => updateField('gen_kvar', val)}
                  disabled={!isEditable}
                  unit="kVAR"
                  step="0.01"
                />
                <GeneratorInputRow
                  label="KVA"
                  value={formData.gen_kva ?? ''}
                  onChange={(val) => updateField('gen_kva', val)}
                  disabled={!isEditable}
                  unit="kVA"
                  step="0.01"
                />
                <GeneratorInputRow
                  label="H.Z. (Frequency)"
                  value={formData.gen_frequency ?? ''}
                  onChange={(val) => updateField('gen_frequency', val)}
                  disabled={!isEditable}
                  unit="Hz"
                  step="0.01"
                  validation={validateFrequency(formData.gen_frequency)}
                />
                <GeneratorInputRow
                  label="PF/COS θ"
                  value={formData.gen_power_factor ?? ''}
                  onChange={(val) => updateField('gen_power_factor', val)}
                  disabled={!isEditable}
                  step="0.001"
                  validation={validatePowerFactor(formData.gen_power_factor)}
                />
                <GeneratorInputRow
                  label="RPM / SPEED"
                  value={formData.gen_rpm ?? ''}
                  onChange={(val) => updateField('gen_rpm', val)}
                  disabled={!isEditable}
                  unit="RPM"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <h5 className="font-medium text-sm text-primary mb-2">Energy Consumption</h5>
              <div className="space-y-2 pl-4">
                <GeneratorInputRow
                  label="MWH"
                  value={formData.gen_mwh ?? ''}
                  onChange={(val) => updateField('gen_mwh', val)}
                  disabled={!isEditable}
                  unit="MWh"
                  step="0.001"
                />
                <GeneratorInputRow
                  label="MVARH"
                  value={formData.gen_mvarh ?? ''}
                  onChange={(val) => updateField('gen_mvarh', val)}
                  disabled={!isEditable}
                  unit="MVARh"
                  step="0.001"
                />
                <GeneratorInputRow
                  label="MVAH"
                  value={formData.gen_mvah ?? ''}
                  onChange={(val) => updateField('gen_mvah', val)}
                  disabled={!isEditable}
                  unit="MVAh"
                  step="0.001"
                />
              </div>
            </div>
          </div>
            </GeneratorSection>

            {/* Section 4: AVR */}
            <GeneratorSection
              value="avr"
              title="AVR (AUTOMATIC VOLTAGE REGULATOR)"
              fieldCount={2}
              disabled={!isEditable}
            >
          <GeneratorInputRow
            label="Field Current"
            value={formData.avr_field_current ?? ''}
            onChange={(val) => updateField('avr_field_current', val)}
            disabled={!isEditable}
            unit="A"
            step="0.01"
          />
          <GeneratorInputRow
            label="Field Voltage"
            value={formData.avr_field_voltage ?? ''}
            onChange={(val) => updateField('avr_field_voltage', val)}
            disabled={!isEditable}
            unit="V"
            step="0.01"
          />
            </GeneratorSection>

            {/* Section 5: Intake System */}
            <GeneratorSection
              value="intake"
              title="INTAKE SYSTEM"
              fieldCount={4}
              disabled={!isEditable}
            >
          <GeneratorInputRow
            label="GV%"
            value={formData.intake_gv_percentage ?? ''}
            onChange={(val) => updateField('intake_gv_percentage', val)}
            disabled={!isEditable}
            unit="%"
            step="0.01"
          />
          <GeneratorInputRow
            label="RB%"
            value={formData.intake_rb_percentage ?? ''}
            onChange={(val) => updateField('intake_rb_percentage', val)}
            disabled={!isEditable}
            unit="%"
            step="0.01"
          />
          <GeneratorInputRow
            label="Water Pressure"
            value={formData.intake_water_pressure ?? ''}
            onChange={(val) => updateField('intake_water_pressure', val)}
            disabled={!isEditable}
            unit="Kg/cm²"
            step="0.01"
          />
          <GeneratorInputRow
            label="Water Level"
            value={formData.intake_water_level ?? ''}
            onChange={(val) => updateField('intake_water_level', val)}
            disabled={!isEditable}
            unit="m"
            step="0.01"
          />
            </GeneratorSection>

            {/* Section 6: Tail Race */}
            <GeneratorSection
              value="tailrace"
              title="TAIL RACE"
              fieldCount={2}
              disabled={!isEditable}
            >
          <GeneratorInputRow
            label="Water Level"
            value={formData.tail_race_water_level ?? ''}
            onChange={(val) => updateField('tail_race_water_level', val)}
            disabled={!isEditable}
            unit="m"
            step="0.01"
          />
          <GeneratorInputRow
            label="Net Head"
            value={formData.tail_race_net_head ?? ''}
            onChange={(val) => updateField('tail_race_net_head', val)}
            disabled={!isEditable}
            unit="m"
            step="0.01"
          />
            </GeneratorSection>

            {/* Section 7: T.OPU */}
            <GeneratorSection
              value="topu"
              title="T.OPU (TURBINE OIL PRESSURE UNIT)"
              fieldCount={3}
              disabled={!isEditable}
            >
          <GeneratorInputRow
            label="Oil Pressure"
            value={formData.topu_oil_pressure ?? ''}
            onChange={(val) => updateField('topu_oil_pressure', val)}
            disabled={!isEditable}
            unit="Kg/cm²"
            step="0.01"
          />
          <GeneratorInputRow
            label="Oil Temperature"
            value={formData.topu_oil_temperature ?? ''}
            onChange={(val) => updateField('topu_oil_temperature', val)}
            disabled={!isEditable}
            unit="°C"
            validation={validateOilTemperature(formData.topu_oil_temperature)}
          />
          <GeneratorInputRow
            label="Oil Level"
            value={formData.topu_oil_level ?? ''}
            onChange={(val) => updateField('topu_oil_level', val)}
            disabled={!isEditable}
            unit="%"
            step="0.01"
          />
            </GeneratorSection>

            {/* Section 8: GB.LOS & Cooling Water */}
            <GeneratorSection
              value="cooling"
              title="GB.LOS & COOLING WATER SYSTEM"
              fieldCount={6}
              disabled={!isEditable}
            >
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-sm text-primary mb-2">GB.LOS (Gearbox Lubrication Oil System)</h5>
              <div className="space-y-2 pl-4">
                <GeneratorInputRow
                  label="Oil Pressure"
                  value={formData.gblos_oil_pressure ?? ''}
                  onChange={(val) => updateField('gblos_oil_pressure', val)}
                  disabled={!isEditable}
                  unit="Kg/cm²"
                  step="0.01"
                />
                <GeneratorInputRow
                  label="Oil Temperature"
                  value={formData.gblos_oil_temperature ?? ''}
                  onChange={(val) => updateField('gblos_oil_temperature', val)}
                  disabled={!isEditable}
                  unit="°C"
                  validation={validateOilTemperature(formData.gblos_oil_temperature)}
                />
                <GeneratorInputRow
                  label="Oil Level"
                  value={formData.gblos_oil_level ?? ''}
                  onChange={(val) => updateField('gblos_oil_level', val)}
                  disabled={!isEditable}
                  unit="%"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <h5 className="font-medium text-sm text-primary mb-2">Cooling Water System</h5>
              <div className="space-y-2 pl-4">
                <GeneratorInputRow
                  label="Main Pressure"
                  value={formData.cooling_main_pressure ?? ''}
                  onChange={(val) => updateField('cooling_main_pressure', val)}
                  disabled={!isEditable}
                  unit="Kg/cm²"
                  step="0.01"
                />
                <GeneratorInputRow
                  label="LOS Flow"
                  value={formData.cooling_los_flow ?? ''}
                  onChange={(val) => updateField('cooling_los_flow', val)}
                  disabled={!isEditable}
                  unit="LPM"
                  step="0.01"
                />
                <GeneratorInputRow
                  label="Bearing Flow"
                  value={formData.cooling_bearing_flow ?? ''}
                  onChange={(val) => updateField('cooling_bearing_flow', val)}
                  disabled={!isEditable}
                  unit="Kg/cm²"
                  step="0.01"
                />
              </div>
            </div>
          </div>
            </GeneratorSection>
          </Accordion>

          {/* Remarks */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium">Remarks</label>
            <Textarea
              value={formData.remarks ?? ''}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              disabled={!isEditable}
              placeholder="Enter any additional notes or observations..."
              rows={3}
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg p-3 sm:p-4 z-50">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateHour(-1)}
            disabled={selectedHour === 0}
            className="flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateHour(1)}
            disabled={selectedHour === 23}
            className="flex-shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={!isEditable}
            className="flex-1"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Clear</span>
          </Button>
          <Button
            size="sm"
            onClick={handleSaveClick}
            disabled={!isEditable || isSaving}
            className="flex-[2]"
          >
            {isSaving ? (
              <span className="text-xs sm:text-sm">Saving...</span>
            ) : (
              <>
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Save</span>
              </>
            )}
          </Button>
        </div>
        {autoSaveStatus && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            {autoSaveStatus}
          </p>
        )}
      </div>
    </div>
  );
}
