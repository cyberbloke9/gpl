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
  frequency: number | null;
  voltage_ry: number | null;
  voltage_yb: number | null;
  voltage_rb: number | null;
  current_r: number | null;
  current_y: number | null;
  current_b: number | null;
  active_power: number | null;
  reactive_power: number | null;
  kva: number | null;
  mwh: number | null;
  mvarh: number | null;
  mvah: number | null;
  cos_phi: number | null;
  oil_temperature: number | null;
  winding_temperature: number | null;
  oil_level: string | null;
  tap_position: string | null;
  tap_counter: number | null;
  silica_gel_colour: string | null;
  ltac_current_r: number | null;
  ltac_current_y: number | null;
  ltac_current_b: number | null;
  ltac_voltage_ry: number | null;
  ltac_voltage_yb: number | null;
  ltac_voltage_rb: number | null;
  ltac_kw: number | null;
  ltac_kva: number | null;
  ltac_kvar: number | null;
  ltac_kwh: number | null;
  ltac_kvah: number | null;
  ltac_kvarh: number | null;
  ltac_oil_temperature: number | null;
  ltac_grid_fail_time: string | null;
  ltac_grid_resume_time: string | null;
  ltac_supply_interruption: string | null;
  gen_total_generation: number | null;
  gen_xmer_export: number | null;
  gen_aux_consumption: number | null;
  gen_main_export: number | null;
  gen_check_export: number | null;
  gen_main_import: number | null;
  gen_check_import: number | null;
  gen_standby_export: number | null;
  gen_standby_import: number | null;
  remarks: string | null;
  logged_at: string;
}

interface GroupedLogs {
  [key: string]: TransformerLog[];
}

interface SelectedReport {
  date: string;
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
      .eq('transformer_number', 1)
      .order('date', { ascending: false })
      .order('hour', { ascending: true })
      .limit(500);

    if (!error && data) {
      const grouped: GroupedLogs = {};
      data.forEach((log: TransformerLog) => {
        if (!grouped[log.date]) {
          grouped[log.date] = [];
        }
        grouped[log.date].push(log);
      });
      setGroupedLogs(grouped);
    }
  };

  const handleViewReport = async (date: string) => {
    const logs = groupedLogs[date];
    
    // Fetch user profile data for PDF
    if (logs.length > 0 && userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, employee_id')
        .eq('id', userId)
        .single();

      setSelectedReport({ 
        date, 
        logs,
        userName: profile?.full_name,
        employeeId: profile?.employee_id
      });
    } else {
      setSelectedReport({ date, logs });
    }
    
    setIsViewerOpen(true);
  };

  const getProgressBadge = (logsCount: number, date: string) => {
    const percentage = Math.round((logsCount / 24) * 100);
    
    // Check if date has passed
    const logDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    logDate.setHours(0, 0, 0, 0);
    
    if (logDate < today && percentage < 100) {
      return <Badge className="bg-red-600 text-white font-bold"><AlertCircle className="h-3 w-3 mr-1" /> Missed</Badge>;
    }
    
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
        <h2 className="text-xl font-semibold mb-4">Unified Transformer Log History</h2>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {Object.entries(groupedLogs).map(([date, logs]) => (
            <AccordionItem key={date} value={date} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4 text-left w-full">
                  <div className="flex-1">
                    <div className="font-semibold">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{logs.length}/24 hours</Badge>
                    {getProgressBadge(logs.length, date)}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Unified Transformer Report</h3>
                    {getProgressBadge(logs.length, date)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {logs.length} out of 24 hours logged • Includes PTR Feeder, LTAC Feeder & Generation Data
                  </p>
                  <Button
                    onClick={() => handleViewReport(date)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    View Report
                  </Button>
                </div>
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