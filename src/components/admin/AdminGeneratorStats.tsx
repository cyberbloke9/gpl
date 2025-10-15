import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Power, Clock, TrendingUp, Zap } from 'lucide-react';

interface AdminGeneratorStatsProps {
  totalLogs: number;
  hoursLogged: number;
  avgPower: number;
  avgFrequency: number;
}

export function AdminGeneratorStats({ 
  totalLogs, 
  hoursLogged, 
  avgPower, 
  avgFrequency 
}: AdminGeneratorStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Logs Today</CardTitle>
          <Power className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLogs}</div>
          <p className="text-xs text-muted-foreground">Generator log entries</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{hoursLogged}</div>
          <p className="text-xs text-muted-foreground">Out of 24 hours</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Power Output</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgPower.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">kW (Active Power)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Frequency</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgFrequency.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Hz</p>
        </CardContent>
      </Card>
    </div>
  );
}
