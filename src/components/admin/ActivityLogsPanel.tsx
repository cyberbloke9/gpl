import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatIST } from '@/lib/timezone-utils';
import { Clock, CheckCircle, AlertCircle, FileText, Zap } from 'lucide-react';

interface Activity {
  id: string;
  type: 'checklist' | 'transformer' | 'generator' | 'issue';
  user_name: string;
  employee_id: string;
  action: string;
  timestamp: string;
}

export const ActivityLogsPanel = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
    
    // Set up real-time subscriptions
    const checklistChannel = supabase
      .channel('checklist-activity')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklists' }, () => {
        loadActivities();
      })
      .subscribe();

    const transformerChannel = supabase
      .channel('transformer-activity')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transformer_logs' }, () => {
        loadActivities();
      })
      .subscribe();

    const generatorChannel = supabase
      .channel('generator-activity')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'generator_logs' }, () => {
        loadActivities();
      })
      .subscribe();

    const issueChannel = supabase
      .channel('issue-activity')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flagged_issues' }, () => {
        loadActivities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(checklistChannel);
      supabase.removeChannel(transformerChannel);
      supabase.removeChannel(generatorChannel);
      supabase.removeChannel(issueChannel);
    };
  }, []);

  const loadActivities = async () => {
    try {
      const activities: Activity[] = [];

      // Get recent checklists
      const { data: checklists } = await supabase
        .from('checklists')
        .select(`
          id,
          created_at,
          submitted_at,
          submitted,
          profiles!checklists_user_id_fkey(full_name, employee_id)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      checklists?.forEach(item => {
        activities.push({
          id: item.id,
          type: 'checklist',
          user_name: item.profiles?.full_name || 'Unknown',
          employee_id: item.profiles?.employee_id || 'N/A',
          action: item.submitted ? 'Submitted checklist' : 'Started checklist',
          timestamp: item.submitted_at || item.created_at,
        });
      });

      // Get recent transformer logs
      const { data: transformer } = await supabase
        .from('transformer_logs')
        .select(`
          id,
          created_at,
          finalized,
          profiles!transformer_logs_user_id_fkey(full_name, employee_id)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      transformer?.forEach(item => {
        activities.push({
          id: item.id,
          type: 'transformer',
          user_name: item.profiles?.full_name || 'Unknown',
          employee_id: item.profiles?.employee_id || 'N/A',
          action: item.finalized ? 'Finalized transformer log' : 'Created transformer log',
          timestamp: item.created_at,
        });
      });

      // Get recent generator logs
      const { data: generator } = await supabase
        .from('generator_logs')
        .select('id, created_at, finalized, user_id')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch profiles for generator logs
      if (generator && generator.length > 0) {
        const genUserIds = [...new Set(generator.map(g => g.user_id))];
        const { data: genProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, employee_id')
          .in('id', genUserIds);
        
        const genProfileMap = new Map(genProfiles?.map(p => [p.id, p]) || []);
        
        generator.forEach(item => {
          const profile = genProfileMap.get(item.user_id);
          activities.push({
            id: item.id,
            type: 'generator',
            user_name: profile?.full_name || 'Unknown',
            employee_id: profile?.employee_id || 'N/A',
            action: item.finalized ? 'Finalized generator log' : 'Created generator log',
            timestamp: item.created_at,
          });
        });
      }

      // Get recent issues
      const { data: issues } = await supabase
        .from('flagged_issues')
        .select(`
          id,
          reported_at,
          status,
          profiles!flagged_issues_user_id_fkey(full_name, employee_id)
        `)
        .order('reported_at', { ascending: false })
        .limit(10);

      issues?.forEach(item => {
        activities.push({
          id: item.id,
          type: 'issue',
          user_name: item.profiles?.full_name || 'Unknown',
          employee_id: item.profiles?.employee_id || 'N/A',
          action: `Flagged issue (${item.status})`,
          timestamp: item.reported_at,
        });
      });

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setActivities(activities.slice(0, 50)); // Keep last 50 activities
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'checklist':
        return <CheckCircle className="h-4 w-4" />;
      case 'transformer':
        return <FileText className="h-4 w-4" />;
      case 'generator':
        return <Zap className="h-4 w-4" />;
      case 'issue':
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'checklist':
        return 'default';
      case 'transformer':
        return 'secondary';
      case 'generator':
        return 'outline';
      case 'issue':
        return 'destructive';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading activity logs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Real-time updates from all users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 sm:gap-4 border-b pb-3 sm:pb-4 last:border-0">
                <div className="mt-1 flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getActivityColor(activity.type)} className="text-xs">
                      {activity.type}
                    </Badge>
                    <span className="text-sm font-medium truncate">{activity.user_name}</span>
                    <span className="text-xs text-muted-foreground">({activity.employee_id})</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(activity.timestamp), 'PPp')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
