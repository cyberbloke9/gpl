import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, User, CheckCircle2 } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
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
  const [resolvingIssueId, setResolvingIssueId] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
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
          query = query
            .eq('user_id', user.id)
            .neq('status', 'resolved');
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

  const handleResolveIssue = async (issueId: string) => {
    setIsResolving(true);
    try {
      const { error } = await supabase
        .from('flagged_issues')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolution_notes: 'Resolved by admin',
        })
        .eq('id', issueId);

      if (error) throw error;

      toast({
        title: 'Issue Resolved',
        description: 'The issue has been marked as resolved.',
      });

      setResolvingIssueId(null);
    } catch (error) {
      console.error('Error resolving issue:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve issue. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Flagged Issues</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Monitor and track reported issues
          </p>
        </div>

        <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <h3 className="text-xs sm:text-sm font-medium">Filter Issues</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full h-8 sm:h-10 text-xs sm:text-sm">
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
                <SelectTrigger className="w-full h-8 sm:h-10 text-xs sm:text-sm">
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
                <SelectTrigger className="w-full h-8 sm:h-10 text-xs sm:text-sm">
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
            <CardContent className="py-8 sm:py-12 text-center text-muted-foreground">
              <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-base sm:text-lg">No issues reported yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {issues.map((issue) => (
              <Card key={issue.id} className="border-l-4" style={{
                borderLeftColor: issue.severity === 'critical' || issue.severity === 'high' 
                  ? 'hsl(var(--destructive))' 
                  : 'hsl(var(--border))'
              }}>
                <CardHeader className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="break-words">{issue.issue_code}</span>
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {getIssueContext(issue)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={getSeverityColor(issue.severity)} className="text-xs">
                        {issue.severity}
                      </Badge>
                      <Badge variant={getStatusColor(issue.status)} className="text-xs">
                        {issue.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
                  <div>
                    <p className="text-xs sm:text-sm font-medium mb-1">Location:</p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      {issue.module} → {issue.section} → {issue.item}
                      {issue.unit && ` → ${issue.unit}`}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm font-medium mb-1">Description:</p>
                    <p className="text-xs sm:text-sm break-words">{issue.description}</p>
                  </div>

                  {userRole === 'admin' && issue.status !== 'resolved' && (
                    <div className="pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setResolvingIssueId(issue.id)}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark as Resolved
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4 border-t text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="break-words">
                        {format(new Date(issue.reported_at), 'PPp')}
                      </span>
                    </div>
                    
                    {userRole === 'admin' && issue.profiles && (
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="break-words">
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6">
            <p className="text-xs sm:text-sm text-muted-foreground">
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

        <AlertDialog open={resolvingIssueId !== null} onOpenChange={(open) => !open && setResolvingIssueId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Resolution</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark this issue as resolved? This action will update the issue status and hide it from operators' view.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isResolving}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => resolvingIssueId && handleResolveIssue(resolvingIssueId)}
                disabled={isResolving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isResolving ? 'Resolving...' : 'Confirm'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
