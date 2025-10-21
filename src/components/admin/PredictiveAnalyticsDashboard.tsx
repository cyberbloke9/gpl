import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HealthScore {
  equipment: string;
  score: number;
  status: 'good' | 'warning' | 'critical';
  explanation: string;
}

export const PredictiveAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [structured, setStructured] = useState<any>(null);
  const { toast } = useToast();

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('predictive-analytics');

      if (error) throw error;

      if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      setAnalysis(data.analysis);
      setStructured(data.structured);
      
      toast({
        title: 'Analytics Updated',
        description: 'Predictive insights generated',
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Excellent</Badge>;
    if (score >= 60) return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Warning</Badge>;
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Critical</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Predictive Analytics</h2>
        </div>
        <Button 
          onClick={loadAnalytics} 
          disabled={loading}
          variant="outline"
          className="gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {loading && !analysis && (
        <Card className="p-8">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Analyzing 30 days of operational data...</p>
          </div>
        </Card>
      )}

      {analysis && (
        <>
          {/* Equipment Health Scores */}
          {structured?.healthScores && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Equipment Health Scores
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {structured.healthScores.map((item: any, idx: number) => (
                  <Card key={idx} className="p-4 border-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{item.equipment}</h4>
                      {getScoreBadge(item.score)}
                    </div>
                    <div className="text-3xl font-bold mb-2 flex items-center gap-2">
                      <span className={getScoreColor(item.score)}>{item.score}</span>
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.explanation}</p>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* Maintenance Alerts */}
          {structured?.maintenanceAlerts && structured.maintenanceAlerts.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Predictive Maintenance Alerts
              </h3>
              <div className="space-y-3">
                {structured.maintenanceAlerts.map((alert: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{alert.equipment}</p>
                      <p className="text-sm text-muted-foreground">{alert.issue}</p>
                      {alert.timeframe && (
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          Estimated: {alert.timeframe}
                        </p>
                      )}
                    </div>
                    <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                      {alert.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Compliance Warnings */}
          {structured?.complianceWarnings && structured.complianceWarnings.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Compliance Monitoring
              </h3>
              <div className="space-y-3">
                {structured.complianceWarnings.map((warning: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg bg-red-50 dark:bg-red-950/20">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{warning.parameter}</p>
                      <p className="text-sm text-muted-foreground">{warning.warning}</p>
                      {warning.currentValue && (
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                          Current: {warning.currentValue} | Threshold: {warning.threshold}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Optimization Suggestions */}
          {structured?.optimizationSuggestions && structured.optimizationSuggestions.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Efficiency Optimization
              </h3>
              <div className="space-y-3">
                {structured.optimizationSuggestions.map((suggestion: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{suggestion.area}</p>
                      <p className="text-sm text-muted-foreground">{suggestion.suggestion}</p>
                      {suggestion.potentialBenefit && (
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          Potential Benefit: {suggestion.potentialBenefit}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Raw AI Analysis (fallback if no structured data) */}
          {!structured && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {analysis}
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};