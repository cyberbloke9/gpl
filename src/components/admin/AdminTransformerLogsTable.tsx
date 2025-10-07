import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

interface AdminTransformerLog {
  date: string;
  transformer_number: number;
  user_name: string;
  employee_id: string;
  hours_logged: number;
  completion_percentage: number;
}

interface AdminTransformerLogsTableProps {
  logs: AdminTransformerLog[];
  onViewReport: (date: string, transformerNumber: number) => void;
}

export const AdminTransformerLogsTable = ({ logs, onViewReport }: AdminTransformerLogsTableProps) => {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Transformer</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Hours Logged</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No transformer logs for today
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log, index) => (
              <TableRow key={`${log.date}-${log.transformer_number}-${index}`}>
                <TableCell className="font-medium">
                  {format(new Date(log.date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">T{log.transformer_number}</Badge>
                </TableCell>
                <TableCell>{log.user_name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {log.employee_id}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{log.hours_logged}/24</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={log.completion_percentage} className="w-24" />
                    <span className="text-sm text-muted-foreground">
                      {log.completion_percentage}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewReport(log.date, log.transformer_number)}
                  >
                    View Report
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