import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const AIDailySummary = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRangePreset, setDateRangePreset] = useState<string>('7');
  const [analyzedPeriod, setAnalyzedPeriod] = useState<string>('');
  const { toast } = useToast();

  const generateSummary = async () => {
    setLoading(true);
    try {
      let requestBody: { date?: string; startDate?: string; endDate?: string } = {};
      let periodText = '';
      
      if (dateMode === 'single') {
        requestBody.date = format(selectedDate, 'yyyy-MM-dd');
        periodText = format(selectedDate, 'MMM dd, yyyy');
      } else {
        const days = parseInt(dateRangePreset);
        const endDate = new Date();
        const startDate = subDays(endDate, days - 1);
        requestBody.startDate = format(startDate, 'yyyy-MM-dd');
        requestBody.endDate = format(endDate, 'yyyy-MM-dd');
        periodText = `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
      }

      const { data, error } = await supabase.functions.invoke('generate-daily-summary', {
        body: requestBody
      });

      if (error) throw error;
      if (data.error) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
        return;
      }

      setSummary(data.summary);
      setMetrics(data.metrics);
      setAnalyzedPeriod(periodText);
      toast({ title: 'Summary Generated', description: `Analysis complete for ${periodText}` });
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
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">AI Daily Summary</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Select value={dateMode} onValueChange={(value: 'single' | 'range') => setDateMode(value)}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single Date</SelectItem>
            <SelectItem value="range">Date Range</SelectItem>
          </SelectContent>
        </Select>

        {dateMode === 'single' ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full sm:w-[200px] justify-start", !selectedDate && "text-muted-foreground")}>
                <Calendar className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} disabled={(date) => date > new Date()} initialFocus />
            </PopoverContent>
          </Popover>
        ) : (
          <Select value={dateRangePreset} onValueChange={setDateRangePreset}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Button onClick={generateSummary} disabled={loading} className="gap-2 w-full sm:w-auto">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Analyzing...' : 'Generate'}
        </Button>
      </div>

      {analyzedPeriod && <p className="text-sm text-muted-foreground mb-4">Period: {analyzedPeriod}</p>}

      {summary && (
        <div className="space-y-4">
          {metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 sm:p-4 bg-muted rounded-lg">
              <div className="min-w-0"><p className="text-xs text-muted-foreground truncate">Checklists</p><p className="text-base sm:text-lg font-bold truncate">{metrics.checklists.completed}/{metrics.checklists.total}</p></div>
              <div className="min-w-0"><p className="text-xs text-muted-foreground truncate">Transformer Hours</p><p className="text-base sm:text-lg font-bold truncate">{metrics.transformer.hoursLogged}</p></div>
              <div className="min-w-0"><p className="text-xs text-muted-foreground truncate">Generator Hours</p><p className="text-base sm:text-lg font-bold truncate">{metrics.generator.hoursLogged}</p></div>
              <div className="min-w-0"><p className="text-xs text-muted-foreground truncate">Open Issues</p><p className="text-base sm:text-lg font-bold text-destructive truncate">{metrics.issues.open}</p></div>
            </div>
          )}
          <div className="prose prose-sm max-w-none dark:prose-invert"><div className="whitespace-pre-wrap text-sm">{summary}</div></div>
        </div>
      )}

      {!summary && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Select a date/range and generate AI insights</p>
        </div>
      )}
    </Card>
  );
};
