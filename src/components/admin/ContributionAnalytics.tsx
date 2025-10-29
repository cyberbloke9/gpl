import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserContribution {
  user_id: string;
  full_name: string;
  employee_id: string | null;
  total_actions: number;
  modules_completed: number;
  photos_uploaded: number;
  checklists_submitted: number;
}

interface ModuleContribution {
  module_name: string;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const ContributionAnalytics = () => {
  const [userContributions, setUserContributions] = useState<UserContribution[]>([]);
  const [moduleData, setModuleData] = useState<ModuleContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch activity logs with user profiles
      const { data: logs, error } = await supabase
        .from('activity_logs')
        .select(`
          user_id,
          action_type,
          module_number,
          profiles!activity_logs_user_id_fkey(full_name, employee_id)
        `)
        .gte('timestamp', today.toISOString())
        .lt('timestamp', tomorrow.toISOString());

      if (error) throw error;

      // Process user contributions
      const userMap = new Map<string, UserContribution>();
      const moduleMap = new Map<number, number>();

      logs?.forEach((log: any) => {
        const userId = log.user_id;
        const profile = log.profiles;
        
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            user_id: userId,
            full_name: profile?.full_name || 'Unknown',
            employee_id: profile?.employee_id,
            total_actions: 0,
            modules_completed: 0,
            photos_uploaded: 0,
            checklists_submitted: 0
          });
        }

        const user = userMap.get(userId)!;
        user.total_actions++;

        if (log.action_type === 'module_complete') user.modules_completed++;
        if (log.action_type === 'photo_upload') user.photos_uploaded++;
        if (log.action_type === 'checklist_submit') user.checklists_submitted++;

        // Count module contributions
        if (log.module_number) {
          moduleMap.set(log.module_number, (moduleMap.get(log.module_number) || 0) + 1);
        }
      });

      setUserContributions(Array.from(userMap.values()).sort((a, b) => b.total_actions - a.total_actions));

      // Format module data
      const moduleNames: Record<number, string> = {
        1: 'Unit Inspection',
        2: 'Generator Checks',
        3: 'De-Watering Sump',
        4: 'OD Yard & Control'
      };

      const moduleDataArray = Array.from(moduleMap.entries()).map(([num, count]) => ({
        module_name: moduleNames[num] || `Module ${num}`,
        count
      }));

      setModuleData(moduleDataArray);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Today's User Contributions
          </CardTitle>
          <CardDescription>Actions performed by each user today</CardDescription>
        </CardHeader>
        <CardContent>
          {userContributions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No contributions today</p>
          ) : (
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
              <BarChart data={userContributions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="full_name" 
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 80 : 30}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }} />
                <Bar dataKey="total_actions" fill="hsl(var(--chart-1))" name="Total Actions" />
                <Bar dataKey="modules_completed" fill="hsl(var(--chart-2))" name="Modules Completed" />
                <Bar dataKey="photos_uploaded" fill="hsl(var(--chart-3))" name="Photos Uploaded" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Module Activity Distribution</CardTitle>
            <CardDescription>Activity breakdown by module today</CardDescription>
          </CardHeader>
          <CardContent>
            {moduleData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No module activity today</p>
            ) : (
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                <PieChart>
                  <Pie
                    data={moduleData}
                    cx="50%"
                    cy="50%"
                    labelLine={!isMobile}
                    label={isMobile ? false : ({ module_name, percent }) => `${module_name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={isMobile ? 60 : 80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {moduleData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contribution Leaderboard</CardTitle>
            <CardDescription>Most active contributors today</CardDescription>
          </CardHeader>
          <CardContent>
            {userContributions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No activity today</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {userContributions.slice(0, 5).map((user, index) => (
                  <div key={user.user_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs sm:text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm sm:text-base truncate">{user.full_name}</div>
                        {user.employee_id && (
                          <div className="text-xs text-muted-foreground truncate">{user.employee_id}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="font-bold text-base sm:text-lg">{user.total_actions}</div>
                      <div className="text-xs text-muted-foreground">actions</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
