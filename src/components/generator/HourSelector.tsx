import { Button } from '@/components/ui/button';
import { CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HourStatus } from '@/types/generator';

interface HourSelectorProps {
  selectedHour: number;
  onHourSelect: (hour: number) => void;
  loggedHours: number[];
  currentHour: number;
}

export function HourSelector({
  selectedHour,
  onHourSelect,
  loggedHours,
  currentHour,
}: HourSelectorProps) {
  
  const getHourStatus = (hour: number): HourStatus => {
    if (hour === currentHour) return 'current';
    if (hour < currentHour && loggedHours.includes(hour)) return 'completed';
    if (hour < currentHour) return 'locked';
    return 'future';
  };
  
  const getHourStyles = (hour: number) => {
    const status = getHourStatus(hour);
    const isSelected = hour === selectedHour;
    
    const baseStyles = "w-full aspect-square rounded-md text-sm font-medium transition-all";
    
    switch (status) {
      case 'current':
        return cn(
          baseStyles,
          "border-2 border-green-500 bg-green-50 hover:bg-green-100",
          isSelected && "bg-green-200 ring-2 ring-green-400",
          "animate-pulse"
        );
      case 'completed':
        return cn(
          baseStyles,
          "border border-blue-400 bg-blue-100 hover:bg-blue-200",
          isSelected && "bg-blue-300 ring-2 ring-blue-400"
        );
      case 'locked':
        return cn(
          baseStyles,
          "border border-gray-300 bg-gray-100 text-gray-500",
          isSelected && "bg-gray-200"
        );
      case 'future':
        return cn(
          baseStyles,
          "border border-gray-200 bg-gray-50 text-gray-400 opacity-50 cursor-not-allowed"
        );
    }
  };
  
  return (
    <div className="grid grid-cols-6 gap-2 p-4 bg-muted/50 rounded-lg">
      {Array.from({ length: 24 }, (_, i) => {
        const hour = i;
        const status = getHourStatus(hour);
        const isDisabled = status === 'future';
        
        return (
          <Button
            key={hour}
            variant="outline"
            className={getHourStyles(hour)}
            onClick={() => !isDisabled && onHourSelect(hour)}
            disabled={isDisabled}
          >
            <div className="flex flex-col items-center">
              <span>{hour.toString().padStart(2, '0')}</span>
              {status === 'completed' && <CheckCircle2 className="h-3 w-3 mt-1" />}
              {status === 'locked' && <Lock className="h-3 w-3 mt-1" />}
            </div>
          </Button>
        );
      })}
    </div>
  );
}
