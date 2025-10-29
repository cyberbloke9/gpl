import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Users, Activity } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActiveUser {
  user_id: string;
  full_name: string;
  employee_id: string | null;
  module_number: number | null;
  last_activity: string;
  is_active: boolean;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  module_number: number | null;
  timestamp: string;
  full_name: string;
}

export const UserActivityMonitor = () => {
  const [activeSessions, setActiveSessions] = useState<ActiveUser[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Subscribe to realtime updates
    const sessionsChannel = supabase
      .channel('user-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_sessions'
        },
        () => loadData()
      )
      .subscribe();

    const activityChannel = supabase
      .channel('activity-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs'
        },
        () => loadRecentActivity()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(activityChannel);
    };
  }, []);

  const loadData = async () => {
    await Promise.all([loadActiveSessions(), loadRecentActivity()]);
    setLoading(false);
  };

  const loadActiveSessions = async () => {
    const { data, error } = await supabase
      .from('user_sessions')
      .select(`
        user_id,
        module_number,
        last_activity,
        is_active,
        profiles!user_sessions_user_id_fkey(full_name, employee_id)
      `)
      .eq('is_active', true)
      .order('last_activity', { ascending: false });

    if (error) {
      console.error('Error loading active sessions:', error);
      return;
    }

    const sessions = data.map(session => ({
      user_id: session.user_id,
      full_name: (session.profiles as any)?.full_name || 'Unknown',
      employee_id: (session.profiles as any)?.employee_id,
      module_number: session.module_number,
      last_activity: session.last_activity,
      is_active: session.is_active
    }));

    setActiveSessions(sessions);
  };

  const loadRecentActivity = async () => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        id,
        user_id,
        action_type,
        module_number,
        timestamp,
        profiles!activity_logs_user_id_fkey(full_name)
      `)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading recent activity:', error);
      return;
    }

    const activities = data.map(log => ({
      id: log.id,
      user_id: log.user_id,
      action_type: log.action_type,
      module_number: log.module_number,
      timestamp: log.timestamp,
      full_name: (log.profiles as any)?.full_name || 'Unknown'
    }));

    setRecentActivity(activities);
  };

  const getModuleName = (moduleNumber: number | null) => {
    if (!moduleNumber) return 'N/A';
    const modules = {
      1: 'Unit Inspection',
      2: 'Generator Checks',
      3: 'De-Watering Sump',
      4: 'OD Yard & Control'
    };
    return modules[moduleNumber as keyof typeof modules] || `Module ${moduleNumber}`;
  };

  const getActionBadge = (actionType: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      field_edit: 'default',
      module_complete: 'secondary',
      photo_upload: 'outline',
      checklist_submit: 'secondary'
    };
    return variants[actionType] || 'default';
  };

  if (loading) {
    return <div className="text-center py-8">Loading activity data...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Users ({activeSessions.length})
          </CardTitle>
          <CardDescription>Users currently working on checklists</CardDescription>
        </CardHeader>
        <CardContent>
          {activeSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No active users</p>
          ) : (
            <ScrollArea className="w-full">
              <div className="min-w-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSessions.map((session) => (
                      <TableRow key={session.user_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                              <AvatarFallback className="text-xs">
                                {session.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium text-xs sm:text-sm truncate">{session.full_name}</div>
                              {session.employee_id && (
                                <div className="text-xs text-muted-foreground truncate">{session.employee_id}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{getModuleName(session.module_number)}</Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(session.last_activity), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest actions from all users</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {activity.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{activity.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {activity.action_type.replace('_', ' ')}
                        {activity.module_number && ` - ${getModuleName(activity.module_number)}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getActionBadge(activity.action_type)}>
                      {activity.action_type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
