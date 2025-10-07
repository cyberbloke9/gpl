import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChecklistModule1 } from '@/components/checklist/Module1';
import { ChecklistModule2 } from '@/components/checklist/Module2';
import { ChecklistModule3 } from '@/components/checklist/Module3';
import { ChecklistModule4 } from '@/components/checklist/Module4';
import { ChecklistHistory } from '@/components/checklist/ChecklistHistory';

export default function Checklist() {
  const { user } = useAuth();
  const [currentChecklistId, setCurrentChecklistId] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState('1');
  const [module1Data, setModule1Data] = useState({});
  const [module2Data, setModule2Data] = useState({});
  const [module3Data, setModule3Data] = useState({});
  const [module4Data, setModule4Data] = useState({});

  useEffect(() => {
    loadOrCreateTodayChecklist();
  }, [user]);

  const loadOrCreateTodayChecklist = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('checklists')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (error) {
      toast.error('Failed to load checklist');
      return;
    }

    if (data) {
      setCurrentChecklistId(data.id);
      setModule1Data(data.module1_data || {});
      setModule2Data(data.module2_data || {});
      setModule3Data(data.module3_data || {});
      setModule4Data(data.module4_data || {});
    } else {
      const { data: newChecklist, error: createError } = await supabase
        .from('checklists')
        .insert({
          user_id: user.id,
          date: today,
          start_time: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        toast.error('Failed to create checklist');
      } else {
        setCurrentChecklistId(newChecklist.id);
      }
    }
  };

  const saveModuleData = async (moduleNum: number, data: any) => {
    if (!currentChecklistId) return;

    const updateField = `module${moduleNum}_data`;
    const { error } = await supabase
      .from('checklists')
      .update({ [updateField]: data })
      .eq('id', currentChecklistId);

    if (error) {
      toast.error('Failed to save module data');
    } else {
      toast.success(`Module ${moduleNum} saved`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Daily Checklist</h1>
          <p className="text-muted-foreground mt-2">
            Complete all four modules for today's inspection
          </p>
        </div>

        <Card className="p-6">
          <Tabs value={activeModule} onValueChange={setActiveModule}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="1">Module 1</TabsTrigger>
              <TabsTrigger value="2">Module 2</TabsTrigger>
              <TabsTrigger value="3">Module 3</TabsTrigger>
              <TabsTrigger value="4">Module 4</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="1">
              <ChecklistModule1
                checklistId={currentChecklistId}
                data={module1Data}
                onSave={(data) => {
                  setModule1Data(data);
                  saveModuleData(1, data);
                }}
              />
            </TabsContent>

            <TabsContent value="2">
              <ChecklistModule2
                checklistId={currentChecklistId}
                data={module2Data}
                onSave={(data) => {
                  setModule2Data(data);
                  saveModuleData(2, data);
                }}
              />
            </TabsContent>

            <TabsContent value="3">
              <ChecklistModule3
                checklistId={currentChecklistId}
                data={module3Data}
                onSave={(data) => {
                  setModule3Data(data);
                  saveModuleData(3, data);
                }}
              />
            </TabsContent>

            <TabsContent value="4">
              <ChecklistModule4
                checklistId={currentChecklistId}
                data={module4Data}
                onSave={(data) => {
                  setModule4Data(data);
                  saveModuleData(4, data);
                }}
              />
            </TabsContent>

            <TabsContent value="history">
              <ChecklistHistory userId={user?.id} />
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}
