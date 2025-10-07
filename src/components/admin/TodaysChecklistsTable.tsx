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
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Operator</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Problems</TableHead>
            <TableHead>Issues</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {checklists.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No checklists for today yet
              </TableCell>
            </TableRow>
          ) : (
            checklists.map((checklist) => (
              <TableRow key={checklist.id}>
                <TableCell className="font-medium">{checklist.user_name}</TableCell>
                <TableCell>{checklist.employee_id || 'N/A'}</TableCell>
                <TableCell className="text-sm">
                  {checklist.start_time ? format(new Date(checklist.start_time), 'hh:mm a') : '-'}
                </TableCell>
                <TableCell>{getStatusBadge(checklist.status, checklist.submitted)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={checklist.completion_percentage || 0} className="w-20 h-2" />
                    <span className="text-sm">{checklist.completion_percentage || 0}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {checklist.problem_count > 0 ? (
                    <ProblemBadge count={checklist.problem_count} />
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {checklist.flagged_issues_count > 0 ? (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700">
                      ⚠️ {checklist.flagged_issues_count}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewReport(checklist.id)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
