import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface TransformerData {
  voltage_ry: number;
  voltage_yb: number;
  voltage_rb: number;
  current_r: number;
  current_y: number;
  current_b: number;
  frequency: number;
  active_power: number;
  reactive_power: number;
  oil_temperature: number;
  winding_temperature: number;
  remarks: string;
}

interface TransformerHourlyGridProps {
  transformerNumber: 1 | 2;
  date: Date;
}

const emptyData: TransformerData = {
  voltage_ry: 0,
  voltage_yb: 0,
  voltage_rb: 0,
  current_r: 0,
  current_y: 0,
  current_b: 0,
  frequency: 0,
  active_power: 0,
  reactive_power: 0,
  oil_temperature: 0,
  winding_temperature: 0,
  remarks: '',
};

export const TransformerHourlyGrid = ({ transformerNumber, date }: TransformerHourlyGridProps) => {
  const { user } = useAuth();
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [hourlyData, setHourlyData] = useState<Record<number, TransformerData>>({});
  const [savedHours, setSavedHours] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadHourlyData();
    
    // Update current hour every minute
    const timer = setInterval(() => {
      const newHour = new Date().getHours();
      if (newHour !== currentHour) {
        setCurrentHour(newHour);
        autoSavePreviousHour(currentHour);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [date, transformerNumber]);

  const loadHourlyData = async () => {
    if (!user) return;

    const dateStr = date.toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('transformer_logs')
      .select('*')
      .eq('transformer_number', transformerNumber)
      .eq('date', dateStr)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading transformer data:', error);
      return;
    }

    if (data) {
      const loaded: Record<number, TransformerData> = {};
      const saved = new Set<number>();
      
      data.forEach((log) => {
        loaded[log.hour] = {
          voltage_ry: log.voltage_ry || 0,
          voltage_yb: log.voltage_yb || 0,
          voltage_rb: log.voltage_rb || 0,
          current_r: log.current_r || 0,
          current_y: log.current_y || 0,
          current_b: log.current_b || 0,
          frequency: log.frequency || 0,
          active_power: log.active_power || 0,
          reactive_power: log.reactive_power || 0,
          oil_temperature: log.oil_temperature || 0,
          winding_temperature: log.winding_temperature || 0,
          remarks: log.remarks || '',
        };
        saved.add(log.hour);
      });

      setHourlyData(loaded);
      setSavedHours(saved);
    }
  };

  const autoSavePreviousHour = async (hour: number) => {
    if (savedHours.has(hour) || !hourlyData[hour]) return;

    await saveHourData(hour);
    toast.success(`Hour ${hour}:00 data auto-saved`);
  };

  const saveHourData = async (hour: number) => {
    if (!user || !hourlyData[hour]) return;

    const dateStr = date.toISOString().split('T')[0];
    const data = hourlyData[hour];

    const { error } = await supabase
      .from('transformer_logs')
      .upsert({
        transformer_number: transformerNumber,
        date: dateStr,
        hour,
        user_id: user.id,
        ...data,
      });

    if (error) {
      toast.error('Failed to save data');
      console.error(error);
    } else {
      setSavedHours(prev => new Set([...prev, hour]));
    }
  };

  const updateHourField = (hour: number, field: keyof TransformerData, value: any) => {
    setHourlyData(prev => ({
      ...prev,
      [hour]: {
        ...(prev[hour] || emptyData),
        [field]: value,
      },
    }));
  };

  const validateValue = (field: keyof TransformerData, value: number): boolean => {
    switch (field) {
      case 'frequency':
        return value >= 49 && value <= 51;
      case 'voltage_ry':
      case 'voltage_yb':
      case 'voltage_rb':
        return value >= 10000 && value <= 13000; // ±10% of 11kV
      case 'oil_temperature':
      case 'winding_temperature':
        return value <= 95;
      default:
        return true;
    }
  };

  const renderHourCard = (hour: number) => {
    const data = hourlyData[hour] || emptyData;
    const isSaved = savedHours.has(hour);
    const isCurrentHour = hour === currentHour;
    const isPastHour = hour < currentHour;

    return (
      <Card key={hour} className={`p-4 ${isCurrentHour ? 'border-primary' : ''} ${isSaved ? 'bg-green-50' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">
            {hour.toString().padStart(2, '0')}:00
            {isCurrentHour && <span className="text-primary ml-2">(Current)</span>}
          </h3>
          {isSaved && <CheckCircle className="h-4 w-4 text-green-600" />}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <Label className="text-xs">Active Power (kW)</Label>
            <Input
              type="number"
              step="0.01"
              value={data.active_power}
              onChange={(e) => updateHourField(hour, 'active_power', parseFloat(e.target.value) || 0)}
              className="h-8"
            />
          </div>

          <div>
            <Label className="text-xs">Reactive Power (kVAR)</Label>
            <Input
              type="number"
              step="0.01"
              value={data.reactive_power}
              onChange={(e) => updateHourField(hour, 'reactive_power', parseFloat(e.target.value) || 0)}
              className="h-8"
            />
          </div>

          <div>
            <Label className="text-xs">Frequency (Hz)</Label>
            <Input
              type="number"
              step="0.01"
              value={data.frequency}
              onChange={(e) => updateHourField(hour, 'frequency', parseFloat(e.target.value) || 0)}
              className={`h-8 ${!validateValue('frequency', data.frequency) && data.frequency > 0 ? 'bg-red-50 border-red-300' : ''}`}
            />
          </div>

          <div>
            <Label className="text-xs">Oil Temp (°C)</Label>
            <Input
              type="number"
              step="0.1"
              value={data.oil_temperature}
              onChange={(e) => updateHourField(hour, 'oil_temperature', parseFloat(e.target.value) || 0)}
              className={`h-8 ${!validateValue('oil_temperature', data.oil_temperature) && data.oil_temperature > 0 ? 'bg-red-50 border-red-300' : ''}`}
            />
          </div>

          <div className="col-span-2">
            <Label className="text-xs">Voltages (R/Y/B) in V</Label>
            <div className="grid grid-cols-3 gap-1">
              <Input
                type="number"
                placeholder="R"
                value={data.voltage_ry}
                onChange={(e) => updateHourField(hour, 'voltage_ry', parseFloat(e.target.value) || 0)}
                className={`h-8 ${!validateValue('voltage_ry', data.voltage_ry) && data.voltage_ry > 0 ? 'bg-red-50' : ''}`}
              />
              <Input
                type="number"
                placeholder="Y"
                value={data.voltage_yb}
                onChange={(e) => updateHourField(hour, 'voltage_yb', parseFloat(e.target.value) || 0)}
                className={`h-8 ${!validateValue('voltage_yb', data.voltage_yb) && data.voltage_yb > 0 ? 'bg-red-50' : ''}`}
              />
              <Input
                type="number"
                placeholder="B"
                value={data.voltage_rb}
                onChange={(e) => updateHourField(hour, 'voltage_rb', parseFloat(e.target.value) || 0)}
                className={`h-8 ${!validateValue('voltage_rb', data.voltage_rb) && data.voltage_rb > 0 ? 'bg-red-50' : ''}`}
              />
            </div>
          </div>

          <div className="col-span-2">
            <Label className="text-xs">Currents (R/Y/B) in A</Label>
            <div className="grid grid-cols-3 gap-1">
              <Input
                type="number"
                placeholder="R"
                value={data.current_r}
                onChange={(e) => updateHourField(hour, 'current_r', parseFloat(e.target.value) || 0)}
                className="h-8"
              />
              <Input
                type="number"
                placeholder="Y"
                value={data.current_y}
                onChange={(e) => updateHourField(hour, 'current_y', parseFloat(e.target.value) || 0)}
                className="h-8"
              />
              <Input
                type="number"
                placeholder="B"
                value={data.current_b}
                onChange={(e) => updateHourField(hour, 'current_b', parseFloat(e.target.value) || 0)}
                className="h-8"
              />
            </div>
          </div>

          <div className="col-span-2">
            <Label className="text-xs">Remarks</Label>
            <Textarea
              value={data.remarks}
              onChange={(e) => updateHourField(hour, 'remarks', e.target.value)}
              className="h-16 text-xs"
              placeholder="Any observations..."
            />
          </div>
        </div>

        {!isSaved && (
          <button
            onClick={() => saveHourData(hour)}
            className="w-full mt-2 text-xs text-primary hover:underline"
          >
            Save Hour {hour}
          </button>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold">Transformer {transformerNumber}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 24 }, (_, i) => i).map(renderHourCard)}
      </div>
    </div>
  );
};
