import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { InputRow } from './InputRow';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Save, Trash2 } from 'lucide-react';
import { TimePicker } from '@/components/ui/time-picker';

interface TransformerLogFormProps {
  isFinalized: boolean;
  onDateChange: (date: string) => void;
  onFinalizeDay: (transformerNumber: number) => void;
}

interface TransformerData {
  frequency: string;
  voltage_ry: string;
  voltage_yb: string;
  voltage_rb: string;
  current_r: string;
  current_y: string;
  current_b: string;
  active_power: string;
  reactive_power: string;
  kva: string;
  mwh: string;
  mvarh: string;
  mvah: string;
  cos_phi: string;
  oil_temperature: string;
  winding_temperature: string;
  oil_level: string;
  tap_position: string;
  tap_counter: string;
  silica_gel_colour: string;
  ltac_current_r: string;
  ltac_current_y: string;
  ltac_current_b: string;
  ltac_voltage_ry: string;
  ltac_voltage_yb: string;
  ltac_voltage_rb: string;
  ltac_kw: string;
  ltac_kva: string;
  ltac_kvar: string;
  ltac_kwh: string;
  ltac_kvah: string;
  ltac_kvarh: string;
  ltac_oil_temperature: string;
  ltac_grid_fail_time: string;
  ltac_grid_resume_time: string;
  ltac_supply_interruption: string;
  gen_total_generation: string;
  gen_xmer_export: string;
  gen_aux_consumption: string;
  gen_main_export: string;
  gen_check_export: string;
  gen_main_import: string;
  gen_check_import: string;
  gen_standby_export: string;
  gen_standby_import: string;
  remarks: string;
}

const initialFormState: TransformerData = {
  frequency: '',
  voltage_ry: '',
  voltage_yb: '',
  voltage_rb: '',
  current_r: '',
  current_y: '',
  current_b: '',
  active_power: '',
  reactive_power: '',
  kva: '',
  mwh: '',
  mvarh: '',
  mvah: '',
  cos_phi: '',
  oil_temperature: '',
  winding_temperature: '',
  oil_level: '',
  tap_position: '',
  tap_counter: '',
  silica_gel_colour: '',
  ltac_current_r: '',
  ltac_current_y: '',
  ltac_current_b: '',
  ltac_voltage_ry: '',
  ltac_voltage_yb: '',
  ltac_voltage_rb: '',
  ltac_kw: '',
  ltac_kva: '',
  ltac_kvar: '',
  ltac_kwh: '',
  ltac_kvah: '',
  ltac_kvarh: '',
  ltac_oil_temperature: '',
  ltac_grid_fail_time: '',
  ltac_grid_resume_time: '',
  ltac_supply_interruption: '',
  gen_total_generation: '',
  gen_xmer_export: '',
  gen_aux_consumption: '',
  gen_main_export: '',
  gen_check_export: '',
  gen_main_import: '',
  gen_check_import: '',
  gen_standby_export: '',
  gen_standby_import: '',
  remarks: '',
};

const getTransformerName = (number: number): string => {
  return number === 1 ? 'Power Transformer' : 'Auxiliary Transformer';
};

