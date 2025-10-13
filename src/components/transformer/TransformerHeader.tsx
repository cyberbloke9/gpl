import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransformerHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function TransformerHeader({ selectedDate, onDateChange }: TransformerHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-white text-2xl md:text-3xl font-bold text-center tracking-wide">
          GAYATRI POWER PRIVATE LIMITED
        </h1>
        <h2 className="text-white text-lg md:text-xl text-center mt-1">
          TRANSFORMER LOG SHEET
        </h2>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-white text-sm font-medium">DATE:-</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal bg-white",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && onDateChange(date)}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
