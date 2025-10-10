import { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Module1DataDisplay } from './reports/Module1DataDisplay';
import { Module2DataDisplay } from './reports/Module2DataDisplay';
import { Module3DataDisplay } from './reports/Module3DataDisplay';
import { Module4DataDisplay } from './reports/Module4DataDisplay';
import { ChecklistPrintView } from '@/components/reports/ChecklistPrintView';
import { AlertCircle, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ChecklistReportViewerProps {
  checklist: any;
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  employeeId?: string;
  isAdminView?: boolean;
}

export const ChecklistReportViewer = ({ checklist, isOpen, onClose, userName, employeeId, isAdminView = false }: ChecklistReportViewerProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [flaggedIssues, setFlaggedIssues] = useState<any[]>([]);

  // Fetch flagged issues for this checklist
  useEffect(() => {
    const fetchFlaggedIssues = async () => {
      if (!checklist?.id) return;
      
      const { data } = await supabase
        .from('flagged_issues')
        .select('*')
        .eq('checklist_id', checklist.id);
      
      setFlaggedIssues(data || []);
    };
    
    if (isOpen && checklist?.id) {
      fetchFlaggedIssues();
    }
  }, [checklist?.id, isOpen]);

  // Create a lookup map for quick access: "Module-Section-Item" -> issue
  const issueMap = new Map(
    flaggedIssues.map(issue => [
      `${issue.module}-${issue.section}-${issue.item}${issue.unit ? `-${issue.unit}` : ''}`,
      issue
    ])
  );

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Checklist_${employeeId || 'Report'}_${format(new Date(checklist?.date || new Date()), 'yyyy-MM-dd')}`,
    onAfterPrint: () => toast.success('PDF downloaded successfully'),
  });

  if (!checklist) return null;

  // Only show report for submitted checklists
  if (!checklist.submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Not Available</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <p className="text-muted-foreground mb-2">
              {isAdminView 
                ? `${userName || 'User'} has not submitted this report yet.`
                : 'Complete and submit all 4 modules to view the full report.'}
            </p>
            <Badge variant="secondary">
              Current Progress: {checklist.completion_percentage}%
            </Badge>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {/* Hidden print view */}
      <div className="hidden">
        <ChecklistPrintView ref={printRef} checklist={checklist} userName={userName} employeeId={employeeId} flaggedIssues={issueMap} />
      </div>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">Checklist Inspection Report</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Generated on {format(new Date(), 'PPP')} at {format(new Date(), 'pp')}
                </p>
              </div>
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </DialogHeader>

        <div className="space-y-6">
          {/* Summary Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Date</p>
              <p className="font-semibold">{format(new Date(checklist.date), 'PP')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Shift</p>
              <Badge variant="outline">{checklist.shift || 'N/A'}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Start Time</p>
              <p className="font-semibold">
                {checklist.start_time ? format(new Date(checklist.start_time), 'hh:mm a') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Submitted
                </Badge>
                {checklist.flagged_issues_count > 0 && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                    ⚠️ {checklist.flagged_issues_count} Flagged
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Severity Legend */}
          {flaggedIssues.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Flagged Issues Severity Legend
              </h4>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="px-3 py-1.5 bg-red-100 text-red-900 border-2 border-red-500 rounded font-medium">
                  🔴 Critical
                </span>
                <span className="px-3 py-1.5 bg-orange-100 text-orange-900 border-2 border-orange-500 rounded font-medium">
                  🟠 High
                </span>
                <span className="px-3 py-1.5 bg-yellow-100 text-yellow-900 border-2 border-yellow-500 rounded font-medium">
                  🟡 Medium
                </span>
                <span className="px-3 py-1.5 bg-yellow-50 text-yellow-800 border-2 border-yellow-300 rounded font-medium">
                  ⚪ Low
                </span>
              </div>
            </div>
          )}

          {/* Module Data Tabs */}
          <Tabs defaultValue="module1" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="module1">Module 1</TabsTrigger>
              <TabsTrigger value="module2">Module 2</TabsTrigger>
              <TabsTrigger value="module3">Module 3</TabsTrigger>
              <TabsTrigger value="module4">Module 4</TabsTrigger>
            </TabsList>

            <TabsContent value="module1" className="mt-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Module 1: Turbine, OPU & Cooling System</h3>
                {checklist.module1_data && Object.keys(checklist.module1_data).length > 0 ? (
                  <Module1DataDisplay data={checklist.module1_data} flaggedIssues={issueMap} />
                ) : (
                  <p className="text-muted-foreground text-center py-8">No data available for Module 1</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="module2" className="mt-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Module 2: Generator</h3>
                {checklist.module2_data && Object.keys(checklist.module2_data).length > 0 ? (
                  <Module2DataDisplay data={checklist.module2_data} flaggedIssues={issueMap} />
                ) : (
                  <p className="text-muted-foreground text-center py-8">No data available for Module 2</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="module3" className="mt-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Module 3: De-watering Sump</h3>
                {checklist.module3_data && Object.keys(checklist.module3_data).length > 0 ? (
                  <Module3DataDisplay data={checklist.module3_data} flaggedIssues={issueMap} />
                ) : (
                  <p className="text-muted-foreground text-center py-8">No data available for Module 3</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="module4" className="mt-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Module 4: Electrical Systems</h3>
                {checklist.module4_data && Object.keys(checklist.module4_data).length > 0 ? (
                  <Module4DataDisplay data={checklist.module4_data} flaggedIssues={issueMap} />
                ) : (
                  <p className="text-muted-foreground text-center py-8">No data available for Module 4</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};
