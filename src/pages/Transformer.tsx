import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { TransformerLogForm } from '@/components/transformer/TransformerLogForm';
import { TransformerLogHistory } from '@/components/transformer/TransformerLogHistory';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getTodayIST, istToUTC, formatIST } from '@/lib/timezone-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Transformer() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIST());
  const [isFinalized, setIsFinalized] = useState<boolean>(false);

  // Check if logs for selected date are finalized
  useEffect(() => {
    const checkFinalization = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('transformer_logs')
        .select('finalized')
        .eq('date', selectedDate)
        .eq('transformer_number', 1)
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      
      setIsFinalized(data?.finalized || false);
    };

    checkFinalization();
  }, [selectedDate, user]);

  // Handle finalizing the day's logs
  const handleFinalizeDay = async () => {
    if (!user) return;

    // Check if all 24 hours are logged
    const { data: logs, error: fetchError } = await supabase
      .from('transformer_logs')
      .select('hour')
      .eq('date', selectedDate)
      .eq('transformer_number', 1)
      .eq('user_id', user.id);

    if (fetchError) {
      toast({
        title: 'Error',
        description: 'Failed to check log completion',
        variant: 'destructive',
      });
      return;
    }

    if (!logs || logs.length < 24) {
      toast({
        title: 'Incomplete Logs',
        description: `Only ${logs?.length || 0}/24 hours logged. Complete all hours before finalizing.`,
        variant: 'destructive',
      });
      return;
    }

    // Finalize all logs for this date
    const { error: updateError } = await supabase
      .from('transformer_logs')
      .update({
        finalized: true,
        finalized_at: istToUTC(new Date()),
        finalized_by: user.id,
      })
      .eq('date', selectedDate)
      .eq('transformer_number', 1)
      .eq('user_id', user.id);

    if (updateError) {
      toast({
        title: 'Error',
        description: 'Failed to finalize logs',
        variant: 'destructive',
      });
      return;
    }

    setIsFinalized(true);
    toast({
      title: 'Logs Finalized',
      description: `Unified transformer logs for ${formatIST(new Date(selectedDate), 'PP')} IST are now locked.`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-32 sm:pb-28">
      <Navigation />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Transformer Log</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Record hourly transformer readings and parameters
          </p>
        </div>

        <Tabs defaultValue="log-entry" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 h-auto">
            <TabsTrigger value="log-entry" className="text-xs sm:text-sm py-2">Log Entry</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm py-2">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="log-entry">
            <TransformerLogForm 
              isFinalized={isFinalized} 
              onDateChange={setSelectedDate}
              onFinalizeDay={handleFinalizeDay}
            />
          </TabsContent>
          
          <TabsContent value="history">
            <TransformerLogHistory userId={user?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
