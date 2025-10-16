import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

interface AdminTransformerLog {
  date: string;
  transformer_number: number;
  user_names: string;
  employee_ids: string;
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
            <TableHead className="whitespace-nowrap">Date</TableHead>
            <TableHead className="whitespace-nowrap">Transformer</TableHead>
            <TableHead className="whitespace-nowrap">User</TableHead>
            <TableHead className="hidden md:table-cell whitespace-nowrap">Employee ID</TableHead>
            <TableHead className="whitespace-nowrap">Hours</TableHead>
            <TableHead className="hidden sm:table-cell whitespace-nowrap">Progress</TableHead>
            <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8 text-sm">
                No transformer logs for today
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log, index) => (
              <TableRow key={`${log.date}-${log.transformer_number}-${index}`}>
                <TableCell className="font-medium text-sm whitespace-nowrap">
                  {format(new Date(log.date), 'MMM d')}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{log.transformer_number === 1 ? 'PT' : 'AT'}</Badge>
                </TableCell>
                <TableCell className="text-sm max-w-[150px] truncate" title={log.user_names}>
                  {log.user_names}
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[100px] truncate" title={log.employee_ids}>
                  {log.employee_ids}
                </TableCell>
                <TableCell className="text-sm">
                  <span className="font-medium">{log.hours_logged}</span>
                  <span className="text-muted-foreground">/24</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <Progress value={log.completion_percentage} className="w-16 sm:w-20 h-2" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {log.completion_percentage}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewReport(log.date, log.transformer_number)}
                    className="text-xs"
                  >
                    <span className="hidden sm:inline">View</span>
                    <span className="sm:hidden">📊</span>
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