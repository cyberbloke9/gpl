import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HourGridProps {
  selectedHour: number;
  currentHour: number;
  loggedHours: number[];
  isToday: boolean;
  onHourSelect: (hour: number) => void;
}

export function HourGrid({ 
  selectedHour, 
  currentHour, 
  loggedHours, 
  isToday, 
  onHourSelect 
}: HourGridProps) {
  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2 p-4 bg-background">
      {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
        const isSelected = hour === selectedHour;
        const isLogged = loggedHours.includes(hour);
        const isCurrent = hour === currentHour && isToday;
        const isPast = hour < currentHour && isToday;
        const isFuture = hour > currentHour && isToday;
        
        return (
          <button
            key={hour}
            onClick={() => onHourSelect(hour)}
            disabled={isFuture}
            className={cn(
              "aspect-square rounded-lg font-semibold text-sm transition-all",
              "touch-manipulation min-h-[44px] flex flex-col items-center justify-center",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected && "bg-indigo-600 text-white shadow-lg scale-105",
              !isSelected && isLogged && "border-2 border-green-500 bg-green-50 hover:bg-green-100",
              !isSelected && !isLogged && !isFuture && "border border-gray-300 bg-background hover:bg-accent",
              isFuture && "border border-gray-200 bg-muted opacity-50 cursor-not-allowed",
              isCurrent && !isSelected && "ring-2 ring-indigo-400 animate-pulse"
            )}
          >
            <span>{hour.toString().padStart(2, '0')}</span>
            {isLogged && !isSelected && (
              <CheckCircle2 className="w-3 h-3 mt-1 text-green-600" />
            )}
          </button>
        );
      })}
    </div>
  );
}
