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

interface AdminChecklistHistoryProps {
  onViewReport: (checklistId: string) => void;
}

export const AdminChecklistHistory = ({ onViewReport }: AdminChecklistHistoryProps) => {
  const [checklists, setChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'draft'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadChecklists();
  }, [dateRange, statusFilter, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, statusFilter]);

  const loadChecklists = async () => {
    setLoading(true);
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('checklists')
        .select(`
          *,
          profiles:user_id (
            full_name,
            employee_id
          )
        `, { count: 'exact' })
        .gte('date', daysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .order('submitted_at', { ascending: false })
        .range(from, to);

      if (statusFilter === 'submitted') {
        query = query.eq('submitted', true);
      } else if (statusFilter === 'draft') {
        query = query.eq('submitted', false);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setChecklists(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading checklists:', error);
      setChecklists([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const getChecklistStatus = (checklist: any) => {
    if (checklist.submitted) return 'Submitted';
    
    const checklistDate = new Date(checklist.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checklistDate.setHours(0, 0, 0, 0);
    
    if (checklistDate < today) {
      return 'Missed';
    }
    
    return 'In Progress';
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

  if (checklists.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Checklists Found</h3>
        <p className="text-muted-foreground">
          No checklists have been submitted in the last {dateRange} days.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h3 className="text-lg font-semibold">Checklist History</h3>
          <p className="text-sm text-muted-foreground">
            View all submitted checklists from all users
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'submitted' | 'draft')}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted Only</SelectItem>
              <SelectItem value="draft">Draft Only</SelectItem>
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
        {checklists.map((checklist) => (
          <Card key={checklist.id} className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base truncate">
                      {checklist.profiles?.full_name || 'Unknown User'}
                    </span>
                  </div>
                  {checklist.profiles?.employee_id && (
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      ID: {checklist.profiles.employee_id}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={
                    checklist.submitted ? 'default' : 
                    getChecklistStatus(checklist) === 'Missed' ? 'destructive' : 
                    'secondary'
                  } className="text-xs">
                    {getChecklistStatus(checklist)}
                  </Badge>
                  {checklist.shift && (
                    <Badge variant="outline" className="text-xs">{checklist.shift} Shift</Badge>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{format(new Date(checklist.date), 'PPP')}</span>
                  </div>
                  {checklist.submitted_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Submitted: {format(new Date(checklist.submitted_at), 'p')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
                  <span className="text-muted-foreground whitespace-nowrap">
                    Completion: {checklist.completion_percentage || 0}%
                  </span>
                  {checklist.flagged_issues_count > 0 && (
                    <Badge variant="destructive" className="text-xs flex-shrink-0">
                      {checklist.flagged_issues_count} Issue{checklist.flagged_issues_count !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  {checklist.problem_count > 0 && (
                    <Badge variant="outline" className="text-xs border-orange-500 text-orange-700 flex-shrink-0">
                      {checklist.problem_count} Problem{checklist.problem_count !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={() => onViewReport(checklist.id)}
                disabled={!checklist.submitted}
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
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} checklists
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
