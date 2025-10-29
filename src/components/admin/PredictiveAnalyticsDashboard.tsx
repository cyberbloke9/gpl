import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export const PredictiveAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [structured, setStructured] = useState<any>(null);
  const [dateRange, setDateRange] = useState<string>('30');
  const { toast } = useToast();

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const days = parseInt(dateRange);
      const { data, error } = await supabase.functions.invoke('predictive-analytics', { body: { days } });
      if (error) throw error;
      if (data.error) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
        return;
      }
      setAnalysis(data.analysis);
      setStructured(data.structured);
      toast({ title: 'Analytics Updated', description: `Analysis for ${days} days complete` });
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({ title: 'Error', description: 'Failed to load analytics', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAnalytics(); }, []);

  const getScoreColor = (score: number) => score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const getScoreBadge = (score: number) => score >= 80 ? <Badge className="bg-green-50 text-green-700">Excellent</Badge> : score >= 60 ? <Badge className="bg-yellow-50 text-yellow-700">Warning</Badge> : <Badge className="bg-red-50 text-red-700">Critical</Badge>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold">Predictive Analytics</h2>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalytics} disabled={loading} variant="outline" className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      {loading && !analysis && (
        <Card className="p-8"><div className="text-center"><Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" /><p className="text-muted-foreground">Analyzing data...</p></div></Card>
      )}

      {analysis && structured && (
        <Tabs defaultValue="health" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="optimize">Optimize</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-4">
            {structured.healthScores && Array.isArray(structured.healthScores) && structured.healthScores.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {structured.healthScores.map((item: any, idx: number) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{item.equipment}</h4>
                      {getScoreBadge(item.score)}
                    </div>
                    <div className="text-3xl font-bold mb-2"><span className={getScoreColor(item.score)}>{item.score}</span><span className="text-sm text-muted-foreground">/100</span></div>
                    <Progress value={item.score} className="mb-2" />
                    <p className="text-sm text-muted-foreground">{item.explanation}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6">
                <p className="text-sm text-muted-foreground text-center">No health score data available. The AI may need more data to generate health scores.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {structured.maintenanceAlerts && Array.isArray(structured.maintenanceAlerts) && structured.maintenanceAlerts.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-600" />Maintenance Alerts</h3>
                <div className="space-y-3">
                  {structured.maintenanceAlerts.map((alert: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{alert.equipment}</p>
                        <p className="text-sm text-muted-foreground">{alert.issue}</p>
                        {alert.timeframe && <p className="text-xs text-yellow-700 mt-1">Timeframe: {alert.timeframe}</p>}
                      </div>
                      <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>{alert.priority}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {structured.complianceWarnings && Array.isArray(structured.complianceWarnings) && structured.complianceWarnings.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-600" />Compliance Warnings</h3>
                <div className="space-y-3">
                  {structured.complianceWarnings.map((w: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg bg-red-50 dark:bg-red-950/20"><p className="font-semibold text-sm">{w.parameter}</p><p className="text-sm text-muted-foreground">{w.warning}</p></div>
                  ))}
                </div>
              </Card>
            )}
            {(!structured.maintenanceAlerts || !Array.isArray(structured.maintenanceAlerts) || structured.maintenanceAlerts.length === 0) && 
             (!structured.complianceWarnings || !Array.isArray(structured.complianceWarnings) || structured.complianceWarnings.length === 0) && (
              <Card className="p-6">
                <p className="text-sm text-muted-foreground text-center">No alerts or warnings at this time.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="optimize" className="space-y-4">
            {structured.optimizationSuggestions && Array.isArray(structured.optimizationSuggestions) && structured.optimizationSuggestions.length > 0 ? (
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-600" />Optimization</h3>
                <div className="space-y-3">
                  {structured.optimizationSuggestions.map((s: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20"><p className="font-semibold text-sm">{s.area}</p><p className="text-sm text-muted-foreground">{s.suggestion}</p></div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <p className="text-sm text-muted-foreground text-center">No optimization suggestions available at this time.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
