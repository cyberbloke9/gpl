import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getTodayIST, istToUTC, formatIST } from '@/lib/timezone-utils';
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

  // Real-time synchronization for checklist changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('checklist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checklists',
          filter: `date=eq.${getTodayIST()}`
        },
        (payload) => {
          console.log('Checklist updated by another user:', payload);
          loadOrCreateTodayChecklist();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadOrCreateTodayChecklist = async () => {
    if (!user) return;

    const today = getTodayIST();
    
    // Load shared checklist for today (no user_id filter - collective work)
    const { data, error } = await supabase
      .from('checklists')
      .select('*')
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
      // Create shared checklist (user_id is nullable for collective work)
      const { data: newChecklist, error: createError } = await supabase
        .from('checklists')
        .insert({
          date: today,
          start_time: istToUTC(new Date()),
          contributors: {}
        } as any)
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
    if (!currentChecklistId || !user) return;

    setIsSaving(true);
    const updateField = `module${moduleNum}_data`;
    
    // Calculate progress and update problem tracking
    const progress = calculateProgress();
    
    // Fetch current contributors
    const { data: currentChecklist } = await supabase
      .from('checklists')
      .select('contributors')
      .eq('id', currentChecklistId)
      .single();

    const contributors: any = (currentChecklist as any)?.contributors || {};
    const moduleKey = `module${moduleNum}`;
    
    // Add current user to contributors for this module
    if (!contributors[moduleKey]) {
      contributors[moduleKey] = [];
    }
    if (!contributors[moduleKey].includes(user.id)) {
      contributors[moduleKey].push(user.id);
    }
    
    const { error } = await supabase
      .from('checklists')
      .update({ 
        [updateField]: data,
        contributors: contributors,
        problem_fields: problemFields,
        problem_count: problemFields.length,
        completion_percentage: progress,
      } as any)
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
      const submissionTime = istToUTC(new Date());
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
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-36 sm:pb-32">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Daily Checklist</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Complete all four modules for today's inspection
          </p>
        </div>

        {isSubmitted && submittedAt && (
          <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
            <Lock className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-xs sm:text-sm text-green-800 dark:text-green-200">
              This checklist was submitted on {formatIST(submittedAt, 'PPpp')} IST - View only mode
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-3 sm:p-6">
          <Tabs value={activeModule} onValueChange={setActiveModule}>
            <TabsList className="grid w-full grid-cols-5 h-auto gap-1">
              <TabsTrigger value="1" className="text-xs sm:text-sm px-1 sm:px-3 py-2">M1</TabsTrigger>
              <TabsTrigger value="2" className="text-xs sm:text-sm px-1 sm:px-3 py-2">M2</TabsTrigger>
              <TabsTrigger value="3" className="text-xs sm:text-sm px-1 sm:px-3 py-2">M3</TabsTrigger>
              <TabsTrigger value="4" className="text-xs sm:text-sm px-1 sm:px-3 py-2">M4</TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm px-1 sm:px-3 py-2">History</TabsTrigger>
            </TabsList>

            <TabsContent value="1">
              {isSubmitted ? (
                <Alert className="text-xs sm:text-sm">
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
                <Alert className="text-xs sm:text-sm">
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
                <Alert className="text-xs sm:text-sm">
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
                <Alert className="text-xs sm:text-sm">
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
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Submit Complete Checklist?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              This will mark your daily checklist as complete and notify the admin for review.
              {problemFields.length > 0 && (
                <span className="block mt-2 text-red-600 font-semibold text-xs sm:text-sm">
                  ⚠️ Note: {problemFields.length} problem(s) detected will be highlighted for admin attention.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="text-xs sm:text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitChecklist} className="text-xs sm:text-sm">
              Submit Checklist
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
