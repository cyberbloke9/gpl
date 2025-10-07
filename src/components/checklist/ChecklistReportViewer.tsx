import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ProblemBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Module1DataDisplay } from './reports/Module1DataDisplay';
import { Module2DataDisplay } from './reports/Module2DataDisplay';
import { Module3DataDisplay } from './reports/Module3DataDisplay';
import { Module4DataDisplay } from './reports/Module4DataDisplay';
import { AlertCircle } from 'lucide-react';

interface ChecklistReportViewerProps {
  checklist: any;
  isOpen: boolean;
  onClose: () => void;
}

export const ChecklistReportViewer = ({ checklist, isOpen, onClose }: ChecklistReportViewerProps) => {
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
              Complete and submit all 4 modules to view the full report.
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Checklist Inspection Report</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Generated on {format(new Date(), 'PPP')} at {format(new Date(), 'pp')}
          </p>
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
                {checklist.problem_count > 0 && (
                  <ProblemBadge count={checklist.problem_count} />
                )}
              </div>
            </div>
          </div>

          {/* Problem Fields Alert */}
          {checklist.problem_fields && checklist.problem_fields.length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Flagged Issues ({checklist.problem_fields.length})
              </h4>
              <div className="space-y-2">
                {checklist.problem_fields.map((problem: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white dark:bg-gray-900 rounded border border-red-200">
                    <p className="font-semibold text-sm">{problem.field}</p>
                    <p className="text-xs text-muted-foreground">
                      Value: {problem.value} {problem.unit} (Expected: {problem.range})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(problem.timestamp), 'PPpp')}
                    </p>
                  </div>
                ))}
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
                <Module1DataDisplay data={checklist.module1_data} />
              </div>
            </TabsContent>

            <TabsContent value="module2" className="mt-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Module 2: Generator</h3>
                <Module2DataDisplay data={checklist.module2_data} />
              </div>
            </TabsContent>

            <TabsContent value="module3" className="mt-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Module 3: De-watering Sump</h3>
                <Module3DataDisplay data={checklist.module3_data} />
              </div>
            </TabsContent>

            <TabsContent value="module4" className="mt-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Module 4: Electrical Systems</h3>
                <Module4DataDisplay data={checklist.module4_data} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
