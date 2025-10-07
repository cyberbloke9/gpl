import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { AdminOverviewCards } from '@/components/admin/AdminOverviewCards';
import { TodaysChecklistsTable } from '@/components/admin/TodaysChecklistsTable';
import { AdminTransformerLogsTable } from '@/components/admin/AdminTransformerLogsTable';
import { ChecklistReportViewer } from '@/components/checklist/ChecklistReportViewer';
import { TransformerReportViewer } from '@/components/transformer/TransformerReportViewer';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    todaysChecklists: 0,
    completedToday: 0,
    activeProblems: 0,
  });
  const [todaysChecklists, setTodaysChecklists] = useState<any[]>([]);
  const [transformerLogs, setTransformerLogs] = useState<any[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);
  const [isChecklistViewerOpen, setIsChecklistViewerOpen] = useState(false);
  const [selectedTransformerReport, setSelectedTransformerReport] = useState<any>(null);
  const [isTransformerViewerOpen, setIsTransformerViewerOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checklists',
        },
        () => {
          loadDashboardData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transformer_logs',
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadDashboardData = async () => {
    const today = new Date().toISOString().split('T')[0];

    // Get total users count
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get today's checklists with user details
    const { data: checklists } = await supabase
      .from('checklists')
      .select(`
        *,
        profiles:user_id (
          full_name,
          employee_id
        )
      `)
      .eq('date', today)
      .order('start_time', { ascending: false });

    // Calculate stats
    const completed = checklists?.filter((c) => c.submitted || c.status === 'completed').length || 0;
    const totalProblems = checklists?.reduce((sum, c) => sum + (c.problem_count || 0), 0) || 0;

    setStats({
      totalUsers: usersCount || 0,
      todaysChecklists: checklists?.length || 0,
      completedToday: completed,
      activeProblems: totalProblems,
    });

    // Format checklists for table
    const formattedChecklists = checklists?.map((c: any) => ({
      id: c.id,
      user_name: c.profiles?.full_name || 'Unknown',
      employee_id: c.profiles?.employee_id || '',
      start_time: c.start_time,
      status: c.status,
      completion_percentage: c.completion_percentage || 0,
      problem_count: c.problem_count || 0,
      flagged_issues_count: c.flagged_issues_count || 0,
      submitted: c.submitted || false,
    })) || [];

    setTodaysChecklists(formattedChecklists);

    // Get today's transformer logs
    const { data: transformerData } = await supabase
      .from('transformer_logs')
      .select(`
        *,
        profiles:user_id (
          full_name,
          employee_id
        )
      `)
      .eq('date', today)
      .order('logged_at', { ascending: false });

    // Group transformer logs by date, transformer_number, and user
    const groupedTransformerLogs = transformerData?.reduce((acc: any, log: any) => {
      const key = `${log.date}-${log.transformer_number}-${log.user_id}`;
      if (!acc[key]) {
        acc[key] = {
          date: log.date,
          transformer_number: log.transformer_number,
          user_name: log.profiles?.full_name || 'Unknown',
          employee_id: log.profiles?.employee_id || '',
          hours_logged: 0,
          logs: []
        };
      }
      acc[key].hours_logged++;
      acc[key].logs.push(log);
      return acc;
    }, {}) || {};

    const formattedTransformerLogs = Object.values(groupedTransformerLogs).map((group: any) => ({
      ...group,
      completion_percentage: Math.round((group.hours_logged / 24) * 100)
    }));

    setTransformerLogs(formattedTransformerLogs);
  };

  const handleViewReport = async (checklistId: string) => {
    const { data, error } = await supabase
      .from('checklists')
      .select('*')
      .eq('id', checklistId)
      .single();

    if (!error && data) {
      setSelectedChecklist(data);
      setIsChecklistViewerOpen(true);
    }
  };

  const handleViewTransformerReport = async (date: string, transformerNumber: number) => {
    const { data, error } = await supabase
      .from('transformer_logs')
      .select('*')
      .eq('date', date)
      .eq('transformer_number', transformerNumber)
      .order('hour', { ascending: true });

    if (!error && data) {
      setSelectedTransformerReport({ date, transformerNumber, logs: data });
      setIsTransformerViewerOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Admin Dashboard</h1>

        <AdminOverviewCards
          totalUsers={stats.totalUsers}
          todaysChecklists={stats.todaysChecklists}
          completedToday={stats.completedToday}
          activeProblems={stats.activeProblems}
        />

        <Tabs defaultValue="today" className="space-y-4">
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-5 h-auto">
            <TabsTrigger value="today" className="text-xs sm:text-sm">Checklists</TabsTrigger>
            <TabsTrigger value="transformer" className="text-xs sm:text-sm">Transformer</TabsTrigger>
            <TabsTrigger value="problems" className="text-xs sm:text-sm">Problems</TabsTrigger>
            <TabsTrigger value="issues" className="text-xs sm:text-sm">Issues</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">History</TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <Card className="p-3 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Today's Operator Checklists</h2>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <TodaysChecklistsTable
                  checklists={todaysChecklists}
                  onViewReport={handleViewReport}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="transformer">
            <Card className="p-3 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Today's Transformer Logs</h2>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <AdminTransformerLogsTable
                  logs={transformerLogs}
                  onViewReport={handleViewTransformerReport}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="problems">
            <Card className="p-3 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Problem Detection Dashboard</h2>
              <p className="text-sm text-muted-foreground">Coming soon - detailed problem tracking</p>
            </Card>
          </TabsContent>

          <TabsContent value="issues">
            <Card className="p-3 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Flagged Issues Management</h2>
              <p className="text-sm text-muted-foreground">Coming soon - issue management interface</p>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-3 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Historical Reports</h2>
              <p className="text-sm text-muted-foreground">Coming soon - date range reports and analytics</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <ChecklistReportViewer
        checklist={selectedChecklist}
        isOpen={isChecklistViewerOpen}
        onClose={() => setIsChecklistViewerOpen(false)}
      />

      <TransformerReportViewer
        isOpen={isTransformerViewerOpen}
        onClose={() => setIsTransformerViewerOpen(false)}
        report={selectedTransformerReport}
      />
    </div>
  );
}
