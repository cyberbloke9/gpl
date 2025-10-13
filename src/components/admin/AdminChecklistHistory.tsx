import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, User, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AdminChecklistHistoryProps {
  onViewReport: (checklistId: string) => void;
}

export const AdminChecklistHistory = ({ onViewReport }: AdminChecklistHistoryProps) => {
  const [checklists, setChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7'); // days
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'draft'>('all');

  useEffect(() => {
    loadChecklists();
  }, [dateRange, statusFilter]);

  const loadChecklists = async () => {
    setLoading(true);
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));

      let query = supabase
        .from('checklists')
        .select(`
          *,
          profiles:user_id (
            full_name,
            employee_id
          )
        `)
        .gte('date', daysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .order('submitted_at', { ascending: false });

      // Add status filter
      if (statusFilter === 'submitted') {
        query = query.eq('submitted', true);
      } else if (statusFilter === 'draft') {
        query = query.eq('submitted', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setChecklists(data || []);
    } catch (error) {
      // Silent fail - RLS will handle unauthorized access
      setChecklists([]);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Checklist History</h3>
          <p className="text-sm text-muted-foreground">
            View all submitted checklists from all users
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'submitted' | 'draft')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted Only</SelectItem>
              <SelectItem value="draft">Draft Only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
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
          <Card key={checklist.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {checklist.profiles?.full_name || 'Unknown User'}
                    </span>
                    {checklist.profiles?.employee_id && (
                      <Badge variant="outline" className="text-xs">
                        ID: {checklist.profiles.employee_id}
                      </Badge>
                    )}
                  </div>
                  <Badge variant={
                    checklist.submitted ? 'default' : 
                    getChecklistStatus(checklist) === 'Missed' ? 'destructive' : 
                    'secondary'
                  }>
                    {getChecklistStatus(checklist)}
                  </Badge>
                  {checklist.shift && (
                    <Badge variant="outline">{checklist.shift} Shift</Badge>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(checklist.date), 'PPP')}</span>
                  </div>
                  {checklist.submitted_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        Submitted: {format(new Date(checklist.submitted_at), 'p')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Completion: {checklist.completion_percentage || 0}%
                  </span>
                  {checklist.flagged_issues_count > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {checklist.flagged_issues_count} Issue{checklist.flagged_issues_count !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  {checklist.problem_count > 0 && (
                    <Badge variant="outline" className="text-xs border-orange-500 text-orange-700">
                      {checklist.problem_count} Problem{checklist.problem_count !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={() => onViewReport(checklist.id)}
                disabled={!checklist.submitted}
                className="md:w-auto w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                View Report
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
