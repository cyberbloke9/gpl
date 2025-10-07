import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { TransformerHourlyGrid } from '@/components/transformer/TransformerHourlyGrid';
import { format } from 'date-fns';

export default function Transformer() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-12 sm:pb-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Transformer Hourly Log</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Record hourly readings. Auto-saves every hour.
            </p>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 w-full sm:w-auto text-sm">
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{format(selectedDate, 'PPP')}</span>
                <span className="sm:hidden">{format(selectedDate, 'PP')}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <Card className="p-3 sm:p-6">
            <TransformerHourlyGrid transformerNumber={1} date={selectedDate} />
          </Card>

          <Card className="p-3 sm:p-6">
            <TransformerHourlyGrid transformerNumber={2} date={selectedDate} />
          </Card>
        </div>
      </main>
    </div>
  );
}
