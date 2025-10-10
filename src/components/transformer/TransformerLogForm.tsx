import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, Zap, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NumericInput } from '../checklist/NumericInput';
import { IssueFlagger } from '../checklist/IssueFlagger';

interface TransformerData {
  frequency: number;
  voltage_r: number;
  voltage_y: number;
  voltage_b: number;
  current_r: number;
  current_y: number;
  current_b: number;
  active_power: number;
  reactive_power: number;
  winding_temperature: number;
  oil_temperature: number;
  remarks: string;
}

interface TransformerLogFormProps {
  isFinalized?: boolean;
  onDateChange?: (date: string) => void;
  onFinalizeDay?: (transformerNumber: number) => Promise<void>;
}

export const TransformerLogForm = ({ isFinalized = false, onDateChange, onFinalizeDay }: TransformerLogFormProps) => {
  const { toast } = useToast();
  const [transformerNumber, setTransformerNumber] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  const [selectedHour, setSelectedHour] = useState<number>(new Date().getHours());
  const [saving, setSaving] = useState(false);
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);
  const [loggedHours, setLoggedHours] = useState<{
    transformer1: number[];
    transformer2: number[];
  }>({ transformer1: [], transformer2: [] });
  const [pendingIssues, setPendingIssues] = useState<Array<{
    module: string;
    section: string;
    item: string;
    unit?: string;
    severity: string;
    description: string;
  }>>([]);

  const [formData, setFormData] = useState<TransformerData>({
    frequency: 0,
    voltage_r: 0,
    voltage_y: 0,
    voltage_b: 0,
    current_r: 0,
    current_y: 0,
    current_b: 0,
    active_power: 0,
    reactive_power: 0,
    winding_temperature: 0,
    oil_temperature: 0,
    remarks: '',
  });

  // Load logged hours for selected date
  const loadLoggedHours = async () => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('transformer_logs')
      .select('id, transformer_number, hour')
      .eq('date', format(selectedDate, 'yyyy-MM-dd'))
      .eq('transformer_number', transformerNumber)
      .eq('hour', selectedHour)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setCurrentLogId(data.id);
    } else {
      setCurrentLogId(null);
    }

    // Also load all logged hours for the day - FOR THIS USER ONLY
    const { data: allLogs, error: logsError } = await supabase
      .from('transformer_logs')
      .select('transformer_number, hour')
      .eq('date', format(selectedDate, 'yyyy-MM-dd'))
      .eq('user_id', user.id);

    if (!logsError && allLogs) {
      const t1Hours = allLogs.filter(d => d.transformer_number === 1).map(d => d.hour);
      const t2Hours = allLogs.filter(d => d.transformer_number === 2).map(d => d.hour);
      setLoggedHours({ transformer1: t1Hours, transformer2: t2Hours });
    }
  };

  // Update current hour every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentHour(now.getHours());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Load logged hours when date or transformer changes
  useEffect(() => {
    loadLoggedHours();
    if (onDateChange) {
      onDateChange(format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate, transformerNumber, selectedHour]);

  // Check if current selection is already logged
  const currentTransformerKey = `transformer${transformerNumber}` as keyof typeof loggedHours;
  const isCurrentHourLogged = loggedHours[currentTransformerKey].includes(selectedHour);
  const isFormDisabled = isCurrentHourLogged || isFinalized;

  const updateField = (field: keyof TransformerData, value: number | string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormComplete = () => {
    return formData.frequency > 0 &&
           formData.voltage_r > 0 &&
           formData.voltage_y > 0 &&
           formData.voltage_b > 0 &&
           formData.current_r > 0 &&
           formData.current_y > 0 &&
           formData.current_b > 0 &&
           formData.active_power > 0 &&
           formData.reactive_power > 0 &&
           formData.oil_temperature > 0 &&
           formData.winding_temperature > 0;
  };

  // Save log entry (supports both complete and partial saves)
  const saveLogEntry = async (skipValidation: boolean = false): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!skipValidation && !isFormComplete()) {
        toast({
          title: 'Incomplete Form',
          description: 'Please fill in all required fields before logging',
          variant: 'destructive'
        });
        return null;
      }

      // Security: Validate remarks field for XSS patterns
      const dangerousPatterns = /<script|javascript:|onerror=|onload=|<iframe|eval\(|onclick=/i;
      if (formData.remarks && dangerousPatterns.test(formData.remarks)) {
        toast({
          title: 'Invalid content',
          description: 'Remarks contain disallowed content',
          variant: 'destructive'
        });
        return null;
      }

      const { data, error } = await supabase
        .from('transformer_logs')
        .upsert({
          transformer_number: transformerNumber,
          date: format(selectedDate, 'yyyy-MM-dd'),
          hour: selectedHour,
          user_id: user.id,
          ...formData,
        }, {
          onConflict: 'transformer_number,date,hour',
        })
        .select('id')
        .single();

      if (error) throw error;

      if (!skipValidation) {
        toast({
          title: 'Entry Logged',
          description: `Transformer ${transformerNumber} - Hour ${selectedHour}:00 saved successfully`,
        });

        // Reload logged hours
        await loadLoggedHours();
        
        // Calculate and show daily progress
        const updatedHours = transformerNumber === 1 
          ? [...loggedHours.transformer1, selectedHour]
          : [...loggedHours.transformer2, selectedHour];
        const progress = Math.round((updatedHours.length / 24) * 100);
        
        toast({
          title: `Daily Progress: ${progress}%`,
          description: `${updatedHours.length}/24 hours logged for Transformer ${transformerNumber}`,
        });

        // Reset form
        setFormData({
          frequency: 0,
          voltage_r: 0,
          voltage_y: 0,
          voltage_b: 0,
          current_r: 0,
          current_y: 0,
          current_b: 0,
          active_power: 0,
          reactive_power: 0,
          winding_temperature: 0,
          oil_temperature: 0,
          remarks: '',
        });
      }

      return data?.id || null;
    } catch (error: any) {
      if (!skipValidation) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
      return null;
    }
  };

  const savePendingIssues = async (transformerLogId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const issues = pendingIssues.map(issue => ({
      ...issue,
      transformer_log_id: transformerLogId,
      user_id: user.id,
      issue_code: `TRF-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Date.now().toString().slice(-4)}`,
      status: 'reported' as const
    }));

    const { error } = await supabase.from('flagged_issues').insert(issues);
    if (!error) {
      toast({
        title: 'Issues Saved',
        description: `${issues.length} flagged issue(s) saved successfully`
      });
    }
  };

  const handleLogEntry = async () => {
    setSaving(true);
    const logId = await saveLogEntry(false);
    
    // Save pending issues if we have any and got a valid log ID
    if (logId && pendingIssues.length > 0) {
      await savePendingIssues(logId);
      setPendingIssues([]); // Clear pending issues
    }
    
    setSaving(false);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Transformer Hourly Log
            </h2>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Current Time: {format(new Date(), 'PPpp')} | Current Hour: {currentHour}:00
            </p>
          </div>
        </div>

        {/* Status Alert */}
        {isCurrentHourLogged && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Hour {selectedHour}:00 already logged for Transformer {transformerNumber}. 
              Select a different hour or transformer to continue.
            </AlertDescription>
          </Alert>
        )}

        {/* Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Transformer Number</Label>
            <Select value={transformerNumber.toString()} onValueChange={(v) => setTransformerNumber(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Transformer 1</SelectItem>
                <SelectItem value="2">Transformer 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => 
                    date > new Date() || 
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Hour</Label>
            <Select value={selectedHour.toString()} onValueChange={(v) => setSelectedHour(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                  const isLogged = loggedHours[currentTransformerKey].includes(hour);
                  const isCurrentDate = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  const isPast = isCurrentDate && hour < currentHour;
                  const isFuture = isCurrentDate && hour > currentHour;
                  const isDisabled = isLogged || isPast;
                  
                  return (
                    <SelectItem 
                      key={hour} 
                      value={hour.toString()}
                      disabled={isDisabled}
                    >
                      <div className="flex items-center gap-2">
                        {isLogged && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                        {hour.toString().padStart(2, '0')}:00
                        {isPast && !isLogged && <span className="text-xs text-red-500">(missed)</span>}
                        {isFuture && <span className="text-xs text-muted-foreground">(upcoming)</span>}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Measurement Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NumericInput
            label="Frequency"
            value={formData.frequency}
            onChange={(v) => updateField('frequency', v)}
            range={{ min: 49.5, max: 50.5 }}
            unit="Hz"
            required
            disabled={isFormDisabled}
            transformerLogId={currentLogId || 'pending'}
            module="Transformer Logs"
            section={`Transformer ${transformerNumber}`}
            item={`Frequency - Hour ${selectedHour}`}
          />

          <NumericInput
            label="Voltage R"
            value={formData.voltage_r}
            onChange={(v) => updateField('voltage_r', v)}
            range={{ min: 10000, max: 12000 }}
            unit="V"
            disabled={isFormDisabled}
            transformerLogId={currentLogId || 'pending'}
            module="Transformer Logs"
            section={`Transformer ${transformerNumber}`}
            item={`Voltage R - Hour ${selectedHour}`}
          />

          <NumericInput
            label="Voltage Y"
            value={formData.voltage_y}
            onChange={(v) => updateField('voltage_y', v)}
            range={{ min: 10000, max: 12000 }}
            unit="V"
            disabled={isFormDisabled}
            transformerLogId={currentLogId || 'pending'}
            module="Transformer Logs"
            section={`Transformer ${transformerNumber}`}
            item={`Voltage Y - Hour ${selectedHour}`}
          />

          <NumericInput
            label="Voltage B"
            value={formData.voltage_b}
            onChange={(v) => updateField('voltage_b', v)}
            range={{ min: 10000, max: 12000 }}
            unit="V"
            disabled={isFormDisabled}
            transformerLogId={currentLogId || 'pending'}
            module="Transformer Logs"
            section={`Transformer ${transformerNumber}`}
            item={`Voltage B - Hour ${selectedHour}`}
          />

          <NumericInput
            label="Current R"
            value={formData.current_r}
            onChange={(v) => updateField('current_r', v)}
            range={{ min: 0, max: 500 }}
            unit="A"
            disabled={isFormDisabled}
            transformerLogId={currentLogId || 'pending'}
            module="Transformer Logs"
            section={`Transformer ${transformerNumber}`}
            item={`Current R - Hour ${selectedHour}`}
          />

          <NumericInput
            label="Current Y"
            value={formData.current_y}
            onChange={(v) => updateField('current_y', v)}
            range={{ min: 0, max: 500 }}
            unit="A"
            disabled={isFormDisabled}
            transformerLogId={currentLogId || 'pending'}
            module="Transformer Logs"
            section={`Transformer ${transformerNumber}`}
            item={`Current Y - Hour ${selectedHour}`}
          />

          <NumericInput
            label="Current B"
            value={formData.current_b}
            onChange={(v) => updateField('current_b', v)}
            range={{ min: 0, max: 500 }}
            unit="A"
            disabled={isFormDisabled}
            transformerLogId={currentLogId || 'pending'}
            module="Transformer Logs"
            section={`Transformer ${transformerNumber}`}
            item={`Current B - Hour ${selectedHour}`}
          />

          <NumericInput
            label="Active Power"
            value={formData.active_power}
            onChange={(v) => updateField('active_power', v)}
            range={{ min: 0, max: 5000 }}
            unit="kW"
            disabled={isFormDisabled}
            transformerLogId={currentLogId || 'pending'}
            module="Transformer Logs"
            section={`Transformer ${transformerNumber}`}
            item={`Active Power - Hour ${selectedHour}`}
          />

          <NumericInput
            label="Reactive Power"
            value={formData.reactive_power}
            onChange={(v) => updateField('reactive_power', v)}
            range={{ min: -2000, max: 2000 }}
            unit="kVAR"
            disabled={isFormDisabled}
            transformerLogId={currentLogId || 'pending'}
            module="Transformer Logs"
            section={`Transformer ${transformerNumber}`}
            item={`Reactive Power - Hour ${selectedHour}`}
          />

          <NumericInput
            label="Winding Temperature"
            value={formData.winding_temperature}
            onChange={(v) => updateField('winding_temperature', v)}
            range={{ min: 0, max: 100 }}
            unit="°C"
            disabled={isFormDisabled}
            transformerLogId={currentLogId || 'pending'}
            module="Transformer Logs"
            section={`Transformer ${transformerNumber}`}
            item={`Winding Temperature - Hour ${selectedHour}`}
          />

          <NumericInput
            label="Oil Temperature"
            value={formData.oil_temperature}
            onChange={(v) => updateField('oil_temperature', v)}
            range={{ min: 0, max: 100 }}
            unit="°C"
            disabled={isFormDisabled}
            transformerLogId={currentLogId || 'pending'}
            module="Transformer Logs"
            section={`Transformer ${transformerNumber}`}
            item={`Oil Temperature - Hour ${selectedHour}`}
          />
        </div>

            <div>
              <Label>Remarks (Optional)</Label>
              <Textarea
                value={formData.remarks}
                onChange={(e) => updateField('remarks', e.target.value)}
                placeholder="Any observations or notes..."
                rows={3}
                disabled={isFormDisabled}
              />
              <div className="mt-2 space-y-2">
                <IssueFlagger
                  transformerLogId={currentLogId || 'pending'}
                  module="Transformer Logs"
                  section={`Transformer ${transformerNumber}`}
                  item={`Remarks - Hour ${selectedHour}`}
                  disabled={isFormDisabled}
                  onPendingIssue={(issue) => setPendingIssues(prev => [...prev, issue])}
                />
                {pendingIssues.length > 0 && (
                  <p className="text-xs text-amber-600">
                    {pendingIssues.length} pending issue(s) will be saved with the log entry
                  </p>
                )}
              </div>
            </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleLogEntry}
            disabled={saving || isFormDisabled || !isFormComplete()}
            className="flex-1"
            size="lg"
          >
            {saving ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isCurrentHourLogged ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Hour {selectedHour} Already Logged
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Log Entry for Hour {selectedHour}
              </>
            )}
          </Button>
          
          {onFinalizeDay && !isFinalized && loggedHours[currentTransformerKey].length === 24 && (
            <Button
              onClick={() => onFinalizeDay(transformerNumber)}
              variant="outline"
              className="border-orange-500 text-orange-700 hover:bg-orange-50"
              size="lg"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Finalize Day
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};