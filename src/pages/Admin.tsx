import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { AdminOverviewCards } from '@/components/admin/AdminOverviewCards';
import { TodaysChecklistsTable } from '@/components/admin/TodaysChecklistsTable';
import { AdminTransformerLogsTable } from '@/components/admin/AdminTransformerLogsTable';
import { AdminGeneratorLogsTable } from '@/components/admin/AdminGeneratorLogsTable';
import { AdminGeneratorStats } from '@/components/admin/AdminGeneratorStats';
import { AdminChecklistHistory } from '@/components/admin/AdminChecklistHistory';
import { AdminTransformerHistory } from '@/components/admin/AdminTransformerHistory';
import { AdminGeneratorHistory } from '@/components/admin/AdminGeneratorHistory';
import { ChecklistReportViewer } from '@/components/checklist/ChecklistReportViewer';
import { TransformerReportViewer } from '@/components/transformer/TransformerReportViewer';
import { GeneratorReportViewer } from '@/components/generator/GeneratorReportViewer';
import { ExportPanel } from '@/components/admin/ExportPanel';
import { UserManagementPanel } from '@/components/admin/UserManagementPanel';
import { DatabaseMonitoring } from '@/components/admin/DatabaseMonitoring';
import { ActivityLogsPanel } from '@/components/admin/ActivityLogsPanel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    todaysChecklists: 0,
    todaysTransformerLogs: 0,
    todaysGeneratorLogs: 0,
  });
  const [todaysChecklists, setTodaysChecklists] = useState<any[]>([]);
  const [transformerLogs, setTransformerLogs] = useState<any[]>([]);
  const [generatorLogs, setGeneratorLogs] = useState<any[]>([]);
  const [generatorStats, setGeneratorStats] = useState({
    totalLogs: 0,
    hoursLogged: 0,
    avgPower: 0,
    avgFrequency: 0,
  });
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);
  const [isChecklistViewerOpen, setIsChecklistViewerOpen] = useState(false);
  const [selectedTransformerReport, setSelectedTransformerReport] = useState<any>(null);
  const [isTransformerViewerOpen, setIsTransformerViewerOpen] = useState(false);
  const [selectedGeneratorReport, setSelectedGeneratorReport] = useState<any>(null);
  const [isGeneratorViewerOpen, setIsGeneratorViewerOpen] = useState(false);

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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generator_logs',
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
    setLoading(true);
    try {
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

    // Get today's generator logs
    const { data: generatorData, error: generatorError } = await supabase
      .from('generator_logs')
      .select('*')
      .eq('date', today)
      .order('logged_at', { ascending: false });

    console.log('Generator Data Raw:', generatorData);
    console.log('Generator Error:', generatorError);

    // Get user profiles for generator logs
    const generatorUserIds = [...new Set(generatorData?.map(log => log.user_id) || [])];
    const { data: generatorProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, employee_id')
      .in('id', generatorUserIds);

    const generatorProfilesMap = generatorProfiles?.reduce((acc: any, profile: any) => {
      acc[profile.id] = profile;
      return acc;
    }, {}) || {};

    // Group generator logs by date and user
    const groupedGeneratorLogs = generatorData?.reduce((acc: any, log: any) => {
      const key = `${log.date}-${log.user_id}`;
      const profile = generatorProfilesMap[log.user_id];
      if (!acc[key]) {
        acc[key] = {
          date: log.date,
          user_id: log.user_id,
          user_name: profile?.full_name || 'Unknown',
          employee_id: profile?.employee_id || '',
          hours_logged: 0,
          logs: [],
          total_power: 0,
          total_frequency: 0,
        };
      }
      acc[key].hours_logged++;
      acc[key].logs.push(log);
      if (log.gen_kw) acc[key].total_power += log.gen_kw;
      if (log.gen_frequency) acc[key].total_frequency += log.gen_frequency;
      return acc;
    }, {}) || {};

    const formattedGeneratorLogs = Object.values(groupedGeneratorLogs).map((group: any) => ({
      date: group.date,
      user_name: group.user_name,
      employee_id: group.employee_id,
      user_id: group.user_id,
      hours_logged: group.hours_logged,
      completion_percentage: Math.round((group.hours_logged / 24) * 100),
      avg_power: group.hours_logged > 0 ? group.total_power / group.hours_logged : 0,
      avg_frequency: group.hours_logged > 0 ? group.total_frequency / group.hours_logged : 0,
    }));

    console.log('Formatted Generator Logs:', formattedGeneratorLogs);
    setGeneratorLogs(formattedGeneratorLogs);

    // Calculate stats - MOVED HERE after all data is fetched
    setStats({
      totalUsers: usersCount || 0,
      todaysChecklists: checklists?.length || 0,
      todaysTransformerLogs: transformerData?.length || 0,
      todaysGeneratorLogs: generatorData?.length || 0,
    });

    // Calculate generator stats
    const totalGeneratorLogs = generatorData?.length || 0;
    const uniqueHours = new Set(generatorData?.map(log => log.hour) || []).size;
    const avgPower = generatorData && generatorData.length > 0
      ? generatorData.reduce((sum, log) => sum + (log.gen_kw || 0), 0) / generatorData.length
      : 0;
    const avgFreq = generatorData && generatorData.length > 0
      ? generatorData.reduce((sum, log) => sum + (log.gen_frequency || 0), 0) / generatorData.length
      : 0;

    setGeneratorStats({
      totalLogs: totalGeneratorLogs,
      hoursLogged: uniqueHours,
      avgPower,
      avgFrequency: avgFreq,
    });

    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (checklistId: string) => {
    const { data, error } = await supabase
      .from('checklists')
      .select(`
        *,
        profiles:user_id (
          full_name,
          employee_id
        )
      `)
      .eq('id', checklistId)
      .single();

    if (!error && data) {
      setSelectedChecklist({
        ...data,
        userName: data.profiles?.full_name,
        employeeId: data.profiles?.employee_id
      });
      setIsChecklistViewerOpen(true);
    }
  };

  const handleViewTransformerReport = async (date: string, transformerNumber: number) => {
    const { data, error } = await supabase
      .from('transformer_logs')
      .select(`
        *,
        profiles:user_id (
          full_name,
          employee_id
        )
      `)
      .eq('date', date)
      .eq('transformer_number', transformerNumber)
      .order('hour', { ascending: true });

    if (!error && data && data.length > 0) {
      setSelectedTransformerReport({ 
        date, 
        transformerNumber, 
        logs: data,
        userName: data[0].profiles?.full_name,
        employeeId: data[0].profiles?.employee_id
      });
      setIsTransformerViewerOpen(true);
    }
  };

  const handleViewGeneratorReport = async (date: string, userId: string) => {
    console.log('Fetching generator report for:', { date, userId });
    
    // Fetch all logs for this date and user
    const { data: logs, error: logsError } = await supabase
      .from('generator_logs')
      .select('*')
      .eq('date', date)
      .eq('user_id', userId)
      .order('hour', { ascending: true });

    if (logsError) {
      console.error('Error fetching generator logs:', logsError);
      return;
    }

    // Fetch user profile info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, employee_id')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    console.log('Generator logs fetched:', logs);
    console.log('Profile fetched:', profile);

    if (logs && logs.length > 0) {
      setSelectedGeneratorReport({
        date,
        logs: logs as any[],
        userName: profile?.full_name,
        employeeId: profile?.employee_id,
      } as any);
      setIsGeneratorViewerOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Admin Dashboard</h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </Card>
            ))}
          </div>
        ) : (
          <AdminOverviewCards
            totalUsers={stats.totalUsers}
            todaysChecklists={stats.todaysChecklists}
            todaysTransformerLogs={stats.todaysTransformerLogs}
            todaysGeneratorLogs={stats.todaysGeneratorLogs}
          />
        )}

        <Tabs defaultValue="today" className="space-y-4">
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 h-auto gap-1 p-1">
            <TabsTrigger value="today" className="text-xs sm:text-sm px-2 py-1.5">Checklists</TabsTrigger>
            <TabsTrigger value="transformer" className="text-xs sm:text-sm px-2 py-1.5">Transformer</TabsTrigger>
            <TabsTrigger value="generator" className="text-xs sm:text-sm px-2 py-1.5">Generator</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm px-2 py-1.5">History</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm px-2 py-1.5">Users</TabsTrigger>
            <TabsTrigger value="database" className="text-xs sm:text-sm px-2 py-1.5">Database</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm px-2 py-1.5">Activity</TabsTrigger>
            <TabsTrigger value="export" className="text-xs sm:text-sm px-2 py-1.5">Export</TabsTrigger>
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

          <TabsContent value="generator">
            <div className="space-y-4">
              <AdminGeneratorStats
                totalLogs={generatorStats.totalLogs}
                hoursLogged={generatorStats.hoursLogged}
                avgPower={generatorStats.avgPower}
                avgFrequency={generatorStats.avgFrequency}
              />
              <Card className="p-3 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Today's Generator Logs</h2>
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <AdminGeneratorLogsTable
                    logs={generatorLogs}
                    onViewReport={handleViewGeneratorReport}
                  />
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-6">
              <Tabs defaultValue="checklists" className="space-y-4">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="checklists">Checklists</TabsTrigger>
                  <TabsTrigger value="transformer">Transformer Logs</TabsTrigger>
                  <TabsTrigger value="generator">Generator Logs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="checklists">
                  <AdminChecklistHistory onViewReport={handleViewReport} />
                </TabsContent>
                
                <TabsContent value="transformer">
                  <AdminTransformerHistory onViewReport={handleViewTransformerReport} />
                </TabsContent>
                
                <TabsContent value="generator">
                  <AdminGeneratorHistory onViewReport={handleViewGeneratorReport} />
                </TabsContent>
              </Tabs>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <UserManagementPanel />
          </TabsContent>

          <TabsContent value="database">
            <DatabaseMonitoring />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLogsPanel />
          </TabsContent>

          <TabsContent value="export">
            <ExportPanel />
          </TabsContent>
        </Tabs>
      </main>

      <ChecklistReportViewer
        checklist={selectedChecklist}
        isOpen={isChecklistViewerOpen}
        onClose={() => setIsChecklistViewerOpen(false)}
        userName={selectedChecklist?.userName}
        employeeId={selectedChecklist?.employeeId}
        isAdminView={true}
      />

      <TransformerReportViewer
        isOpen={isTransformerViewerOpen}
        onClose={() => setIsTransformerViewerOpen(false)}
        report={selectedTransformerReport}
        userName={selectedTransformerReport?.userName}
        employeeId={selectedTransformerReport?.employeeId}
      />

      <GeneratorReportViewer
        isOpen={isGeneratorViewerOpen}
        onClose={() => setIsGeneratorViewerOpen(false)}
        report={selectedGeneratorReport}
        userName={(selectedGeneratorReport as any)?.userName}
        employeeId={(selectedGeneratorReport as any)?.employeeId}
      />
    </div>
  );
}
