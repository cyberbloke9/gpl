import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NumericInput } from '../checklist/NumericInput';

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

export const TransformerLogForm = () => {
  const { toast } = useToast();
  const [transformerNumber, setTransformerNumber] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  const [selectedHour, setSelectedHour] = useState<number>(new Date().getHours());
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentHour(now.getHours());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const updateField = (field: keyof TransformerData, value: number | string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogEntry = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('transformer_logs')
        .upsert({
          transformer_number: transformerNumber,
          date: format(selectedDate, 'yyyy-MM-dd'),
          hour: selectedHour,
          user_id: user.id,
          ...formData,
        }, {
          onConflict: 'transformer_number,date,hour',
        });

      if (error) throw error;

      toast({
        title: 'Entry Logged',
        description: `Transformer ${transformerNumber} - Hour ${selectedHour}:00 saved successfully`,
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
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
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
            <p className="text-sm text-muted-foreground mt-1">
              Current Time: {format(new Date(), 'PPpp')} | Current Hour: {currentHour}:00
            </p>
          </div>
        </div>

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
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}:00
                  </SelectItem>
                ))}
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
          />

          <NumericInput
            label="Voltage R"
            value={formData.voltage_r}
            onChange={(v) => updateField('voltage_r', v)}
            range={{ min: 10000, max: 12000 }}
            unit="V"
          />

          <NumericInput
            label="Voltage Y"
            value={formData.voltage_y}
            onChange={(v) => updateField('voltage_y', v)}
            range={{ min: 10000, max: 12000 }}
            unit="V"
          />

          <NumericInput
            label="Voltage B"
            value={formData.voltage_b}
            onChange={(v) => updateField('voltage_b', v)}
            range={{ min: 10000, max: 12000 }}
            unit="V"
          />

          <NumericInput
            label="Current R"
            value={formData.current_r}
            onChange={(v) => updateField('current_r', v)}
            range={{ min: 0, max: 500 }}
            unit="A"
          />

          <NumericInput
            label="Current Y"
            value={formData.current_y}
            onChange={(v) => updateField('current_y', v)}
            range={{ min: 0, max: 500 }}
            unit="A"
          />

          <NumericInput
            label="Current B"
            value={formData.current_b}
            onChange={(v) => updateField('current_b', v)}
            range={{ min: 0, max: 500 }}
            unit="A"
          />

          <NumericInput
            label="Active Power"
            value={formData.active_power}
            onChange={(v) => updateField('active_power', v)}
            range={{ min: 0, max: 5000 }}
            unit="kW"
          />

          <NumericInput
            label="Reactive Power"
            value={formData.reactive_power}
            onChange={(v) => updateField('reactive_power', v)}
            range={{ min: -2000, max: 2000 }}
            unit="kVAR"
          />

          <NumericInput
            label="Winding Temperature"
            value={formData.winding_temperature}
            onChange={(v) => updateField('winding_temperature', v)}
            range={{ min: 0, max: 100 }}
            unit="°C"
          />

          <NumericInput
            label="Oil Temperature"
            value={formData.oil_temperature}
            onChange={(v) => updateField('oil_temperature', v)}
            range={{ min: 0, max: 100 }}
            unit="°C"
          />
        </div>

        <div>
          <Label>Remarks (Optional)</Label>
          <Textarea
            value={formData.remarks}
            onChange={(e) => updateField('remarks', e.target.value)}
            placeholder="Any observations or notes..."
            rows={3}
          />
        </div>

        <Button
          onClick={handleLogEntry}
          disabled={saving}
          size="lg"
          className="w-full"
        >
          {saving ? 'Logging Entry...' : 'Log Entry'}
        </Button>
      </div>
    </Card>
  );
};