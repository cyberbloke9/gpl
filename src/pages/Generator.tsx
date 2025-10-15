import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneratorLogForm } from '@/components/generator/GeneratorLogForm';
import { GeneratorLogHistory } from '@/components/generator/GeneratorLogHistory';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function Generator() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isFinalized] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-32 sm:pb-28">
      <Navigation />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Generator Log</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Record hourly generator readings and electrical parameters
          </p>
        </div>

        <Tabs defaultValue="log-entry" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 h-auto">
            <TabsTrigger value="log-entry" className="text-xs sm:text-sm py-2">Log Entry</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm py-2">History</TabsTrigger>
          </TabsList>

          <TabsContent value="log-entry">
            <GeneratorLogForm
              isFinalized={isFinalized}
              onDateChange={setSelectedDate}
            />
          </TabsContent>

          <TabsContent value="history">
            <GeneratorLogHistory userId={user?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
