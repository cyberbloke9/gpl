import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Database, TrendingUp, Activity } from 'lucide-react';
import { DatabaseStats, DailySubmission } from '@/types/admin';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getTodayIST, getFirstDayOfMonthIST, getDateDaysAgoIST, formatIST } from '@/lib/timezone-utils';
import { format } from 'date-fns';

// Deep, high-contrast colors for better visualization
const CHART_COLORS = {
  checklists: '#0ea5e9',    // Deep Sky Blue
  transformer: '#8b5cf6',   // Deep Purple
  generator: '#f59e0b',     // Deep Amber
  open: '#ef4444',          // Deep Red (for open issues)
  resolved: '#10b981',      // Deep Green (for resolved issues)
};

export const DatabaseMonitoring = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [dailyData, setDailyData] = useState<DailySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDatabaseStats();
    loadDailySubmissions();
  }, []);

  const loadDatabaseStats = async () => {
    try {
      const today = getTodayIST();
      const firstDayOfMonth = getFirstDayOfMonthIST();

      // Checklists
      const { count: totalChecklists } = await supabase
        .from('checklists')
        .select('*', { count: 'exact', head: true });

      const { count: checklistsThisMonth } = await supabase
        .from('checklists')
        .select('*', { count: 'exact', head: true })
        .gte('date', firstDayOfMonth);

      const { count: checklistsToday } = await supabase
        .from('checklists')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);

      // Transformer Logs
      const { count: totalTransformer } = await supabase
        .from('transformer_logs')
        .select('*', { count: 'exact', head: true });

      const { count: transformerThisMonth } = await supabase
        .from('transformer_logs')
        .select('*', { count: 'exact', head: true })
        .gte('date', firstDayOfMonth);

      const { count: transformerToday } = await supabase
        .from('transformer_logs')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);

      // Generator Logs
      const { count: totalGenerator } = await supabase
        .from('generator_logs')
        .select('*', { count: 'exact', head: true });

      const { count: generatorThisMonth } = await supabase
        .from('generator_logs')
        .select('*', { count: 'exact', head: true })
        .gte('date', firstDayOfMonth);

      const { count: generatorToday } = await supabase
        .from('generator_logs')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);

      // Issues
      const { count: totalIssues } = await supabase
        .from('flagged_issues')
        .select('*', { count: 'exact', head: true });

      const { count: openIssues } = await supabase
        .from('flagged_issues')
        .select('*', { count: 'exact', head: true })
        .in('status', ['reported', 'in_progress']);

      const { count: resolvedIssues } = await supabase
        .from('flagged_issues')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved');

      setStats({
        total_checklists: totalChecklists || 0,
        checklists_this_month: checklistsThisMonth || 0,
        checklists_today: checklistsToday || 0,
        total_transformer_logs: totalTransformer || 0,
        transformer_logs_this_month: transformerThisMonth || 0,
        transformer_logs_today: transformerToday || 0,
        total_generator_logs: totalGenerator || 0,
        generator_logs_this_month: generatorThisMonth || 0,
        generator_logs_today: generatorToday || 0,
        total_issues: totalIssues || 0,
        open_issues: openIssues || 0,
        resolved_issues: resolvedIssues || 0,
      });
    } catch (error) {
      console.error('Error loading database stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailySubmissions = async () => {
    try {
      const dateStr = getDateDaysAgoIST(30);

      const { data: checklists } = await supabase
        .from('checklists')
        .select('date')
        .gte('date', dateStr);

      const { data: transformer } = await supabase
        .from('transformer_logs')
        .select('date')
        .gte('date', dateStr);

      const { data: generator } = await supabase
        .from('generator_logs')
        .select('date')
        .gte('date', dateStr);

      // Group by date
      const dataMap = new Map<string, DailySubmission>();
      
      checklists?.forEach(item => {
        const date = item.date;
        if (!dataMap.has(date)) {
          dataMap.set(date, { date, checklists: 0, transformer_logs: 0, generator_logs: 0 });
        }
        dataMap.get(date)!.checklists++;
      });

      transformer?.forEach(item => {
        const date = item.date;
        if (!dataMap.has(date)) {
          dataMap.set(date, { date, checklists: 0, transformer_logs: 0, generator_logs: 0 });
        }
        dataMap.get(date)!.transformer_logs++;
      });

      generator?.forEach(item => {
        const date = item.date;
        if (!dataMap.has(date)) {
          dataMap.set(date, { date, checklists: 0, transformer_logs: 0, generator_logs: 0 });
        }
        dataMap.get(date)!.generator_logs++;
      });

      const sortedData = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
      setDailyData(sortedData);
    } catch (error) {
      console.error('Error loading daily submissions:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading database statistics...</div>;
  }

  const issuesPieData = [
    { name: 'Open', value: stats?.open_issues || 0, color: CHART_COLORS.open },
    { name: 'Resolved', value: stats?.resolved_issues || 0, color: CHART_COLORS.resolved },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4" />
              Checklists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">All Time:</span>
                <span className="font-semibold">{stats?.total_checklists}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">This Month:</span>
                <span className="font-semibold">{stats?.checklists_this_month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Today:</span>
                <span className="font-semibold">{stats?.checklists_today}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Transformer Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">All Time:</span>
                <span className="font-semibold">{stats?.total_transformer_logs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">This Month:</span>
                <span className="font-semibold">{stats?.transformer_logs_this_month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Today:</span>
                <span className="font-semibold">{stats?.transformer_logs_today}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Generator Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">All Time:</span>
                <span className="font-semibold">{stats?.total_generator_logs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">This Month:</span>
                <span className="font-semibold">{stats?.generator_logs_this_month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Today:</span>
                <span className="font-semibold">{stats?.generator_logs_today}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Submissions (Last 30 Days)</CardTitle>
          <CardDescription>Trend of submissions over time</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(date) => format(new Date(date), 'PPP')}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Line 
                type="monotone" 
                dataKey="checklists" 
                stroke={CHART_COLORS.checklists}
                strokeWidth={2.5}
                name="Checklists" 
                dot={{ fill: CHART_COLORS.checklists, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="transformer_logs" 
                stroke={CHART_COLORS.transformer}
                strokeWidth={2.5}
                name="Transformer" 
                dot={{ fill: CHART_COLORS.transformer, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="generator_logs" 
                stroke={CHART_COLORS.generator}
                strokeWidth={2.5}
                name="Generator" 
                dot={{ fill: CHART_COLORS.generator, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issue Status Distribution</CardTitle>
            <CardDescription>Open vs Resolved issues</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={issuesPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {issuesPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issues Summary</CardTitle>
            <CardDescription>Current issue statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                <span className="text-sm font-medium text-muted-foreground">Total Issues:</span>
                <span className="text-2xl font-bold">{stats?.total_issues}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 border border-red-200">
                <span className="text-sm font-medium text-red-700">Open Issues:</span>
                <span className="text-2xl font-bold text-red-600">{stats?.open_issues}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 border border-green-200">
                <span className="text-sm font-medium text-green-700">Resolved Issues:</span>
                <span className="text-2xl font-bold text-green-600">{stats?.resolved_issues}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
