import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChecklistModule1 } from '@/components/checklist/Module1';
import { ChecklistModule2 } from '@/components/checklist/Module2';
import { ChecklistModule3 } from '@/components/checklist/Module3';
import { ChecklistModule4 } from '@/components/checklist/Module4';
import { ChecklistHistory } from '@/components/checklist/ChecklistHistory';
import { SubmitBar } from '@/components/checklist/SubmitBar';
import { Lock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Checklist() {
  const { user } = useAuth();
  const [currentChecklistId, setCurrentChecklistId] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState('1');
  const [module1Data, setModule1Data] = useState({});
  const [module2Data, setModule2Data] = useState({});
  const [module3Data, setModule3Data] = useState({});
  const [module4Data, setModule4Data] = useState({});
  const [problemFields, setProblemFields] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

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
      setIsSubmitted(data.submitted || false);
      setSubmittedAt(data.submitted_at);
      
      // If already submitted, redirect to history
      if (data.submitted) {
        setActiveModule('history');
        toast.info('This checklist has already been submitted');
      }
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

    setIsSaving(true);
    const updateField = `module${moduleNum}_data`;
    
    // Calculate progress and update problem tracking
    const progress = calculateProgress();
    
    const { error } = await supabase
      .from('checklists')
      .update({ 
        [updateField]: data,
        problem_fields: problemFields,
        problem_count: problemFields.length,
        completion_percentage: progress,
      })
      .eq('id', currentChecklistId);

    setIsSaving(false);
    if (error) {
      toast.error('Failed to save module data');
    } else {
      toast.success(`Module ${moduleNum} saved`);
    }
  };

  // Auto-save with debounce
  const scheduleAutoSave = useCallback((moduleNum: number, data: any) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      saveModuleData(moduleNum, data);
    }, 30000); // 30 seconds
    
    setAutoSaveTimeout(timeout);
  }, [autoSaveTimeout, currentChecklistId, problemFields]);

  // Calculate overall progress
  const calculateProgress = () => {
    // Simple calculation based on modules with data
    let progress = 0;
    if (Object.keys(module1Data).length > 0) progress += 25;
    if (Object.keys(module2Data).length > 0) progress += 25;
    if (Object.keys(module3Data).length > 0) progress += 25;
    if (Object.keys(module4Data).length > 0) progress += 25;
    return progress;
  };

  useEffect(() => {
    const progress = calculateProgress();
    setOverallProgress(progress);
  }, [module1Data, module2Data, module3Data, module4Data]);

  const handleSubmitChecklist = async () => {
    if (!currentChecklistId) return;

    try {
      const submissionTime = new Date().toISOString();
      const { error } = await supabase
        .from('checklists')
        .update({
          status: 'completed',
          submitted: true,
          submitted_at: submissionTime,
          completion_time: submissionTime,
          completion_percentage: 100,
          module1_data: module1Data,
          module2_data: module2Data,
          module3_data: module3Data,
          module4_data: module4Data,
        })
        .eq('id', currentChecklistId);

      if (error) throw error;
      
      await loadOrCreateTodayChecklist();
      setShowSubmitDialog(false);
      toast.success('Checklist submitted successfully!');
      setActiveModule('history');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error('Failed to submit: ' + error.message);
    }
  };

  const isComplete = overallProgress === 100;

  return (
    <div className="min-h-screen bg-background pb-32 sm:pb-28">
      <Navigation />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Daily Checklist</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Complete all four modules for today's inspection
          </p>
        </div>

        {isSubmitted && submittedAt && (
          <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
            <Lock className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              This checklist was submitted on {new Date(submittedAt).toLocaleString()} - View only mode
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-3 sm:p-6 mb-24 sm:mb-28">
          <Tabs value={activeModule} onValueChange={setActiveModule}>
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="1" className="text-xs sm:text-sm px-1 sm:px-3">M1</TabsTrigger>
              <TabsTrigger value="2" className="text-xs sm:text-sm px-1 sm:px-3">M2</TabsTrigger>
              <TabsTrigger value="3" className="text-xs sm:text-sm px-1 sm:px-3">M3</TabsTrigger>
              <TabsTrigger value="4" className="text-xs sm:text-sm px-1 sm:px-3">M4</TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm px-1 sm:px-3">History</TabsTrigger>
            </TabsList>

            <TabsContent value="1">
              {isSubmitted ? (
                <Alert>
                  <AlertDescription>
                    Module data is locked. View the submitted report in the History tab.
                  </AlertDescription>
                </Alert>
              ) : (
                <ChecklistModule1
                  checklistId={currentChecklistId}
                  userId={user?.id || ''}
                  data={module1Data}
                  onSave={(data) => {
                    setModule1Data(data);
                    saveModuleData(1, data);
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="2">
              {isSubmitted ? (
                <Alert>
                  <AlertDescription>
                    Module data is locked. View the submitted report in the History tab.
                  </AlertDescription>
                </Alert>
              ) : (
                <ChecklistModule2
                  checklistId={currentChecklistId}
                  userId={user?.id || ''}
                  data={module2Data}
                  onSave={(data) => {
                    setModule2Data(data);
                    saveModuleData(2, data);
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="3">
              {isSubmitted ? (
                <Alert>
                  <AlertDescription>
                    Module data is locked. View the submitted report in the History tab.
                  </AlertDescription>
                </Alert>
              ) : (
                <ChecklistModule3
                  checklistId={currentChecklistId}
                  userId={user?.id || ''}
                  data={module3Data}
                  onSave={(data) => {
                    setModule3Data(data);
                    saveModuleData(3, data);
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="4">
              {isSubmitted ? (
                <Alert>
                  <AlertDescription>
                    Module data is locked. View the submitted report in the History tab.
                  </AlertDescription>
                </Alert>
              ) : (
                <ChecklistModule4
                  checklistId={currentChecklistId}
                  userId={user?.id || ''}
                  data={module4Data}
                  onSave={(data) => {
                    setModule4Data(data);
                    saveModuleData(4, data);
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="history">
              <ChecklistHistory userId={user?.id} />
            </TabsContent>
          </Tabs>
        </Card>
      </main>

      {activeModule !== 'history' && !isSubmitted && (
        <SubmitBar
          overallProgress={overallProgress}
          problemCount={problemFields.length}
          isComplete={isComplete}
          onSubmit={() => setShowSubmitDialog(true)}
          isSaving={isSaving}
        />
      )}

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Complete Checklist?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark your daily checklist as complete and notify the admin for review.
              {problemFields.length > 0 && (
                <span className="block mt-2 text-red-600 font-semibold">
                  ⚠️ Note: {problemFields.length} problem(s) detected will be highlighted for admin attention.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitChecklist}>
              Submit Checklist
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
