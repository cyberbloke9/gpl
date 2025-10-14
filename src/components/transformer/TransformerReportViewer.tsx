import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, CheckCircle2 } from 'lucide-react';
import { TransformerPrintView } from '@/components/reports/TransformerPrintView';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface TransformerLog {
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
  logged_at: string | null;
}

interface TransformerReportViewerProps {
  isOpen: boolean;
  onClose: () => void;
  report: {
    date: string;
    logs: TransformerLog[];
  } | null;
  userName?: string;
  employeeId?: string;
}

export function TransformerReportViewer({ isOpen, onClose, report, userName, employeeId }: TransformerReportViewerProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [flaggedIssues, setFlaggedIssues] = useState<any[]>([]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: report ? `Unified_Transformer_Report_${report.date}` : 'Unified_Transformer_Report',
  });

  useEffect(() => {
    const fetchFlaggedIssues = async () => {
      if (!report || !isOpen) return;
      
      const { data } = await supabase
        .from('flagged_issues')
        .select('*')
        .eq('module', 'transformer');
      
      setFlaggedIssues(data || []);
    };

    fetchFlaggedIssues();
  }, [report, isOpen]);

  if (!report) return null;

  const getIssue = (hour: number, field: string) => {
    return flaggedIssues.find(issue => 
      issue.item?.includes(`Hour ${hour}`) &&
      issue.item?.includes(field)
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 dark:bg-red-950';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-950';
      case 'info': return 'bg-blue-100 dark:bg-blue-950';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              Unified Transformer Report - {format(new Date(report.date), 'PPP')}
            </DialogTitle>
            <Button onClick={handlePrint} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="hidden">
          <TransformerPrintView
            ref={printRef}
            date={report.date}
            logs={report.logs}
            userName={userName}
            employeeId={employeeId}
            flaggedIssues={flaggedIssues}
          />
        </div>

        <div className="space-y-4">
          {flaggedIssues.length > 0 && (
            <div className="flex gap-2 items-center text-sm">
              <span className="font-medium">Severity Legend:</span>
              <Badge variant="destructive" className="text-xs">Critical</Badge>
              <Badge className="bg-yellow-500 text-xs">Warning</Badge>
              <Badge variant="secondary" className="text-xs">Info</Badge>
            </div>
          )}

          <Tabs defaultValue="ptr" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ptr">PTR Feeder</TabsTrigger>
              <TabsTrigger value="ltac">LTAC Feeder</TabsTrigger>
              <TabsTrigger value="generation">Generation</TabsTrigger>
            </TabsList>

            <TabsContent value="ptr" className="space-y-4">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Hour</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Freq</TableHead>
                      <TableHead>V-RY</TableHead>
                      <TableHead>V-YB</TableHead>
                      <TableHead>V-RB</TableHead>
                      <TableHead>I-R</TableHead>
                      <TableHead>I-Y</TableHead>
                      <TableHead>I-B</TableHead>
                      <TableHead>kW</TableHead>
                      <TableHead>kVAR</TableHead>
                      <TableHead>kVA</TableHead>
                      <TableHead>MWH</TableHead>
                      <TableHead>MVARH</TableHead>
                      <TableHead>MVAH</TableHead>
                      <TableHead>Cos φ</TableHead>
                      <TableHead>Oil °C</TableHead>
                      <TableHead>Wind °C</TableHead>
                      <TableHead>Oil Lvl</TableHead>
                      <TableHead>Tap</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 24 }, (_, i) => {
                      const log = report.logs.find(l => l.hour === i);
                      const issue = getIssue(i, 'any');
                      
                      return (
                        <TableRow key={i} className={cn(issue && getSeverityColor(issue.severity))}>
                          <TableCell className="font-medium">{i.toString().padStart(2, '0')}:00</TableCell>
                          <TableCell>
                            {log ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <span className="text-xs text-muted-foreground">Not logged</span>}
                          </TableCell>
                          <TableCell>{log?.frequency?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.voltage_ry?.toFixed(1) || '-'}</TableCell>
                          <TableCell>{log?.voltage_yb?.toFixed(1) || '-'}</TableCell>
                          <TableCell>{log?.voltage_rb?.toFixed(1) || '-'}</TableCell>
                          <TableCell>{log?.current_r?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.current_y?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.current_b?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.active_power?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.reactive_power?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.kva?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.mwh?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.mvarh?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.mvah?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.cos_phi?.toFixed(3) || '-'}</TableCell>
                          <TableCell>{log?.oil_temperature?.toFixed(1) || '-'}</TableCell>
                          <TableCell>{log?.winding_temperature?.toFixed(1) || '-'}</TableCell>
                          <TableCell>{log?.oil_level || '-'}</TableCell>
                          <TableCell>{log?.tap_position || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="ltac" className="space-y-4">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Hour</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>I-R</TableHead>
                      <TableHead>I-Y</TableHead>
                      <TableHead>I-B</TableHead>
                      <TableHead>V-RY</TableHead>
                      <TableHead>V-YB</TableHead>
                      <TableHead>V-RB</TableHead>
                      <TableHead>kW</TableHead>
                      <TableHead>kVA</TableHead>
                      <TableHead>kVAR</TableHead>
                      <TableHead>KWH</TableHead>
                      <TableHead>KVAH</TableHead>
                      <TableHead>KVARH</TableHead>
                      <TableHead>Oil °C</TableHead>
                      <TableHead>Fail Time</TableHead>
                      <TableHead>Resume</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 24 }, (_, i) => {
                      const log = report.logs.find(l => l.hour === i);
                      const issue = getIssue(i, 'any');
                      
                      return (
                        <TableRow key={i} className={cn(issue && getSeverityColor(issue.severity))}>
                          <TableCell className="font-medium">{i.toString().padStart(2, '0')}:00</TableCell>
                          <TableCell>
                            {log ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <span className="text-xs text-muted-foreground">Not logged</span>}
                          </TableCell>
                          <TableCell>{log?.ltac_current_r?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.ltac_current_y?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.ltac_current_b?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.ltac_voltage_ry?.toFixed(1) || '-'}</TableCell>
                          <TableCell>{log?.ltac_voltage_yb?.toFixed(1) || '-'}</TableCell>
                          <TableCell>{log?.ltac_voltage_rb?.toFixed(1) || '-'}</TableCell>
                          <TableCell>{log?.ltac_kw?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.ltac_kva?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.ltac_kvar?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.ltac_kwh?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.ltac_kvah?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.ltac_kvarh?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.ltac_oil_temperature?.toFixed(1) || '-'}</TableCell>
                          <TableCell>{log?.ltac_grid_fail_time || '-'}</TableCell>
                          <TableCell>{log?.ltac_grid_resume_time || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="generation" className="space-y-4">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Hour</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total Gen</TableHead>
                      <TableHead>X'MER Exp</TableHead>
                      <TableHead>AUX Cons</TableHead>
                      <TableHead>Main Exp</TableHead>
                      <TableHead>Check Exp</TableHead>
                      <TableHead>Main Imp</TableHead>
                      <TableHead>Check Imp</TableHead>
                      <TableHead>Stby Exp</TableHead>
                      <TableHead>Stby Imp</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 24 }, (_, i) => {
                      const log = report.logs.find(l => l.hour === i);
                      const issue = getIssue(i, 'any');
                      
                      return (
                        <TableRow key={i} className={cn(issue && getSeverityColor(issue.severity))}>
                          <TableCell className="font-medium">{i.toString().padStart(2, '0')}:00</TableCell>
                          <TableCell>
                            {log ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <span className="text-xs text-muted-foreground">Not logged</span>}
                          </TableCell>
                          <TableCell>{log?.gen_total_generation?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.gen_xmer_export?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.gen_aux_consumption?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.gen_main_export?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.gen_check_export?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.gen_main_import?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.gen_check_import?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.gen_standby_export?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{log?.gen_standby_import?.toFixed(2) || '-'}</TableCell>
                          <TableCell className="max-w-xs truncate">{log?.remarks || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
