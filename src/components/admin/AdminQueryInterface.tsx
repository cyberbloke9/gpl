import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QueryResult {
  query: string;
  answer: string;
  timestamp: string;
}

export const AdminQueryInterface = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QueryResult[]>([]);
  const { toast } = useToast();

  const suggestedQueries = [
    "What's our average generator power output this week?",
    "Show me critical issues from the last 7 days",
    "What's the checklist completion trend?",
    "Are there any anomalies in transformer temperatures?",
  ];

  const handleQuery = async (queryText?: string) => {
    const q = queryText || query;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-query', {
        body: { query: q }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      setResults([
        {
          query: data.query,
          answer: data.answer,
          timestamp: new Date().toISOString(),
        },
        ...results,
      ]);
      
      setQuery('');
      
      toast({
        title: 'Query Complete',
        description: 'AI analysis ready',
      });
    } catch (error) {
      console.error('Error processing query:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process query',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-primary flex-shrink-0" />
        <h2 className="text-lg sm:text-xl font-semibold break-words">Natural Language Analytics</h2>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Ask anything about your operations data..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
            disabled={loading}
            className="flex-1"
          />
          <Button 
            onClick={() => handleQuery()} 
            disabled={loading || !query.trim()}
            className="gap-2 w-full sm:w-auto"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Query
          </Button>
        </div>

        {results.length === 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-3">Try these questions:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedQueries.map((sq, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuery(sq)}
                  disabled={loading}
                  className="justify-start text-left h-auto py-2 px-3 whitespace-normal break-words"
                >
                  <Sparkles className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="text-xs break-words">{sq}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto">
          {results.map((result, idx) => (
            <div key={idx} className="border rounded-lg p-3 sm:p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Search className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm break-words">{result.query}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(result.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="sm:pl-6 prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                  {result.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};