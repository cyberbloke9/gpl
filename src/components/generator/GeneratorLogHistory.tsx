import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { GeneratorReportViewer } from './GeneratorReportViewer';
import { Eye, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { GeneratorLog } from '@/types/generator';

interface GeneratorLogHistoryProps {
  userId?: string;
}

export function GeneratorLogHistory({ userId }: GeneratorLogHistoryProps) {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [logs, setLogs] = useState<GeneratorLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLogs();
  }, [userId, startDate, endDate]);

  const fetchLogs = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      let query = supabase
        .from('generator_logs')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .order('hour', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load generator logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const groupLogsByDate = () => {
    const grouped = new Map<string, GeneratorLog[]>();
    logs.forEach((log) => {
      const date = log.date;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(log);
    });
    return grouped;
  };

  const toggleDateExpansion = (date: string) => {
    setExpandedDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const groupedLogs = groupLogsByDate();

  if (selectedDate) {
    const dateLogs = logs.filter((log) => log.date === selectedDate);
    return (
      <div>
        <Button
          onClick={() => setSelectedDate(null)}
          variant="outline"
          className="mb-4"
        >
          ← Back to History
        </Button>
        <GeneratorReportViewer
          isOpen={true}
          onClose={() => setSelectedDate(null)}
          report={dateLogs.length > 0 ? { date: selectedDate, logs: dateLogs } : null}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Generator Log History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchLogs} disabled={loading}>
              {loading ? 'Loading...' : 'Search'}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No logs found for the selected date range
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from(groupedLogs.entries()).map(([date, dateLogs]) => {
              const isExpanded = expandedDates.has(date);
              const completedHours = dateLogs.length;
              const completionPercentage = Math.round((completedHours / 24) * 100);
              
              // Check if date has passed
              const logDate = new Date(date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              logDate.setHours(0, 0, 0, 0);
              const isMissed = logDate < today && completedHours < 24;

              return (
                <Card key={date} className="overflow-hidden">
                  <div
                    className="p-4 bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => toggleDateExpansion(date)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                        <div>
                          <h3 className="font-semibold">
                            {format(new Date(date), 'MMMM dd, yyyy')}
                          </h3>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                              {completedHours} / 24 hours logged ({completionPercentage}%)
                            </p>
                            {isMissed && (
                              <Badge className="bg-red-600 text-white font-bold ml-2">
                                Missed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(date);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Report
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Hour</TableHead>
                            <TableHead>Winding Temp (Avg)</TableHead>
                            <TableHead>Bearing Temp (Avg)</TableHead>
                            <TableHead>Power (kW)</TableHead>
                            <TableHead>Frequency (Hz)</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dateLogs.map((log) => {
                            const avgWindingTemp =
                              [
                                log.winding_temp_r1,
                                log.winding_temp_r2,
                                log.winding_temp_y1,
                                log.winding_temp_y2,
                                log.winding_temp_b1,
                                log.winding_temp_b2,
                              ]
                                .filter((t) => t != null)
                                .reduce((sum, t) => sum + t!, 0) /
                              [
                                log.winding_temp_r1,
                                log.winding_temp_r2,
                                log.winding_temp_y1,
                                log.winding_temp_y2,
                                log.winding_temp_b1,
                                log.winding_temp_b2,
                              ].filter((t) => t != null).length;

                            const avgBearingTemp =
                              [
                                log.bearing_g_de_brg_main_ch7,
                                log.bearing_g_nde_brg_stand_ch8,
                                log.bearing_thrust_1_ch9,
                                log.bearing_thrust_2_ch10,
                                log.bearing_bgb_low_speed_ch11,
                                log.bearing_bgb_high_speed_ch12,
                                log.bearing_tgb_low_speed_ch13,
                                log.bearing_tgb_high_speed_ch14,
                              ]
                                .filter((t) => t != null)
                                .reduce((sum, t) => sum + t!, 0) /
                              [
                                log.bearing_g_de_brg_main_ch7,
                                log.bearing_g_nde_brg_stand_ch8,
                                log.bearing_thrust_1_ch9,
                                log.bearing_thrust_2_ch10,
                                log.bearing_bgb_low_speed_ch11,
                                log.bearing_bgb_high_speed_ch12,
                                log.bearing_tgb_low_speed_ch13,
                                log.bearing_tgb_high_speed_ch14,
                              ].filter((t) => t != null).length;

                            return (
                              <TableRow key={log.id}>
                                <TableCell className="font-medium">
                                  {log.hour.toString().padStart(2, '0')}:00
                                </TableCell>
                                <TableCell>
                                  {avgWindingTemp ? `${avgWindingTemp.toFixed(1)}°C` : '-'}
                                </TableCell>
                                <TableCell>
                                  {avgBearingTemp ? `${avgBearingTemp.toFixed(1)}°C` : '-'}
                                </TableCell>
                                <TableCell>{log.gen_kw?.toFixed(2) || '-'}</TableCell>
                                <TableCell>{log.gen_frequency?.toFixed(2) || '-'}</TableCell>
                                <TableCell>
                                  {log.finalized ? (
                                    <span className="text-green-600 font-medium">Finalized</span>
                                  ) : (
                                    <span className="text-blue-600">In Progress</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
