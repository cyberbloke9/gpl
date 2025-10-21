import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AIDailySummary = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const { toast } = useToast();

  const generateSummary = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-daily-summary');

      if (error) throw error;

      if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      setSummary(data.summary);
      setMetrics(data.metrics);
      
      toast({
        title: 'Summary Generated',
        description: 'AI analysis complete',
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate summary',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">AI Daily Summary</h2>
        </div>
        <Button 
          onClick={generateSummary} 
          disabled={loading}
          className="gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Analyzing...' : 'Generate Summary'}
        </Button>
      </div>

      {summary && (
        <div className="space-y-4">
          {metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Checklists</p>
                <p className="text-lg font-bold">{metrics.checklists.completed}/{metrics.checklists.total}</p>
                <p className="text-xs text-muted-foreground">{metrics.checklists.completionRate}% complete</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Transformer Hours</p>
                <p className="text-lg font-bold">{metrics.transformer.hoursLogged}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Generator Hours</p>
                <p className="text-lg font-bold">{metrics.generator.hoursLogged}/24</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Open Issues</p>
                <p className="text-lg font-bold text-destructive">{metrics.issues.open}</p>
                <p className="text-xs text-muted-foreground">{metrics.issues.critical} critical</p>
              </div>
            </div>
          )}

          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {summary}
            </div>
          </div>
        </div>
      )}

      {!summary && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Click "Generate Summary" to get AI-powered insights</p>
          <p className="text-xs mt-2">Analyzes completion rates, anomalies, and actionable items</p>
        </div>
      )}
    </Card>
  );
};