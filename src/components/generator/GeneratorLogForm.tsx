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
import { Save, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [openSections, setOpenSections] = useState<string[]>(['winding']);

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

  const saveLogEntry = async () => {
    if (!user) return;

    if (!isEditable) {
      toast({
        title: 'Cannot Save',
        description: 'You can only edit data for the current hour.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('generator_logs').upsert(
        {
          user_id: user.id,
          date: selectedDate,
          hour: selectedHour,
          ...formData,
          logged_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,date,hour' }
      );

      if (error) throw error;

      toast({
        title: 'Saved',
        description: 'Generator log saved successfully.',
      });

      // Refresh logged hours
      if (!loggedHours.includes(selectedHour)) {
        setLoggedHours([...loggedHours, selectedHour]);
      }
    } catch (error) {
      console.error('Error saving log:', error);
      toast({
        title: 'Error',
        description: 'Failed to save generator log.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const { status: autoSaveStatus } = useAutoSave({
    data: formData,
    onSave: saveLogEntry,
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

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  return (
    <Card>
      {/* Fixed Header */}
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0 z-10 shadow-md">
        <CardTitle className="text-center text-2xl font-bold">
          GAYATRI POWER PRIVATE LIMITED
        </CardTitle>
        <p className="text-center text-lg font-medium">GENERATOR LOG SHEET</p>
        <div className="flex justify-center mt-4">
          <label className="text-white font-medium mr-2">DATE:-</label>
          <Input
            type="date"
            value={selectedDate}
            disabled
            className="w-48 bg-white text-black"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pb-24">
        {/* Hour Grid Selector */}
        <HourSelector
          selectedHour={selectedHour}
          onHourSelect={setSelectedHour}
          loggedHours={loggedHours}
          currentHour={currentHour}
        />

        {!isEditable && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              {selectedHour < currentHour
                ? '🔒 This hour is locked. You can view but not edit historical data.'
                : '⏳ Future hours cannot be edited yet.'}
            </p>
          </div>
        )}

        {/* Section 1: Generator Winding Temperatures */}
        <GeneratorSection
          title="GENERATOR WINDING TEMPERATURES"
          fieldCount={6}
          isOpen={openSections.includes('winding')}
          onToggle={() => toggleSection('winding')}
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
          title="BEARING TEMPERATURES"
          fieldCount={8}
          isOpen={openSections.includes('bearing')}
          onToggle={() => toggleSection('bearing')}
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
          title="3.3 KV GENERATOR - ELECTRICAL PARAMETERS"
          fieldCount={15}
          isOpen={openSections.includes('electrical')}
          onToggle={() => toggleSection('electrical')}
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
          title="AVR (AUTOMATIC VOLTAGE REGULATOR)"
          fieldCount={2}
          isOpen={openSections.includes('avr')}
          onToggle={() => toggleSection('avr')}
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
          title="INTAKE SYSTEM"
          fieldCount={4}
          isOpen={openSections.includes('intake')}
          onToggle={() => toggleSection('intake')}
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
          title="TAIL RACE"
          fieldCount={2}
          isOpen={openSections.includes('tailrace')}
          onToggle={() => toggleSection('tailrace')}
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
          title="T.OPU (TURBINE OIL PRESSURE UNIT)"
          fieldCount={3}
          isOpen={openSections.includes('topu')}
          onToggle={() => toggleSection('topu')}
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
          title="GB.LOS & COOLING WATER SYSTEM"
          fieldCount={6}
          isOpen={openSections.includes('cooling')}
          onToggle={() => toggleSection('cooling')}
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

        {/* Remarks */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Remarks</label>
          <Textarea
            value={formData.remarks ?? ''}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            disabled={!isEditable}
            placeholder="Enter any additional notes or observations..."
            rows={3}
          />
        </div>
      </CardContent>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4 z-50">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateHour(-1)}
            disabled={selectedHour === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateHour(1)}
            disabled={selectedHour === 23}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!isEditable}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            onClick={saveLogEntry}
            disabled={!isEditable || isSaving}
            className="flex-[2] bg-green-600 hover:bg-green-700 text-white"
          >
            {isSaving ? (
              'Saving...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
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
    </Card>
  );
}
