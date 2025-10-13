import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { TransformerLogForm } from '@/components/transformer/TransformerLogForm';
import { TransformerLogHistory } from '@/components/transformer/TransformerLogHistory';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Transformer() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [isFinalized, setIsFinalized] = useState<boolean>(false);

  // Check if logs for selected date are finalized
  useEffect(() => {
    const checkFinalization = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('transformer_logs')
        .select('finalized')
        .eq('date', selectedDate)
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      
      setIsFinalized(data?.finalized || false);
    };

    checkFinalization();
  }, [selectedDate, user]);

  // Handle finalizing the day's logs
  const handleFinalizeDay = async (transformerNumber: number) => {
    if (!user) return;

    // Check if all 24 hours are logged
    const { data: logs, error: fetchError } = await supabase
      .from('transformer_logs')
      .select('hour')
      .eq('date', selectedDate)
      .eq('transformer_number', transformerNumber)
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

    // Finalize all logs for this date and transformer
    const { error: updateError } = await supabase
      .from('transformer_logs')
      .update({
        finalized: true,
        finalized_at: new Date().toISOString(),
        finalized_by: user.id,
      })
      .eq('date', selectedDate)
      .eq('transformer_number', transformerNumber)
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
      description: `${transformerNumber === 1 ? 'Power Transformer' : 'Auxiliary Transformer'} logs for ${format(new Date(selectedDate), 'PP')} are now locked.`,
    });
  };

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
