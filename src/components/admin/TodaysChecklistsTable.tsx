import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ProblemBadge } from '@/components/ui/status-badge';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';

interface ChecklistRow {
  id: string;
  user_name: string;
  employee_id: string;
  start_time: string;
  status: string;
  completion_percentage: number;
  problem_count: number;
  flagged_issues_count: number;
  submitted: boolean;
}

interface TodaysChecklistsTableProps {
  checklists: ChecklistRow[];
  onViewReport: (checklistId: string) => void;
}

export const TodaysChecklistsTable = ({ checklists, onViewReport }: TodaysChecklistsTableProps) => {
  const getStatusBadge = (status: string, submitted: boolean) => {
    if (submitted) {
      return <Badge className="bg-green-100 text-green-800">Submitted</Badge>;
    }
    
    switch (status) {
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Operator</TableHead>
              <TableHead className="hidden sm:table-cell whitespace-nowrap">Employee ID</TableHead>
              <TableHead className="whitespace-nowrap">Start</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Progress</TableHead>
              <TableHead className="whitespace-nowrap">Problems</TableHead>
              <TableHead className="hidden md:table-cell whitespace-nowrap">Issues</TableHead>
              <TableHead className="whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checklists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8 text-sm">
                  No checklists for today yet
                </TableCell>
              </TableRow>
            ) : (
              checklists.map((checklist) => (
                <TableRow key={checklist.id}>
                  <TableCell className="font-medium text-sm whitespace-nowrap">{checklist.user_name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{checklist.employee_id || 'N/A'}</TableCell>
                  <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                    {checklist.start_time ? format(new Date(checklist.start_time), 'hh:mm a') : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(checklist.status, checklist.submitted)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={checklist.completion_percentage || 0} className="w-16 sm:w-20 h-2" />
                      <span className="text-xs sm:text-sm whitespace-nowrap">{checklist.completion_percentage || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {checklist.problem_count > 0 ? (
                      <ProblemBadge count={checklist.problem_count} />
                    ) : (
                      <span className="text-xs sm:text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {checklist.flagged_issues_count > 0 ? (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs">
                        ⚠️ {checklist.flagged_issues_count}
                      </Badge>
                    ) : (
                      <span className="text-xs sm:text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewReport(checklist.id)}
                      className="gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
