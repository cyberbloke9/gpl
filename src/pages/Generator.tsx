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
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="log-entry" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="log-entry">Log Entry</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
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
