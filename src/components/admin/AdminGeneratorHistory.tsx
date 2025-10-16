import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, User, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import React from 'react';

interface AdminGeneratorHistoryProps {
  onViewReport: (date: string) => void;
}

export const AdminGeneratorHistory = ({ onViewReport }: AdminGeneratorHistoryProps) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7');
  const [statusFilter, setStatusFilter] = useState<'all' | 'finalized' | 'in_progress'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadLogs();
  }, [dateRange, statusFilter, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, statusFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));

      let query = supabase
        .from('generator_logs')
        .select('*')
        .gte('date', daysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .order('logged_at', { ascending: false });

      if (statusFilter === 'finalized') {
        query = query.eq('finalized', true);
      } else if (statusFilter === 'in_progress') {
        query = query.eq('finalized', false);
      }

      const { data: logsData, error } = await query;

      if (error) throw error;

      // Get user profiles
      const userIds = [...new Set(logsData?.map(log => log.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, employee_id')
        .in('id', userIds);

      const profilesMap = profilesData?.reduce((acc: any, profile: any) => {
        acc[profile.id] = profile;
        return acc;
      }, {}) || {};

      // Group by date only (collective progress across all users)
      const grouped = logsData?.reduce((acc: any, log: any) => {
        const key = log.date;
        const profile = profilesMap[log.user_id];
        if (!acc[key]) {
          acc[key] = {
            date: log.date,
            users: new Set(),
            employee_ids: new Set(),
            unique_hours: new Set(),
            finalized: log.finalized,
            finalized_at: log.finalized_at,
            total_power: 0,
            total_frequency: 0,
            logs: []
          };
        }
        acc[key].users.add(profile?.full_name || 'Unknown');
        if (profile?.employee_id) {
          acc[key].employee_ids.add(profile.employee_id);
        }
        acc[key].unique_hours.add(log.hour);
        if (log.gen_kw) acc[key].total_power += log.gen_kw;
        if (log.gen_frequency) acc[key].total_frequency += log.gen_frequency;
        acc[key].logs.push(log);
        return acc;
      }, {}) || {};

      const groupedArray = Object.values(grouped).map((group: any) => ({
        date: group.date,
        user_names: Array.from(group.users).join(', '),
        employee_ids: Array.from(group.employee_ids).join(', '),
        hours_logged: group.unique_hours.size,
        completion_percentage: Math.round((group.unique_hours.size / 24) * 100),
        avg_power: group.logs.length > 0 ? (group.total_power / group.logs.length).toFixed(2) : 0,
        avg_frequency: group.logs.length > 0 ? (group.total_frequency / group.logs.length).toFixed(2) : 0,
        finalized: group.finalized,
        finalized_at: group.finalized_at,
        logs: group.logs
      }));

      // Pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE;
      const paginatedLogs = groupedArray.slice(from, to);

      setLogs(paginatedLogs);
      setTotalCount(groupedArray.length);
    } catch (error) {
      console.error('Error loading generator logs:', error);
      setLogs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Generator Logs Found</h3>
        <p className="text-muted-foreground">
          No generator logs found in the last {dateRange} days.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h3 className="text-lg font-semibold">Generator Logs History</h3>
          <p className="text-sm text-muted-foreground">
            View all generator logs from all users
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'finalized' | 'in_progress')}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="finalized">Finalized Only</SelectItem>
              <SelectItem value="in_progress">In Progress Only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {logs.map((log, idx) => (
          <Card key={`${log.date}-${idx}`} className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base truncate">
                      {log.user_names}
                    </span>
                  </div>
                  {log.employee_ids && (
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      ID: {log.employee_ids}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={log.finalized ? 'default' : 'secondary'} className="text-xs">
                    {log.finalized ? 'Finalized' : 'In Progress'}
                  </Badge>
                  {(() => {
                    const logDate = new Date(log.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    logDate.setHours(0, 0, 0, 0);
                    const isMissed = logDate < today && log.completion_percentage < 100;
                    
                    return isMissed ? (
                      <Badge className="bg-red-600 text-white font-bold text-xs">
                        Missed
                      </Badge>
                    ) : null;
                  })()}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{format(new Date(log.date), 'PPP')}</span>
                  </div>
                  {log.finalized_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Finalized: {format(new Date(log.finalized_at), 'p')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
                  <span className="text-muted-foreground whitespace-nowrap">
                    Hours: {log.hours_logged}/24
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    Completion: {log.completion_percentage}%
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    Avg Power: {log.avg_power} kW
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    Avg Freq: {log.avg_frequency} Hz
                  </span>
                </div>
              </div>

              <Button
                onClick={() => onViewReport(log.date)}
                className="w-full lg:w-auto flex-shrink-0"
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                View Report
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {totalCount > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} logs
          </p>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.ceil(totalCount / ITEMS_PER_PAGE) }, (_, i) => i + 1)
                .filter(page => {
                  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
                  return page === 1 || 
                         page === totalPages || 
                         Math.abs(page - currentPage) <= 1;
                })
                .map((page, idx, arr) => (
                  <React.Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / ITEMS_PER_PAGE), p + 1))}
                  className={currentPage >= Math.ceil(totalCount / ITEMS_PER_PAGE) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};
