import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Activity } from 'lucide-react';

export const AdminAuditDashboard = () => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ todayActions: 0, totalActions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
    const channel = supabase
      .channel('audit-logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_audit_log' }, fetchAuditLogs)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAuditLogs = async () => {
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select(`*, profiles:admin_id(full_name, email)`)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (!error && data) {
      setAuditLogs(data);
      const today = new Date().toISOString().split('T')[0];
      setStats({
        todayActions: data.filter(l => l.timestamp?.startsWith(today)).length,
        totalActions: data.length
      });
    }
    setLoading(false);
  };

  const getActionBadge = (action: string) => {
    if (action.includes('create')) return <Badge className="bg-green-500">Create</Badge>;
    if (action.includes('update')) return <Badge className="bg-yellow-500">Update</Badge>;
    if (action.includes('delete')) return <Badge variant="destructive">Delete</Badge>;
    if (action.includes('query') || action.includes('analytics')) return <Badge variant="secondary">AI</Badge>;
    return <Badge variant="outline">{action}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayActions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logged</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActions}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Admin Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                ) : auditLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center">No audit logs yet</TableCell></TableRow>
                ) : (
                  auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</TableCell>
                      <TableCell className="font-medium">{log.profiles?.full_name || 'Unknown'}</TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{JSON.stringify(log.details)}</TableCell>
                      <TableCell className="text-xs">{log.ip_address || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};