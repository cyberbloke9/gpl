import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ProblemBadge } from '@/components/ui/status-badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format } from 'date-fns';

interface ChecklistReportViewerProps {
  checklist: any;
  isOpen: boolean;
  onClose: () => void;
}

export const ChecklistReportViewer = ({ checklist, isOpen, onClose }: ChecklistReportViewerProps) => {
  if (!checklist) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checklist Report - {format(new Date(checklist.date), 'PPP')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Section */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge>{checklist.submitted ? 'Submitted' : checklist.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completion</p>
              <p className="font-semibold">{checklist.completion_percentage}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Start Time</p>
              <p className="font-semibold">
                {checklist.start_time ? format(new Date(checklist.start_time), 'hh:mm a') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Problems Detected</p>
              {checklist.problem_count > 0 ? (
                <ProblemBadge count={checklist.problem_count} />
              ) : (
                <p className="text-sm">None</p>
              )}
            </div>
          </div>

          {/* Module Data */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="module1">
              <AccordionTrigger>Module 1: Turbine & OPU</AccordionTrigger>
              <AccordionContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                  {JSON.stringify(checklist.module1_data, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="module2">
              <AccordionTrigger>Module 2: Generator</AccordionTrigger>
              <AccordionContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                  {JSON.stringify(checklist.module2_data, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="module3">
              <AccordionTrigger>Module 3: De-watering Sump</AccordionTrigger>
              <AccordionContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                  {JSON.stringify(checklist.module3_data, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="module4">
              <AccordionTrigger>Module 4: Electrical Systems</AccordionTrigger>
              <AccordionContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                  {JSON.stringify(checklist.module4_data, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>

            {checklist.problem_fields && checklist.problem_fields.length > 0 && (
              <AccordionItem value="problems">
                <AccordionTrigger className="text-red-600">
                  Problem Fields ({checklist.problem_fields.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {checklist.problem_fields.map((problem: any, idx: number) => (
                      <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded">
                        <p className="font-semibold">{problem.field}</p>
                        <p className="text-sm">
                          Value: {problem.value} {problem.unit} (Expected: {problem.range})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(problem.timestamp), 'PPpp')}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
};
