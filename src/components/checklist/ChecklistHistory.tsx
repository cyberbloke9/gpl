import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProblemBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChecklistReportViewer } from './ChecklistReportViewer';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';

export const ChecklistHistory = ({ userId }: { userId?: string }) => {
  const [checklists, setChecklists] = useState<any[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    if (userId) loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    const { data } = await supabase
      .from('checklists')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);
    
    if (data) setChecklists(data);
  };

  const handleViewReport = async (checklist: any) => {
    // Fetch user profile data for PDF
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, employee_id')
      .eq('id', checklist.user_id)
      .single();

    setSelectedChecklist({ 
      ...checklist, 
      userName: profile?.full_name,
      employeeId: profile?.employee_id 
    });
    setIsViewerOpen(true);
  };

  const getStatusBadge = (checklist: any) => {
    if (checklist.submitted) {
      return <Badge className="bg-green-100 text-green-800">Submitted</Badge>;
    }
    if (checklist.status === 'completed') {
      return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
    }
    if (checklist.status === 'in_progress') {
      return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
    }
    return <Badge variant="outline">Not Started</Badge>;
  };

  return (
    <div className="space-y-3 sm:space-y-4 p-2 sm:p-4">
      <h2 className="text-xl sm:text-2xl font-bold">Checklist History</h2>
      
      {checklists.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No checklist history yet</p>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {checklists.map((checklist) => (
            <AccordionItem key={checklist.id} value={checklist.id} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-left">
                        {format(new Date(checklist.date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground text-left">
                        {checklist.shift && `Shift: ${checklist.shift}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(checklist)}
                    {checklist.problem_count > 0 && <ProblemBadge count={checklist.problem_count} />}
                    {checklist.flagged_issues_count > 0 && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700">
                        ⚠️ {checklist.flagged_issues_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Time</p>
                    <p className="font-medium">
                      {checklist.start_time ? format(new Date(checklist.start_time), 'hh:mm a') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Time</p>
                    <p className="font-medium">
                      {checklist.completion_time ? format(new Date(checklist.completion_time), 'hh:mm a') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <div className="flex items-center gap-2">
                      <Progress value={checklist.completion_percentage || 0} className="h-2" />
                      <span className="text-sm">{checklist.completion_percentage || 0}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Problems</p>
                    <p className="font-medium">
                      {checklist.problem_count > 0 ? (
                        <span className="text-red-600">{checklist.problem_count} detected</span>
                      ) : (
                        'None'
                      )}
                    </p>
                  </div>
                </div>
                {checklist.submitted ? (
                  <Button
                    onClick={() => handleViewReport(checklist)}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Full Report
                  </Button>
                ) : (
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      Complete and submit all 4 modules to view the full report
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <ChecklistReportViewer
        checklist={selectedChecklist}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        userName={selectedChecklist?.userName}
        employeeId={selectedChecklist?.employeeId}
      />
    </div>
  );
};
