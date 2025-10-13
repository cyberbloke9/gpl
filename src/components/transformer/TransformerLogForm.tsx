import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { TransformerHeader } from './TransformerHeader';
import { HourGrid } from './HourGrid';
import { InputRow } from './InputRow';
import { ActionBar } from './ActionBar';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Helper function to get transformer name
const getTransformerName = (number: number): string => {
  return number === 1 ? 'Power Transformer' : 'Auxiliary Transformer';
};

interface TransformerData {
  // PTR Feeder (3.2 MVA) - 20 fields
  current_r: string;
  current_y: string;
  current_b: string;
  voltage_ry: string;
  voltage_yb: string;
  voltage_rb: string;
  active_power: string;
  reactive_power: string;
  kva: string;
  mwh: string;
  mvarh: string;
  mvah: string;
  cos_phi: string;
  frequency: string;
  winding_temperature: string;
  oil_temperature: string;
  oil_level: string;
  tap_position: string;
  tap_counter: string;
  silica_gel_colour: string;
  
  // LTAC Feeder (100 KVA) - 16 fields
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
  
  // Generation Details - 9 fields
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
  current_r: '', current_y: '', current_b: '',
  voltage_ry: '', voltage_yb: '', voltage_rb: '',
  active_power: '', reactive_power: '', kva: '',
  mwh: '', mvarh: '', mvah: '',
  cos_phi: '', frequency: '',
  winding_temperature: '', oil_temperature: '',
  oil_level: '', tap_position: '', tap_counter: '',
  silica_gel_colour: '',
  ltac_current_r: '', ltac_current_y: '', ltac_current_b: '',
  ltac_voltage_ry: '', ltac_voltage_yb: '', ltac_voltage_rb: '',
  ltac_kw: '', ltac_kva: '', ltac_kvar: '',
  ltac_kwh: '', ltac_kvah: '', ltac_kvarh: '',
  ltac_oil_temperature: '',
  ltac_grid_fail_time: '', ltac_grid_resume_time: '',
  ltac_supply_interruption: '',
  gen_total_generation: '', gen_xmer_export: '', gen_aux_consumption: '',
  gen_main_export: '', gen_check_export: '',
  gen_main_import: '', gen_check_import: '',
  gen_standby_export: '', gen_standby_import: '',
  remarks: '',
};

interface TransformerLogFormProps {
  isFinalized: boolean;
  onDateChange: (date: string) => void;
  onFinalizeDay: (transformerNumber: number) => void;
}

