import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

interface AdminGeneratorLog {
  date: string;
  user_id: string;
  user_name: string;
  employee_id: string;
  hours_logged: number;
  completion_percentage: number;
  avg_power?: number;
  avg_frequency?: number;
}

interface AdminGeneratorLogsTableProps {
  logs: AdminGeneratorLog[];
  onViewReport: (date: string, userId: string) => void;
}

export const AdminGeneratorLogsTable = ({ logs, onViewReport }: AdminGeneratorLogsTableProps) => {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Date</TableHead>
            <TableHead className="whitespace-nowrap">User</TableHead>
            <TableHead className="hidden md:table-cell whitespace-nowrap">Employee ID</TableHead>
            <TableHead className="whitespace-nowrap">Hours</TableHead>
            <TableHead className="hidden sm:table-cell whitespace-nowrap">Avg Power</TableHead>
            <TableHead className="hidden sm:table-cell whitespace-nowrap">Avg Freq</TableHead>
            <TableHead className="hidden lg:table-cell whitespace-nowrap">Progress</TableHead>
            <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8 text-sm">
                No generator logs for today
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log, index) => (
              <TableRow key={`${log.date}-${index}`}>
                <TableCell className="font-medium text-sm whitespace-nowrap">
                  {format(new Date(log.date), 'MMM d')}
                </TableCell>
                <TableCell className="text-sm max-w-[120px] truncate">{log.user_name}</TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {log.employee_id}
                </TableCell>
                <TableCell className="text-sm">
                  <span className="font-medium">{log.hours_logged}</span>
                  <span className="text-muted-foreground">/24</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm">
                  {log.avg_power ? `${log.avg_power.toFixed(1)} kW` : '-'}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm">
                  {log.avg_frequency ? `${log.avg_frequency.toFixed(2)} Hz` : '-'}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
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
                    onClick={() => onViewReport(log.date, log.user_id)}
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
