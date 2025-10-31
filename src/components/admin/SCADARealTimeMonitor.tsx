import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity } from 'lucide-react';

interface SCADAReading {
  id: string;
  tag_mapping_id: string;
  scaled_value: number;
  quality_code: number;
  timestamp: string;
  is_alarm: boolean;
  alarm_type: string | null;
  scada_tag_mappings: {
    tag_name: string;
    unit: string;
    min_value: number;
    max_value: number;
  } | null;
}

export function SCADARealTimeMonitor() {
  const [readings, setReadings] = useState<SCADAReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReadings();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('scada-readings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scada_readings' as any,
        },
        () => {
          loadReadings();
        }
      )
      .subscribe();

    const interval = setInterval(loadReadings, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const loadReadings = async () => {
    const { data, error } = await supabase
      .from('scada_readings' as any)
      .select(`
        *,
        scada_tag_mappings (
          tag_name,
          unit,
          min_value,
          max_value
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (!error && data) {
      setReadings(data as any);
    }
    setLoading(false);
  };

  const getQualityBadge = (qualityCode: number) => {
    switch (qualityCode) {
      case 0:
        return <Badge className="bg-success text-success-foreground">Good</Badge>;
      case 1:
        return <Badge variant="destructive">Bad</Badge>;
      case 2:
        return <Badge variant="secondary">Uncertain</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            Real-Time SCADA Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading SCADA readings...</p>
        </CardContent>
      </Card>
    );
  }

  if (readings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time SCADA Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No SCADA data available yet. Configure tag mappings and start the gateway server.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg sm:text-2xl">
          <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-pulse" />
          <span className="flex-1 min-w-0">Real-Time SCADA Data</span>
          <Badge variant="outline" className="text-xs">{readings.length} Tags</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <ScrollArea className="h-[400px] sm:h-[600px]">
          <div className="space-y-2">
            {readings.map((reading) => (
              <div
                key={reading.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg border transition-colors gap-3 sm:gap-4 ${
                  reading.is_alarm 
                    ? 'border-destructive bg-destructive/5' 
                    : 'border-border hover:bg-accent/50'
                }`}
              >
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <p className="font-mono text-xs sm:text-sm font-medium truncate">
                    {reading.scada_tag_mappings?.tag_name || 'Unknown Tag'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(reading.timestamp).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      hour12: false,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-bold tabular-nums">
                      {reading.scaled_value.toFixed(2)}
                      <span className="text-xs sm:text-sm font-normal ml-1 text-muted-foreground">
                        {reading.scada_tag_mappings?.unit}
                      </span>
                    </p>
                    {reading.is_alarm && (
                      <Badge variant="destructive" className="mt-1 text-xs">
                        {reading.alarm_type?.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  {getQualityBadge(reading.quality_code)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