export function TransformerLogForm({ isFinalized, onDateChange, onFinalizeDay }: TransformerLogFormProps) {
  const { user } = useAuth();
  const [transformerNumber, setTransformerNumber] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState<number>(new Date().getHours());
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  const [formData, setFormData] = useState<TransformerData>(initialFormState);
  const [loggedHours, setLoggedHours] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateString === format(new Date(), 'yyyy-MM-dd');
  const isPastHour = isToday && selectedHour < currentHour;
  const isCurrentHour = isToday && selectedHour === currentHour;
  const isFormDisabled = isFinalized || isPastHour;

  // Load logged hours and data for selected hour
  useEffect(() => {
    loadHourData();
  }, [selectedDate, selectedHour, transformerNumber, user]);

  // Update current hour every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newHour = new Date().getHours();
      if (newHour !== currentHour) {
        setCurrentHour(newHour);
        if (isToday && selectedHour === currentHour) {
          setSelectedHour(newHour);
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [currentHour, isToday, selectedHour]);

  const loadHourData = async () => {
    if (!user) return;

    // Load all logged hours for the day
    const { data: dayLogs } = await supabase
      .from('transformer_logs')
      .select('hour')
      .eq('date', dateString)
      .eq('transformer_number', transformerNumber)
      .eq('user_id', user.id);

    if (dayLogs) {
      setLoggedHours(dayLogs.map(log => log.hour));
    }

    // Load data for selected hour
    const { data: hourData } = await supabase
      .from('transformer_logs')
      .select('*')
      .eq('date', dateString)
      .eq('hour', selectedHour)
      .eq('transformer_number', transformerNumber)
      .eq('user_id', user.id)
      .maybeSingle();

    if (hourData) {
      setFormData({
        current_r: hourData.current_r?.toString() || '',
        current_y: hourData.current_y?.toString() || '',
        current_b: hourData.current_b?.toString() || '',
        voltage_ry: hourData.voltage_ry?.toString() || '',
        voltage_yb: hourData.voltage_yb?.toString() || '',
        voltage_rb: hourData.voltage_rb?.toString() || '',
        active_power: hourData.active_power?.toString() || '',
        reactive_power: hourData.reactive_power?.toString() || '',
        kva: hourData.kva?.toString() || '',
        mwh: hourData.mwh?.toString() || '',
        mvarh: hourData.mvarh?.toString() || '',
        mvah: hourData.mvah?.toString() || '',
        cos_phi: hourData.cos_phi?.toString() || '',
        frequency: hourData.frequency?.toString() || '',
        winding_temperature: hourData.winding_temperature?.toString() || '',
        oil_temperature: hourData.oil_temperature?.toString() || '',
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

  const saveLogEntry = async (silent = false) => {
    if (!user) return;

    // Validate not saving future hours
    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(selectedHour, 0, 0, 0);
    
    if (selectedDateTime > now) {
      toast({
        title: 'Invalid Hour',
        description: 'Cannot log data for future hours',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    const dataToSave = {
      user_id: user.id,
      transformer_number: transformerNumber,
      date: dateString,
      hour: selectedHour,
      current_r: formData.current_r ? parseFloat(formData.current_r) : null,
      current_y: formData.current_y ? parseFloat(formData.current_y) : null,
      current_b: formData.current_b ? parseFloat(formData.current_b) : null,
      voltage_ry: formData.voltage_ry ? parseFloat(formData.voltage_ry) : null,
      voltage_yb: formData.voltage_yb ? parseFloat(formData.voltage_yb) : null,
      voltage_rb: formData.voltage_rb ? parseFloat(formData.voltage_rb) : null,
      active_power: formData.active_power ? parseFloat(formData.active_power) : null,
      reactive_power: formData.reactive_power ? parseFloat(formData.reactive_power) : null,
      kva: formData.kva ? parseFloat(formData.kva) : null,
      mwh: formData.mwh ? parseFloat(formData.mwh) : null,
      mvarh: formData.mvarh ? parseFloat(formData.mvarh) : null,
      mvah: formData.mvah ? parseFloat(formData.mvah) : null,
      cos_phi: formData.cos_phi ? parseFloat(formData.cos_phi) : null,
      frequency: formData.frequency ? parseFloat(formData.frequency) : null,
      winding_temperature: formData.winding_temperature ? parseFloat(formData.winding_temperature) : null,
      oil_temperature: formData.oil_temperature ? parseFloat(formData.oil_temperature) : null,
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
    };

    const { error } = await supabase
      .from('transformer_logs')
      .upsert(dataToSave, {
        onConflict: 'user_id,date,hour,transformer_number',
      });

    setIsSaving(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save log entry',
        variant: 'destructive',
      });
      return;
    }

    if (!silent) {
      toast({
        title: 'Success',
        description: `${getTransformerName(transformerNumber)} - Hour ${selectedHour}:00 saved successfully`,
      });
    }

    // Reload logged hours
    loadHourData();
  };

  const handleClear = () => {
    if (window.confirm(`Clear all data for hour ${selectedHour}:00? This cannot be undone.`)) {
      setFormData(initialFormState);
      toast({
        title: 'Data Cleared',
        description: `Hour ${selectedHour}:00 data has been cleared`,
      });
    }
  };

  const handleHourChange = (hour: number) => {
    setSelectedHour(hour);
  };

  const handlePreviousHour = () => {
    if (selectedHour > 0) {
      setSelectedHour(selectedHour - 1);
    }
  };

  const handleNextHour = () => {
    const maxAllowedHour = isToday ? currentHour : 23;
    if (selectedHour < maxAllowedHour) {
      setSelectedHour(selectedHour + 1);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    onDateChange(format(date, 'yyyy-MM-dd'));
    
    // Reset to hour 0 for past dates, current hour for today
    const isNewDateToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    setSelectedHour(isNewDateToday ? new Date().getHours() : 0);
  };

  const updateField = (field: keyof TransformerData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = true; // All fields are optional

  // Auto-save
  const { status: autoSaveStatus } = useAutoSave({
    data: formData,
    onSave: () => saveLogEntry(true),
    enabled: isCurrentHour && !isFormDisabled,
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Fixed Header */}
      <TransformerHeader 
        selectedDate={selectedDate} 
        onDateChange={handleDateChange}
      />

      {/* Content with top padding for fixed header */}
      <div className="pt-32 pb-20">
        {/* Transformer Selector */}
        <div className="container mx-auto px-4 mb-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Transformer:</label>
            <Select
              value={transformerNumber.toString()}
              onValueChange={(value) => setTransformerNumber(parseInt(value))}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Power Transformer (3.2 MVA)</SelectItem>
                <SelectItem value="2">Auxiliary Transformer (100 KVA)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Hour Grid */}
        <HourGrid
          selectedHour={selectedHour}
          currentHour={currentHour}
          loggedHours={loggedHours}
          isToday={isToday}
          onHourSelect={handleHourChange}
        />

        {/* Accordion Sections */}
        <div className="container mx-auto px-4 mt-6">
          <Accordion type="multiple" defaultValue={["ptr-feeder"]} className="space-y-3">
            {/* PTR Feeder Section */}
            <AccordionItem value="ptr-feeder" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 bg-muted hover:bg-muted/80">
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="font-semibold">PTR FEEDER (3.2 MVA, 33 KV / 3.3 KV)</span>
                  <Badge variant="outline">20 fields</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-4 space-y-6">
                {/* Current Readings */}
                <div>
                  <h4 className="text-xs uppercase text-muted-foreground mb-3 font-semibold">CURRENT READINGS</h4>
                  <div className="space-y-3">
                    <InputRow label="R Phase Current" value={formData.current_r} onChange={(v) => updateField('current_r', v)} disabled={isFormDisabled} unit="A" />
                    <InputRow label="Y Phase Current" value={formData.current_y} onChange={(v) => updateField('current_y', v)} disabled={isFormDisabled} unit="A" />
                    <InputRow label="B Phase Current" value={formData.current_b} onChange={(v) => updateField('current_b', v)} disabled={isFormDisabled} unit="A" />
                  </div>
                </div>

                {/* Voltage Readings */}
                <div>
                  <h4 className="text-xs uppercase text-muted-foreground mb-3 font-semibold">VOLTAGE READINGS</h4>
                  <div className="space-y-3">
                    <InputRow label="RY Phase Voltage" value={formData.voltage_ry} onChange={(v) => updateField('voltage_ry', v)} disabled={isFormDisabled} unit="V" />
                    <InputRow label="YB Phase Voltage" value={formData.voltage_yb} onChange={(v) => updateField('voltage_yb', v)} disabled={isFormDisabled} unit="V" />
                    <InputRow label="RB Phase Voltage" value={formData.voltage_rb} onChange={(v) => updateField('voltage_rb', v)} disabled={isFormDisabled} unit="V" />
                  </div>
                </div>

                {/* Power Measurements */}
                <div>
                  <h4 className="text-xs uppercase text-muted-foreground mb-3 font-semibold">POWER MEASUREMENTS</h4>
                  <div className="space-y-3">
                    <InputRow label="KW" value={formData.active_power} onChange={(v) => updateField('active_power', v)} disabled={isFormDisabled} unit="kW" />
                    <InputRow label="KVAR" value={formData.reactive_power} onChange={(v) => updateField('reactive_power', v)} disabled={isFormDisabled} unit="kVAR" />
                    <InputRow label="KVA" value={formData.kva} onChange={(v) => updateField('kva', v)} disabled={isFormDisabled} unit="kVA" />
                    <InputRow label="MWH" value={formData.mwh} onChange={(v) => updateField('mwh', v)} disabled={isFormDisabled} unit="MWh" />
                    <InputRow label="MVARH" value={formData.mvarh} onChange={(v) => updateField('mvarh', v)} disabled={isFormDisabled} unit="MVARh" />
                    <InputRow label="MVAH" value={formData.mvah} onChange={(v) => updateField('mvah', v)} disabled={isFormDisabled} unit="MVAh" />
                    <InputRow label="COS Phi" value={formData.cos_phi} onChange={(v) => updateField('cos_phi', v)} disabled={isFormDisabled} min={0} max={1} />
                    <InputRow label="Hz" value={formData.frequency} onChange={(v) => updateField('frequency', v)} disabled={isFormDisabled} unit="Hz" />
                  </div>
                </div>

                {/* Temperature and Status */}
                <div>
                  <h4 className="text-xs uppercase text-muted-foreground mb-3 font-semibold">TEMPERATURE AND STATUS</h4>
                  <div className="space-y-3">
                    <InputRow label="Winding Temperature" value={formData.winding_temperature} onChange={(v) => updateField('winding_temperature', v)} disabled={isFormDisabled} unit="°C" />
                    <InputRow label="Oil Temperature" value={formData.oil_temperature} onChange={(v) => updateField('oil_temperature', v)} disabled={isFormDisabled} unit="°C" />
                    <InputRow label="Oil Level" value={formData.oil_level} onChange={(v) => updateField('oil_level', v)} disabled={isFormDisabled} type="text" placeholder="Enter oil level" />
                    <InputRow label="Tap Position" value={formData.tap_position} onChange={(v) => updateField('tap_position', v)} disabled={isFormDisabled} type="text" placeholder="Enter tap position" />
                    <InputRow label="Tap Counter" value={formData.tap_counter} onChange={(v) => updateField('tap_counter', v)} disabled={isFormDisabled} type="number" step="1" placeholder="0" />
                    
                    <div className="flex items-center gap-3">
                      <label className="w-36 sm:w-40 text-sm font-medium text-foreground flex-shrink-0">Silica Gel Colour</label>
                      <Select value={formData.silica_gel_colour} onValueChange={(v) => updateField('silica_gel_colour', v)} disabled={isFormDisabled}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select colour" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Blue">Blue</SelectItem>
                          <SelectItem value="Pink">Pink</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* LTAC Feeder Section */}
            <AccordionItem value="ltac-feeder" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 bg-muted hover:bg-muted/80">
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="font-semibold">LTAC FEEDER (100 KVA, 33 KV / 0.433 KV)</span>
                  <Badge variant="outline">16 fields</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-4 space-y-6">
                {/* Current Readings */}
                <div>
                  <h4 className="text-xs uppercase text-muted-foreground mb-3 font-semibold">CURRENT READINGS</h4>
                  <div className="space-y-3">
                    <InputRow label="R Phase Current" value={formData.ltac_current_r} onChange={(v) => updateField('ltac_current_r', v)} disabled={isFormDisabled} unit="A" />
                    <InputRow label="Y Phase Current" value={formData.ltac_current_y} onChange={(v) => updateField('ltac_current_y', v)} disabled={isFormDisabled} unit="A" />
                    <InputRow label="B Phase Current" value={formData.ltac_current_b} onChange={(v) => updateField('ltac_current_b', v)} disabled={isFormDisabled} unit="A" />
                  </div>
                </div>

                {/* Voltage Readings */}
                <div>
                  <h4 className="text-xs uppercase text-muted-foreground mb-3 font-semibold">VOLTAGE READINGS</h4>
                  <div className="space-y-3">
                    <InputRow label="RY Phase Voltage" value={formData.ltac_voltage_ry} onChange={(v) => updateField('ltac_voltage_ry', v)} disabled={isFormDisabled} unit="V" />
                    <InputRow label="YB Phase Voltage" value={formData.ltac_voltage_yb} onChange={(v) => updateField('ltac_voltage_yb', v)} disabled={isFormDisabled} unit="V" />
                    <InputRow label="RB Phase Voltage" value={formData.ltac_voltage_rb} onChange={(v) => updateField('ltac_voltage_rb', v)} disabled={isFormDisabled} unit="V" />
                  </div>
                </div>

                {/* Power Measurements */}
                <div>
                  <h4 className="text-xs uppercase text-muted-foreground mb-3 font-semibold">POWER MEASUREMENTS</h4>
                  <div className="space-y-3">
                    <InputRow label="KW" value={formData.ltac_kw} onChange={(v) => updateField('ltac_kw', v)} disabled={isFormDisabled} unit="kW" />
                    <InputRow label="KVA" value={formData.ltac_kva} onChange={(v) => updateField('ltac_kva', v)} disabled={isFormDisabled} unit="kVA" />
                    <InputRow label="KVAR" value={formData.ltac_kvar} onChange={(v) => updateField('ltac_kvar', v)} disabled={isFormDisabled} unit="kVAR" />
                    <InputRow label="KWH" value={formData.ltac_kwh} onChange={(v) => updateField('ltac_kwh', v)} disabled={isFormDisabled} unit="kWh" />
                    <InputRow label="KVAH" value={formData.ltac_kvah} onChange={(v) => updateField('ltac_kvah', v)} disabled={isFormDisabled} unit="kVAh" />
                    <InputRow label="KVARH" value={formData.ltac_kvarh} onChange={(v) => updateField('ltac_kvarh', v)} disabled={isFormDisabled} unit="kVARh" />
                  </div>
                </div>

                {/* Temperature and Grid Status */}
                <div>
                  <h4 className="text-xs uppercase text-muted-foreground mb-3 font-semibold">TEMPERATURE AND GRID STATUS</h4>
                  <div className="space-y-3">
                    <InputRow label="Oil Temperature" value={formData.ltac_oil_temperature} onChange={(v) => updateField('ltac_oil_temperature', v)} disabled={isFormDisabled} unit="°C" />
                    <InputRow label="Grid Fail Time" value={formData.ltac_grid_fail_time} onChange={(v) => updateField('ltac_grid_fail_time', v)} disabled={isFormDisabled} type="time" />
                    <InputRow label="Grid Resume Time" value={formData.ltac_grid_resume_time} onChange={(v) => updateField('ltac_grid_resume_time', v)} disabled={isFormDisabled} type="time" />
                    <InputRow label="Total Supply Interruption" value={formData.ltac_supply_interruption} onChange={(v) => updateField('ltac_supply_interruption', v)} disabled={isFormDisabled} type="text" placeholder="Enter duration" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Generation Details Section */}
            <AccordionItem value="generation" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 bg-muted hover:bg-muted/80">
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="font-semibold">GENERATION DETAILS</span>
                  <Badge variant="outline">9 fields</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-4 space-y-3">
                <InputRow label="Total Generation" value={formData.gen_total_generation} onChange={(v) => updateField('gen_total_generation', v)} disabled={isFormDisabled} />
                <InputRow label="X'MER Export" value={formData.gen_xmer_export} onChange={(v) => updateField('gen_xmer_export', v)} disabled={isFormDisabled} />
                <InputRow label="AUX. Consumption" value={formData.gen_aux_consumption} onChange={(v) => updateField('gen_aux_consumption', v)} disabled={isFormDisabled} />
                <InputRow label="GPL Main Export" value={formData.gen_main_export} onChange={(v) => updateField('gen_main_export', v)} disabled={isFormDisabled} />
                <InputRow label="GPL Check Export" value={formData.gen_check_export} onChange={(v) => updateField('gen_check_export', v)} disabled={isFormDisabled} />
                <InputRow label="GPL Main Import" value={formData.gen_main_import} onChange={(v) => updateField('gen_main_import', v)} disabled={isFormDisabled} />
                <InputRow label="GPL Check Import" value={formData.gen_check_import} onChange={(v) => updateField('gen_check_import', v)} disabled={isFormDisabled} />
                <InputRow label="GPL Standby Export" value={formData.gen_standby_export} onChange={(v) => updateField('gen_standby_export', v)} disabled={isFormDisabled} />
                <InputRow label="GPL Standby Import" value={formData.gen_standby_import} onChange={(v) => updateField('gen_standby_import', v)} disabled={isFormDisabled} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Remarks */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Remarks</label>
            <Textarea
              value={formData.remarks}
              onChange={(e) => updateField('remarks', e.target.value)}
              disabled={isFormDisabled}
              placeholder="Enter any additional notes or observations..."
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>

      {/* Fixed Action Bar */}
      <ActionBar
        selectedHour={selectedHour}
        onPreviousHour={handlePreviousHour}
        onNextHour={handleNextHour}
        onSave={() => saveLogEntry(false)}
        onClear={handleClear}
        isSaving={isSaving}
        isFormValid={isFormValid}
        isNextHourDisabled={isToday && selectedHour >= currentHour}
        autoSaveStatus={autoSaveStatus}
      />
    </div>
  );
}
