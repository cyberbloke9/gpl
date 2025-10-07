import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { AdminOverviewCards } from '@/components/admin/AdminOverviewCards';
import { TodaysChecklistsTable } from '@/components/admin/TodaysChecklistsTable';
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
  };

  const handleViewReport = (checklistId: string) => {
    // Navigate to detailed report view (to be implemented in Phase 3)
    console.log('View report:', checklistId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <AdminOverviewCards
          totalUsers={stats.totalUsers}
          todaysChecklists={stats.todaysChecklists}
          completedToday={stats.completedToday}
          activeProblems={stats.activeProblems}
        />

        <Tabs defaultValue="today" className="space-y-4">
          <TabsList>
            <TabsTrigger value="today">Today's Checklists</TabsTrigger>
            <TabsTrigger value="problems">Problem Detection</TabsTrigger>
            <TabsTrigger value="issues">Flagged Issues</TabsTrigger>
            <TabsTrigger value="history">Historical Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Today's Operator Checklists</h2>
              <TodaysChecklistsTable
                checklists={todaysChecklists}
                onViewReport={handleViewReport}
              />
            </Card>
          </TabsContent>

          <TabsContent value="problems">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Problem Detection Dashboard</h2>
              <p className="text-muted-foreground">Coming soon - detailed problem tracking</p>
            </Card>
          </TabsContent>

          <TabsContent value="issues">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Flagged Issues Management</h2>
              <p className="text-muted-foreground">Coming soon - issue management interface</p>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Historical Reports</h2>
              <p className="text-muted-foreground">Coming soon - date range reports and analytics</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