export function TransformerLogForm({ isFinalized, onDateChange, onFinalizeDay }: TransformerLogFormProps) {
  const { user } = useAuth();
  const [transformerNumber] = useState<number>(1); // Fixed to Power Transformer
  const selectedDate = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []); // Memoized to prevent infinite re-renders
  const [selectedHour, setSelectedHour] = useState<number>(new Date().getHours());
  const [formData, setFormData] = useState<TransformerData>(initialFormState);
  const [loggedHours, setLoggedHours] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const currentHour = new Date().getHours();
  const isToday = true; // Always today
  
  // Calculate if fields should be disabled
  const isFieldDisabled = isFinalized || selectedHour < currentHour;
  
  // Debug logging
  useEffect(() => {
    console.log('[TransformerLog] State:', {
      selectedHour,
      currentHour,
      isDirty,
      isFieldDisabled,
      isSaving,
      isFinalized,
    });
  }, [selectedHour, isDirty, isFieldDisabled, isSaving, isFinalized]);

  useEffect(() => {
    console.log('[Field Status]:', {
      selectedHour,
      currentHour,
      isFinalized,
      isFieldDisabled,
      comparison: `${selectedHour} < ${currentHour} = ${selectedHour < currentHour}`,
    });
  }, [selectedHour, currentHour, isFinalized, isFieldDisabled]);

  useEffect(() => {
    if (!user?.id) return;
    
    // Always load fresh data when hour changes
    loadHourData();
    
    // Reset dirty flag when loading new hour
    setIsDirty(false);
  }, [selectedDate, selectedHour, transformerNumber, user?.id]);

  const loadHourData = async () => {
    if (!user) return;

    setIsDirty(false); // Reset when loading new hour data
    
    // Clear form data immediately to prevent flash of wrong data
    setFormData(initialFormState);

    const { data: logs } = await supabase
      .from('transformer_logs')
      .select('hour')
      .eq('date', selectedDate)
      .eq('transformer_number', transformerNumber)
      .eq('user_id', user.id);

    setLoggedHours(logs?.map(l => l.hour) || []);

    const { data: hourData } = await supabase
      .from('transformer_logs')
      .select('*')
      .eq('date', selectedDate)
      .eq('hour', selectedHour)
      .eq('transformer_number', transformerNumber)
      .eq('user_id', user.id)
      .maybeSingle();

    if (hourData) {
      setFormData({
        frequency: hourData.frequency?.toString() || '',
        voltage_ry: hourData.voltage_ry?.toString() || '',
        voltage_yb: hourData.voltage_yb?.toString() || '',
        voltage_rb: hourData.voltage_rb?.toString() || '',
        current_r: hourData.current_r?.toString() || '',
        current_y: hourData.current_y?.toString() || '',
        current_b: hourData.current_b?.toString() || '',
        active_power: hourData.active_power?.toString() || '',
        reactive_power: hourData.reactive_power?.toString() || '',
        kva: hourData.kva?.toString() || '',
        mwh: hourData.mwh?.toString() || '',
        mvarh: hourData.mvarh?.toString() || '',
        mvah: hourData.mvah?.toString() || '',
        cos_phi: hourData.cos_phi?.toString() || '',
        oil_temperature: hourData.oil_temperature?.toString() || '',
        winding_temperature: hourData.winding_temperature?.toString() || '',
        oil_level: hourData.oil_level || '',
        tap_position: hourData.tap_position || '',
        tap_counter: hourData.tap_counter?.toString() || '',
        silica_gel_colour: hourData.silica_gel_colour || '',
        ltac_current_r: hourData.ltac_current_r?.toString() || '',
        ltac_current_y: hourData.ltac_current_y?.toString() || '',
        ltac_current_b: hourData.ltac_current_b?.toString() || '',
        ltac_voltage_ry: hourData.ltac_voltage_ry?.toString() || '',
        ltac_voltage_yb: hourData.ltac_voltage_yb?.toString() || '',
        ltac_voltage_rb: hourData.ltac_voltage_rb?.toString() || '',
        ltac_kw: hourData.ltac_kw?.toString() || '',
        ltac_kva: hourData.ltac_kva?.toString() || '',
        ltac_kvar: hourData.ltac_kvar?.toString() || '',
        ltac_kwh: hourData.ltac_kwh?.toString() || '',
        ltac_kvah: hourData.ltac_kvah?.toString() || '',
        ltac_kvarh: hourData.ltac_kvarh?.toString() || '',
        ltac_oil_temperature: hourData.ltac_oil_temperature?.toString() || '',
        ltac_grid_fail_time: hourData.ltac_grid_fail_time || '',
        ltac_grid_resume_time: hourData.ltac_grid_resume_time || '',
        ltac_supply_interruption: hourData.ltac_supply_interruption || '',
        gen_total_generation: hourData.gen_total_generation?.toString() || '',
        gen_xmer_export: hourData.gen_xmer_export?.toString() || '',
        gen_aux_consumption: hourData.gen_aux_consumption?.toString() || '',
        gen_main_export: hourData.gen_main_export?.toString() || '',
        gen_check_export: hourData.gen_check_export?.toString() || '',
        gen_main_import: hourData.gen_main_import?.toString() || '',
        gen_check_import: hourData.gen_check_import?.toString() || '',
        gen_standby_export: hourData.gen_standby_export?.toString() || '',
        gen_standby_import: hourData.gen_standby_import?.toString() || '',
        remarks: hourData.remarks || '',
      });
    } else {
      setFormData(initialFormState);
    }
  };

  const saveLogEntry = async (showToast: boolean = true): Promise<boolean> => {
    if (!user || isFieldDisabled) {
      console.log('[saveLogEntry] Blocked:', { user: !!user, isFieldDisabled });
      return false;
    }

    setIsSaving(true);

    const payload = {
      user_id: user.id,
      transformer_number: transformerNumber,
      date: selectedDate,
      hour: selectedHour,
      frequency: formData.frequency ? parseFloat(formData.frequency) : null,
      voltage_ry: formData.voltage_ry ? parseFloat(formData.voltage_ry) : null,
      voltage_yb: formData.voltage_yb ? parseFloat(formData.voltage_yb) : null,
      voltage_rb: formData.voltage_rb ? parseFloat(formData.voltage_rb) : null,
      current_r: formData.current_r ? parseFloat(formData.current_r) : null,
      current_y: formData.current_y ? parseFloat(formData.current_y) : null,
      current_b: formData.current_b ? parseFloat(formData.current_b) : null,
      active_power: formData.active_power ? parseFloat(formData.active_power) : null,
      reactive_power: formData.reactive_power ? parseFloat(formData.reactive_power) : null,
      kva: formData.kva ? parseFloat(formData.kva) : null,
      mwh: formData.mwh ? parseFloat(formData.mwh) : null,
      mvarh: formData.mvarh ? parseFloat(formData.mvarh) : null,
      mvah: formData.mvah ? parseFloat(formData.mvah) : null,
      cos_phi: formData.cos_phi ? parseFloat(formData.cos_phi) : null,
      oil_temperature: formData.oil_temperature ? parseFloat(formData.oil_temperature) : null,
      winding_temperature: formData.winding_temperature ? parseFloat(formData.winding_temperature) : null,
      oil_level: formData.oil_level || null,
      tap_position: formData.tap_position || null,
      tap_counter: formData.tap_counter ? parseInt(formData.tap_counter) : null,
      silica_gel_colour: formData.silica_gel_colour || null,
      ltac_current_r: formData.ltac_current_r ? parseFloat(formData.ltac_current_r) : null,
      ltac_current_y: formData.ltac_current_y ? parseFloat(formData.ltac_current_y) : null,
      ltac_current_b: formData.ltac_current_b ? parseFloat(formData.ltac_current_b) : null,
      ltac_voltage_ry: formData.ltac_voltage_ry ? parseFloat(formData.ltac_voltage_ry) : null,
      ltac_voltage_yb: formData.ltac_voltage_yb ? parseFloat(formData.ltac_voltage_yb) : null,
      ltac_voltage_rb: formData.ltac_voltage_rb ? parseFloat(formData.ltac_voltage_rb) : null,
      ltac_kw: formData.ltac_kw ? parseFloat(formData.ltac_kw) : null,
      ltac_kva: formData.ltac_kva ? parseFloat(formData.ltac_kva) : null,
      ltac_kvar: formData.ltac_kvar ? parseFloat(formData.ltac_kvar) : null,
      ltac_kwh: formData.ltac_kwh ? parseFloat(formData.ltac_kwh) : null,
      ltac_kvah: formData.ltac_kvah ? parseFloat(formData.ltac_kvah) : null,
      ltac_kvarh: formData.ltac_kvarh ? parseFloat(formData.ltac_kvarh) : null,
      ltac_oil_temperature: formData.ltac_oil_temperature ? parseFloat(formData.ltac_oil_temperature) : null,
      ltac_grid_fail_time: formData.ltac_grid_fail_time || null,
      ltac_grid_resume_time: formData.ltac_grid_resume_time || null,
      ltac_supply_interruption: formData.ltac_supply_interruption || null,
      gen_total_generation: formData.gen_total_generation ? parseFloat(formData.gen_total_generation) : null,
      gen_xmer_export: formData.gen_xmer_export ? parseFloat(formData.gen_xmer_export) : null,
      gen_aux_consumption: formData.gen_aux_consumption ? parseFloat(formData.gen_aux_consumption) : null,
      gen_main_export: formData.gen_main_export ? parseFloat(formData.gen_main_export) : null,
      gen_check_export: formData.gen_check_export ? parseFloat(formData.gen_check_export) : null,
      gen_main_import: formData.gen_main_import ? parseFloat(formData.gen_main_import) : null,
      gen_check_import: formData.gen_check_import ? parseFloat(formData.gen_check_import) : null,
      gen_standby_export: formData.gen_standby_export ? parseFloat(formData.gen_standby_export) : null,
      gen_standby_import: formData.gen_standby_import ? parseFloat(formData.gen_standby_import) : null,
      remarks: formData.remarks || null,
      logged_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('transformer_logs')
      .upsert(payload, {
        onConflict: 'date,hour,transformer_number,user_id',
      });

    setIsSaving(false);

    if (error) {
      if (showToast) {
        toast({
          title: 'Error',
          description: 'Failed to save log entry',
          variant: 'destructive',
        });
      }
      return false; // Return failure status
    } else {
      setIsDirty(false); // Reset after successful save
      if (showToast) {
        toast({
          title: 'Success',
          description: 'Log entry saved successfully',
        });
      }
      // Let useEffect handle data loading when hour changes
      return true; // Return success status
    }
  };

  const handleClear = () => {
    setFormData(initialFormState);
  };

  const handleHourChange = async (hour: number) => {
    // Auto-save current hour data before switching to prevent data loss
    if (isDirty && !isFieldDisabled) {
      const saved = await saveLogEntry(false); // Save without showing toast
      if (!saved) {
        // Save failed - show error and don't switch hours
        toast({
          title: 'Save Failed',
          description: 'Please fix any errors before switching hours',
          variant: 'destructive',
        });
        return; // Don't switch hours
      }
    }
    
    setIsDirty(false); // Reset dirty flag before switching hours
    setSelectedHour(hour); // This will trigger useEffect to load new hour data
  };

  const updateField = (field: keyof TransformerData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true); // Mark form as dirty when user types
  };

  // Check if all required fields are filled
  const isFormComplete = () => {
    return (
      formData.frequency !== '' &&
      formData.voltage_ry !== '' &&
      formData.voltage_yb !== '' &&
      formData.voltage_rb !== '' &&
      formData.current_r !== '' &&
      formData.current_y !== '' &&
      formData.current_b !== '' &&
      formData.active_power !== '' &&
      formData.reactive_power !== '' &&
      formData.kva !== '' &&
      formData.mwh !== '' &&
      formData.mvarh !== '' &&
      formData.mvah !== '' &&
      formData.cos_phi !== '' &&
      formData.oil_temperature !== '' &&
      formData.winding_temperature !== '' &&
      formData.oil_level !== '' &&
      formData.tap_position !== '' &&
      formData.tap_counter !== '' &&
      formData.silica_gel_colour !== '' &&
      formData.ltac_current_r !== '' &&
      formData.ltac_current_y !== '' &&
      formData.ltac_current_b !== '' &&
      formData.ltac_voltage_ry !== '' &&
      formData.ltac_voltage_yb !== '' &&
      formData.ltac_voltage_rb !== '' &&
      formData.ltac_kw !== '' &&
      formData.ltac_kva !== '' &&
      formData.ltac_kvar !== '' &&
      formData.ltac_kwh !== '' &&
      formData.ltac_kvah !== '' &&
      formData.ltac_kvarh !== '' &&
      formData.ltac_oil_temperature !== '' &&
      formData.ltac_grid_fail_time !== '' &&
      formData.ltac_grid_resume_time !== '' &&
      formData.ltac_supply_interruption !== '' &&
      formData.gen_total_generation !== '' &&
      formData.gen_xmer_export !== '' &&
      formData.gen_aux_consumption !== '' &&
      formData.gen_main_export !== '' &&
      formData.gen_check_export !== '' &&
      formData.gen_main_import !== '' &&
      formData.gen_check_import !== '' &&
      formData.gen_standby_export !== '' &&
      formData.gen_standby_import !== ''
    );
  };

  const progressText = `${loggedHours.length}/24 hours logged`;

  return (
    <div className="space-y-6 pb-24">
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col space-y-2">
            <CardTitle className="text-lg sm:text-xl">Transformer Log Sheet - Power Transformer</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Gayatri Power Private Limited • {format(selectedDate, 'PPP')}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {progressText}
            </Badge>
            {isFinalized && (
              <Badge variant="destructive" className="text-xs sm:text-sm">
                Finalized - Read Only
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium">Select Hour</label>
            <Select
              value={selectedHour.toString()}
              onValueChange={(value) => handleHourChange(parseInt(value))}
            >
              <SelectTrigger className="w-full h-9 sm:h-10 text-sm">
                <SelectValue placeholder="Select hour" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                  const isFuture = isToday && hour > currentHour;
                  const isLogged = loggedHours.includes(hour);
                  const isCurrent = hour === currentHour && isToday;
                  
                  return (
                    <SelectItem 
                      key={hour} 
                      value={hour.toString()}
                      disabled={isFuture}
                      className="text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span>{hour.toString().padStart(2, '0')}:00</span>
                        {isLogged && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                        {isCurrent && <Badge variant="outline" className="text-xs ml-2">Current</Badge>}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <Accordion type="multiple" defaultValue={['ptr', 'ltac', 'generation']} className="space-y-3 sm:space-y-4">
            <AccordionItem value="ptr" className="border rounded-lg">
              <AccordionTrigger className="px-3 sm:px-4 py-2 sm:py-3 hover:no-underline">
                <h3 className="text-sm sm:text-base font-semibold">
                  PTR Feeder (3.2 MVA, 33 KV / 3.3 KV)
                </h3>
              </AccordionTrigger>
              <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 sm:space-y-3">
                <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Current Readings</div>
                <InputRow label="R Phase Current" value={formData.current_r} onChange={(v) => updateField('current_r', v)} disabled={isFieldDisabled} unit="A" />
                <InputRow label="Y Phase Current" value={formData.current_y} onChange={(v) => updateField('current_y', v)} disabled={isFieldDisabled} unit="A" />
                <InputRow label="B Phase Current" value={formData.current_b} onChange={(v) => updateField('current_b', v)} disabled={isFieldDisabled} unit="A" />
                
                <div className="text-sm font-medium text-muted-foreground mb-2 mt-4">Voltage Readings</div>
                <InputRow label="RY Phase Voltage" value={formData.voltage_ry} onChange={(v) => updateField('voltage_ry', v)} disabled={isFieldDisabled} unit="V" />
                <InputRow label="YB Phase Voltage" value={formData.voltage_yb} onChange={(v) => updateField('voltage_yb', v)} disabled={isFieldDisabled} unit="V" />
                <InputRow label="RB Phase Voltage" value={formData.voltage_rb} onChange={(v) => updateField('voltage_rb', v)} disabled={isFieldDisabled} unit="V" />
                
                <div className="text-sm font-medium text-muted-foreground mb-2 mt-4">Power Measurements</div>
                <InputRow label="Active Power" value={formData.active_power} onChange={(v) => updateField('active_power', v)} disabled={isFieldDisabled} unit="kW" />
                <InputRow label="Reactive Power" value={formData.reactive_power} onChange={(v) => updateField('reactive_power', v)} disabled={isFieldDisabled} unit="kVAR" />
                <InputRow label="Apparent Power" value={formData.kva} onChange={(v) => updateField('kva', v)} disabled={isFieldDisabled} unit="kVA" />
                <InputRow label="MWH" value={formData.mwh} onChange={(v) => updateField('mwh', v)} disabled={isFieldDisabled} />
                <InputRow label="MVARH" value={formData.mvarh} onChange={(v) => updateField('mvarh', v)} disabled={isFieldDisabled} />
                <InputRow label="MVAH" value={formData.mvah} onChange={(v) => updateField('mvah', v)} disabled={isFieldDisabled} />
                <InputRow label="COS Phi" value={formData.cos_phi} onChange={(v) => updateField('cos_phi', v)} disabled={isFieldDisabled} />
                <InputRow label="Frequency" value={formData.frequency} onChange={(v) => updateField('frequency', v)} disabled={isFieldDisabled} unit="Hz" />
                
                <div className="text-sm font-medium text-muted-foreground mb-2 mt-4">Temperature & Status</div>
                <InputRow label="Winding Temperature" value={formData.winding_temperature} onChange={(v) => updateField('winding_temperature', v)} disabled={isFieldDisabled} unit="°C" />
                <InputRow label="Oil Temperature" value={formData.oil_temperature} onChange={(v) => updateField('oil_temperature', v)} disabled={isFieldDisabled} unit="°C" />
                <InputRow label="Oil Level" value={formData.oil_level} onChange={(v) => updateField('oil_level', v)} disabled={isFieldDisabled} type="text" />
                <InputRow label="Tap Position" value={formData.tap_position} onChange={(v) => updateField('tap_position', v)} disabled={isFieldDisabled} type="text" />
                <InputRow label="Tap Counter" value={formData.tap_counter} onChange={(v) => updateField('tap_counter', v)} disabled={isFieldDisabled} />
                <InputRow label="Silica Gel Colour" value={formData.silica_gel_colour} onChange={(v) => updateField('silica_gel_colour', v)} disabled={isFieldDisabled} type="text" placeholder="Color" />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ltac" className="border rounded-lg">
              <AccordionTrigger className="px-3 sm:px-4 py-2 sm:py-3 hover:no-underline">
                <h3 className="text-sm sm:text-base font-semibold">
                  LTAC Feeder (100 KVA, 33 KV / 0.433 KV)
                </h3>
              </AccordionTrigger>
              <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 sm:space-y-3">
                <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Current Readings</div>
                <InputRow label="R Phase Current" value={formData.ltac_current_r} onChange={(v) => updateField('ltac_current_r', v)} disabled={isFieldDisabled} unit="A" />
                <InputRow label="Y Phase Current" value={formData.ltac_current_y} onChange={(v) => updateField('ltac_current_y', v)} disabled={isFieldDisabled} unit="A" />
                <InputRow label="B Phase Current" value={formData.ltac_current_b} onChange={(v) => updateField('ltac_current_b', v)} disabled={isFieldDisabled} unit="A" />
                
                <div className="text-sm font-medium text-muted-foreground mb-2 mt-4">Voltage Readings</div>
                <InputRow label="RY Phase Voltage" value={formData.ltac_voltage_ry} onChange={(v) => updateField('ltac_voltage_ry', v)} disabled={isFieldDisabled} unit="V" />
                <InputRow label="YB Phase Voltage" value={formData.ltac_voltage_yb} onChange={(v) => updateField('ltac_voltage_yb', v)} disabled={isFieldDisabled} unit="V" />
                <InputRow label="RB Phase Voltage" value={formData.ltac_voltage_rb} onChange={(v) => updateField('ltac_voltage_rb', v)} disabled={isFieldDisabled} unit="V" />
                
                <div className="text-sm font-medium text-muted-foreground mb-2 mt-4">Power Measurements</div>
                <InputRow label="Active Power" value={formData.ltac_kw} onChange={(v) => updateField('ltac_kw', v)} disabled={isFieldDisabled} unit="kW" />
                <InputRow label="Apparent Power" value={formData.ltac_kva} onChange={(v) => updateField('ltac_kva', v)} disabled={isFieldDisabled} unit="kVA" />
                <InputRow label="Reactive Power" value={formData.ltac_kvar} onChange={(v) => updateField('ltac_kvar', v)} disabled={isFieldDisabled} unit="kVAR" />
                <InputRow label="KWH" value={formData.ltac_kwh} onChange={(v) => updateField('ltac_kwh', v)} disabled={isFieldDisabled} />
                <InputRow label="KVAH" value={formData.ltac_kvah} onChange={(v) => updateField('ltac_kvah', v)} disabled={isFieldDisabled} />
                <InputRow label="KVARH" value={formData.ltac_kvarh} onChange={(v) => updateField('ltac_kvarh', v)} disabled={isFieldDisabled} type="number" />
                
                <div className="text-sm font-medium text-muted-foreground mb-2 mt-4">Temperature & Grid Status</div>
                <InputRow label="Oil Temperature" value={formData.ltac_oil_temperature} onChange={(v) => updateField('ltac_oil_temperature', v)} disabled={isFieldDisabled} unit="°C" />
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <label className="text-xs sm:text-sm font-medium text-foreground sm:w-36 md:w-40 flex-shrink-0">
                    Grid Fail Time
                  </label>
                  <div className="flex-1">
                    <TimePicker
                      value={formData.ltac_grid_fail_time}
                      onChange={(v) => updateField('ltac_grid_fail_time', v)}
                      disabled={isFieldDisabled}
                      placeholder="Select fail time"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <label className="text-xs sm:text-sm font-medium text-foreground sm:w-36 md:w-40 flex-shrink-0">
                    Grid Resume Time
                  </label>
                  <div className="flex-1">
                    <TimePicker
                      value={formData.ltac_grid_resume_time}
                      onChange={(v) => updateField('ltac_grid_resume_time', v)}
                      disabled={isFieldDisabled}
                      placeholder="Select resume time"
                    />
                  </div>
                </div>
                
                <InputRow label="Supply Interruption" value={formData.ltac_supply_interruption} onChange={(v) => updateField('ltac_supply_interruption', v)} disabled={isFieldDisabled} type="text" />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="generation" className="border rounded-lg">
              <AccordionTrigger className="px-3 sm:px-4 py-2 sm:py-3 hover:no-underline">
                <h3 className="text-sm sm:text-base font-semibold">
                  Generation Details
                </h3>
              </AccordionTrigger>
              <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 sm:space-y-3">
                <InputRow label="Total Generation" value={formData.gen_total_generation} onChange={(v) => updateField('gen_total_generation', v)} disabled={isFieldDisabled} />
                <InputRow label="X'MER Export" value={formData.gen_xmer_export} onChange={(v) => updateField('gen_xmer_export', v)} disabled={isFieldDisabled} />
                <InputRow label="AUX Consumption" value={formData.gen_aux_consumption} onChange={(v) => updateField('gen_aux_consumption', v)} disabled={isFieldDisabled} />
                <InputRow label="GPL Main Export" value={formData.gen_main_export} onChange={(v) => updateField('gen_main_export', v)} disabled={isFieldDisabled} />
                <InputRow label="GPL Check Export" value={formData.gen_check_export} onChange={(v) => updateField('gen_check_export', v)} disabled={isFieldDisabled} type="number" />
                <InputRow label="GPL Main Import" value={formData.gen_main_import} onChange={(v) => updateField('gen_main_import', v)} disabled={isFieldDisabled} />
                <InputRow label="GPL Check Import" value={formData.gen_check_import} onChange={(v) => updateField('gen_check_import', v)} disabled={isFieldDisabled} />
                <InputRow label="GPL Standby Export" value={formData.gen_standby_export} onChange={(v) => updateField('gen_standby_export', v)} disabled={isFieldDisabled} />
                <InputRow label="GPL Standby Import" value={formData.gen_standby_import} onChange={(v) => updateField('gen_standby_import', v)} disabled={isFieldDisabled} type="number" />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="space-y-2 mt-4 sm:mt-6">
            <label className="text-xs sm:text-sm font-medium">Remarks</label>
            <Textarea
              value={formData.remarks}
              onChange={(e) => updateField('remarks', e.target.value)}
              disabled={isFieldDisabled}
              placeholder="Add any observations or notes..."
              className="min-h-[60px] sm:min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-40 px-3 sm:px-4 py-2 sm:py-3">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              disabled={isFieldDisabled}
              className="flex-1 sm:flex-none sm:min-w-[140px] h-9 sm:h-10 text-xs sm:text-sm"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Delete Data
            </Button>
            
            <Button
              size="sm"
              onClick={() => saveLogEntry(true)}
              disabled={isSaving || isFieldDisabled || !isFormComplete()}
              className="flex-1 sm:flex-none sm:min-w-[140px] h-9 sm:h-10 text-xs sm:text-sm bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
            >
              <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {isSaving ? 'Logging...' : 'Log Entry'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
