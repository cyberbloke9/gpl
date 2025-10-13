import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface FlaggedIssue {
  id: string;
  issue_code: string;
  module: string;
  section: string;
  item: string;
  unit?: string;
  severity: string;
  description: string;
  status: string;
  reported_at: string;
  user_id: string;
  checklist_id?: string;
  transformer_log_id?: string;
  profiles?: {
    full_name: string;
    employee_id: string;
  };
  checklists?: {
    date: string;
  };
  transformer_logs?: {
    date: string;
    hour: number;
    transformer_number: number;
  };
}

export default function Issues() {
  const { user, userRole } = useAuth();
  const [issues, setIssues] = useState<FlaggedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7');
  const [statusFilter, setStatusFilter] = useState<'all' | 'reported' | 'in_progress' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchIssues = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));

        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        let query = supabase
          .from('flagged_issues')
          .select(`
            *,
            profiles:user_id (
              full_name,
              employee_id
            ),
            checklists:checklist_id (date),
            transformer_logs:transformer_log_id (date, hour, transformer_number)
          `, { count: 'exact' })
          .gte('reported_at', daysAgo.toISOString())
          .order('reported_at', { ascending: false })
          .range(from, to);

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        if (severityFilter !== 'all') {
          query = query.eq('severity', severityFilter);
        }

        if (userRole !== 'admin') {
          query = query.eq('user_id', user.id);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        setIssues(data || []);
        setTotalCount(count || 0);
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();

    // Set up realtime subscription
    const channel = supabase
      .channel('flagged-issues-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flagged_issues',
        },
        () => {
          fetchIssues();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userRole, dateRange, statusFilter, severityFilter, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, statusFilter, severityFilter]);

  const getIssueContext = (issue: FlaggedIssue) => {
    if (issue.checklist_id && issue.checklists) {
      return `Checklist - ${format(new Date(issue.checklists.date), 'PP')}`;
    } else if (issue.transformer_log_id && issue.transformer_logs) {
      const log = issue.transformer_logs;
      return `Transformer ${log.transformer_number} - Hour ${log.hour}:00 - ${format(new Date(log.date), 'PP')}`;
    }
    return 'Unknown source';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported':
        return 'destructive';
      case 'in_progress':
        return 'default';
      case 'resolved':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Flagged Issues</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and track reported issues
          </p>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium">Filter Issues</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'reported' | 'in_progress' | 'resolved')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as 'all' | 'low' | 'medium' | 'high' | 'critical')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : issues.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No issues reported yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <Card key={issue.id} className="border-l-4" style={{
                borderLeftColor: issue.severity === 'critical' || issue.severity === 'high' 
                  ? 'hsl(var(--destructive))' 
                  : 'hsl(var(--border))'
              }}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {issue.issue_code}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getIssueContext(issue)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                      <Badge variant={getStatusColor(issue.status)}>
                        {issue.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Location:</p>
                    <p className="text-sm text-muted-foreground">
                      {issue.module} → {issue.section} → {issue.item}
                      {issue.unit && ` → ${issue.unit}`}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">Description:</p>
                    <p className="text-sm">{issue.description}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(issue.reported_at), 'PPp')}
                      </span>
                    </div>
                    
                    {userRole === 'admin' && issue.profiles && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>
                          Reported by: {issue.profiles.full_name}
                          {issue.profiles.employee_id && ` (${issue.profiles.employee_id})`}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalCount > ITEMS_PER_PAGE && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} issues
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
      </main>
    </div>
  );
}
