import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileSpreadsheet } from 'lucide-react';
import { getCurrentISTDate, formatIST } from '@/lib/timezone-utils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { exportChecklistsToExcel, exportTransformerLogsToExcel, exportGeneratorLogsToExcel, exportIssuesToExcel } from '@/lib/excelExport';

export const ExportPanel = () => {
  const today = getCurrentISTDate();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(today.getFullYear(), today.getMonth(), 1),
    to: today,
  });
  const [loading, setLoading] = useState<string | null>(null);

  const handleExportChecklists = async () => {
    setLoading('checklists');
    try {
      // Fetch checklists without join to avoid timeout
      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('date', format(dateRange.to, 'yyyy-MM-dd'))
        .order('date', { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [...new Set(data.map(c => c.user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, employee_id')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Fetch flagged issues for these checklists
      const checklistIds = data.map(c => c.id);
      const { data: issues } = await supabase
        .from('flagged_issues')
        .select('*')
        .in('checklist_id', checklistIds);

      const formattedData = data.map(item => ({
        ...item,
        user_name: profileMap.get(item.user_id)?.full_name,
        employee_id: profileMap.get(item.user_id)?.employee_id,
        flagged_issues: issues?.filter(i => i.checklist_id === item.id) || []
      }));

      exportChecklistsToExcel(formattedData, format(dateRange.from, 'yyyy-MM-dd'), format(dateRange.to, 'yyyy-MM-dd'));
      toast.success('Checklists exported successfully');
    } catch (error) {
      console.error('Export failed', { type: 'checklists', timestamp: Date.now() });
      toast.error('Failed to export checklists');
    } finally {
      setLoading(null);
    }
  };

  const handleExportTransformerLogs = async () => {
    setLoading('transformer');
    try {
      const { data, error } = await supabase
        .from('transformer_logs')
        .select(`
          *,
          profiles!transformer_logs_user_id_fkey(full_name, employee_id)
        `)
        .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('date', format(dateRange.to, 'yyyy-MM-dd'))
        .order('date', { ascending: false })
        .order('hour', { ascending: true });

      if (error) throw error;

      const formattedData = data.map(item => ({
        ...item,
        user_name: item.profiles?.full_name,
        employee_id: item.profiles?.employee_id,
      }));

      exportTransformerLogsToExcel(formattedData, format(dateRange.from, 'yyyy-MM-dd'), format(dateRange.to, 'yyyy-MM-dd'));
      toast.success('Transformer logs exported successfully');
    } catch (error) {
      console.error('Export failed', { type: 'transformer', timestamp: Date.now() });
      toast.error('Failed to export transformer logs');
    } finally {
      setLoading(null);
    }
  };

  const handleExportGeneratorLogs = async () => {
    setLoading('generator');
    try {
      const { data, error } = await supabase
        .from('generator_logs')
        .select('*')
        .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('date', format(dateRange.to, 'yyyy-MM-dd'))
        .order('date', { ascending: false })
        .order('hour', { ascending: true });

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [...new Set(data.map(log => log.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, employee_id')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const formattedData = data.map(item => ({
        ...item,
        user_name: profileMap.get(item.user_id)?.full_name,
        employee_id: profileMap.get(item.user_id)?.employee_id,
      }));

      exportGeneratorLogsToExcel(formattedData, format(dateRange.from, 'yyyy-MM-dd'), format(dateRange.to, 'yyyy-MM-dd'));
      toast.success('Generator logs exported successfully');
    } catch (error) {
      console.error('Export failed', { type: 'generator', timestamp: Date.now() });
      toast.error('Failed to export generator logs');
    } finally {
      setLoading(null);
    }
  };

  const handleExportIssues = async () => {
    setLoading('issues');
    try {
      const { data, error } = await supabase
        .from('flagged_issues')
        .select(`
          *,
          profiles!flagged_issues_user_id_fkey(full_name, employee_id)
        `)
        .gte('reported_at', dateRange.from.toISOString())
        .lte('reported_at', dateRange.to.toISOString())
        .order('reported_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(item => ({
        ...item,
        user_name: item.profiles?.full_name,
        employee_id: item.profiles?.employee_id,
      }));

      exportIssuesToExcel(formattedData, format(dateRange.from, 'yyyy-MM-dd'), format(dateRange.to, 'yyyy-MM-dd'));
      toast.success('Issues exported successfully');
    } catch (error) {
      console.error('Export failed', { type: 'issues', timestamp: Date.now() });
      toast.error('Failed to export issues');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Date Range Selection</CardTitle>
          <CardDescription>Select the date range for export</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Checklists
            </CardTitle>
            <CardDescription>Export all checklists data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleExportChecklists} 
              disabled={loading === 'checklists'}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {loading === 'checklists' ? 'Exporting...' : 'Export Checklists'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Transformer Logs
            </CardTitle>
            <CardDescription>Export PT & AT transformer logs</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleExportTransformerLogs} 
              disabled={loading === 'transformer'}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {loading === 'transformer' ? 'Exporting...' : 'Export Transformer Logs'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Generator Logs
            </CardTitle>
            <CardDescription>Export generator hourly data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleExportGeneratorLogs} 
              disabled={loading === 'generator'}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {loading === 'generator' ? 'Exporting...' : 'Export Generator Logs'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Flagged Issues
            </CardTitle>
            <CardDescription>Export all flagged issues</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleExportIssues} 
              disabled={loading === 'issues'}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {loading === 'issues' ? 'Exporting...' : 'Export Issues'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
