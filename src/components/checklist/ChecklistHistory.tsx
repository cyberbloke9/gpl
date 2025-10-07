import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';

export const ChecklistHistory = ({ userId }: { userId?: string }) => {
  const [checklists, setChecklists] = useState<any[]>([]);

  useEffect(() => {
    if (userId) loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    const { data } = await supabase
      .from('checklists')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);
    
    if (data) setChecklists(data);
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Checklist History</h2>
      {checklists.map((checklist) => (
        <Card key={checklist.id} className="p-4">
          <p className="font-semibold">{checklist.date}</p>
          <p className="text-sm text-muted-foreground">Status: {checklist.status}</p>
        </Card>
      ))}
    </div>
  );
};
