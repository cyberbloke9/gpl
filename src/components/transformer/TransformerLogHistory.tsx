import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { TransformerReportViewer } from './TransformerReportViewer';

interface TransformerLog {
  id: string;
  date: string;
  transformer_number: number;
  hour: number;
  frequency: number;
  voltage_r: number;
  voltage_y: number;
  voltage_b: number;
  current_r: number;
  current_y: number;
  current_b: number;
  active_power: number;
  reactive_power: number;
  winding_temperature: number;
  oil_temperature: number;
  remarks: string;
  logged_at: string;
}

interface GroupedLogs {
  [key: string]: {
    transformer1: TransformerLog[];
    transformer2: TransformerLog[];
  };
}

interface SelectedReport {
  date: string;
  transformerNumber: number;
  logs: TransformerLog[];
  userName?: string;
  employeeId?: string;
}

export const TransformerLogHistory = ({ userId }: { userId?: string }) => {
  const [groupedLogs, setGroupedLogs] = useState<GroupedLogs>({});
  const [selectedReport, setSelectedReport] = useState<SelectedReport | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      loadHistory();
    }
  }, [userId]);

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from('transformer_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('hour', { ascending: true })
      .limit(500);

    if (!error && data) {
      const grouped: GroupedLogs = {};
      data.forEach((log: TransformerLog) => {
        if (!grouped[log.date]) {
          grouped[log.date] = { transformer1: [], transformer2: [] };
        }
        if (log.transformer_number === 1) {
          grouped[log.date].transformer1.push(log);
        } else {
          grouped[log.date].transformer2.push(log);
        }
      });
      setGroupedLogs(grouped);
    }
  };

  const handleViewReport = async (date: string, transformerNumber: number) => {
    const logs = transformerNumber === 1 
      ? groupedLogs[date].transformer1 
      : groupedLogs[date].transformer2;
    
    // Fetch user profile data for PDF
    if (logs.length > 0 && userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, employee_id')
        .eq('id', userId)
        .single();

      setSelectedReport({ 
        date, 
        transformerNumber, 
        logs,
        userName: profile?.full_name,
        employeeId: profile?.employee_id
      });
    } else {
      setSelectedReport({ date, transformerNumber, logs });
    }
    
    setIsViewerOpen(true);
  };

  const getProgressBadge = (logsCount: number) => {
    const percentage = Math.round((logsCount / 24) * 100);
    if (percentage === 100) {
      return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Complete</Badge>;
    } else if (percentage >= 50) {
      return <Badge variant="default" className="bg-yellow-600"><Clock className="h-3 w-3 mr-1" /> {percentage}%</Badge>;
    } else {
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> {percentage}%</Badge>;
    }
  };

  if (Object.keys(groupedLogs).length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No transformer log history yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Transformer Log History</h2>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {Object.entries(groupedLogs).map(([date, logs]) => (
            <AccordionItem key={date} value={date} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4 text-left w-full">
                  <div className="flex-1">
                    <div className="font-semibold">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</div>
                  </div>
                  <div className="flex gap-2">
                    {logs.transformer1.length > 0 && (
                      <Badge variant="outline">T1: {logs.transformer1.length}/24</Badge>
                    )}
                    {logs.transformer2.length > 0 && (
                      <Badge variant="outline">T2: {logs.transformer2.length}/24</Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                {logs.transformer1.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Transformer 1</h3>
                      {getProgressBadge(logs.transformer1.length)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {logs.transformer1.length} out of 24 hours logged
                    </p>
                    <Button
                      onClick={() => handleViewReport(date, 1)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      View Report
                    </Button>
                  </div>
                )}
                {logs.transformer2.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Transformer 2</h3>
                      {getProgressBadge(logs.transformer2.length)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {logs.transformer2.length} out of 24 hours logged
                    </p>
                    <Button
                      onClick={() => handleViewReport(date, 2)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      View Report
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <TransformerReportViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        report={selectedReport}
        userName={selectedReport?.userName}
        employeeId={selectedReport?.employeeId}
      />
    </>
  );
};