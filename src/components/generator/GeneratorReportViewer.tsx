import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneratorPrintView } from '@/components/reports/GeneratorPrintView';
import { GeneratorLog } from '@/types/generator';
import { Download, CheckCircle2, ArrowLeftRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface GeneratorReportViewerProps {
  isOpen: boolean;
  onClose: () => void;
  report: {
    date: string;
    logs: GeneratorLog[];
  } | null;
  userName?: string;
  employeeId?: string;
}

export function GeneratorReportViewer({
  isOpen,
  onClose,
  report,
  userName,
  employeeId,
}: GeneratorReportViewerProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [flaggedIssues, setFlaggedIssues] = useState<any[]>([]);

  const displayValue = (value: number | null | undefined): string => {
    return value !== null && value !== undefined ? value.toString() : '0';
  };

  const displayText = (value: string | null | undefined): string => {
    return value || '-';
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: report ? `Generator_Log_${report.date}` : 'Generator_Log',
  });

  useEffect(() => {
    const fetchFlaggedIssues = async () => {
      if (!report || !isOpen) return;

      const { data } = await supabase
        .from('flagged_issues')
        .select('*')
        .eq('module', 'generator');

      setFlaggedIssues(data || []);
    };

    fetchFlaggedIssues();
  }, [report, isOpen]);

  if (!report) return null;

  const getIssue = (hour: number, field: string) => {
    return flaggedIssues.find(
      (issue) => issue.item?.includes(`Hour ${hour}`) && issue.item?.includes(field)
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-950';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-950';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-950';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg">
              Generator Log Report - {format(new Date(report.date), 'PPP')}
            </DialogTitle>
            <Button onClick={handlePrint} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
          {(userName || employeeId) && (
            <div className="text-sm text-muted-foreground mt-2">
              {userName && <span>Logged by: {userName}</span>}
              {employeeId && <span className="ml-4">ID: {employeeId}</span>}
            </div>
          )}
        </DialogHeader>

        <div className="hidden">
          <div ref={printRef}>
            {report.logs.length > 0 && report.logs[0].date && (
              <GeneratorPrintView log={report.logs[0]} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          {flaggedIssues.length > 0 && (
            <div className="flex gap-2 items-center text-sm flex-wrap">
              <span className="font-medium">Severity Legend:</span>
              <Badge variant="destructive" className="text-xs">Critical</Badge>
              <Badge className="bg-yellow-500 text-xs">Warning</Badge>
              <Badge variant="secondary" className="text-xs">Info</Badge>
            </div>
          )}

          <div className="block sm:hidden bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-2 text-xs flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-800 dark:text-blue-200">Swipe left/right to view all columns</span>
          </div>

          <Tabs defaultValue="electrical" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="electrical" className="text-xs sm:text-sm">Electrical</TabsTrigger>
              <TabsTrigger value="temperatures" className="text-xs sm:text-sm">Temperatures</TabsTrigger>
              <TabsTrigger value="mechanical" className="text-xs sm:text-sm">Mechanical</TabsTrigger>
              <TabsTrigger value="remarks" className="text-xs sm:text-sm">Remarks</TabsTrigger>
            </TabsList>

            {/* ELECTRICAL PARAMETERS */}
            <TabsContent value="electrical" className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Electrical measurements • Scroll horizontally to see all data
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-[500px] border rounded-lg">
                <Table className="min-w-max">
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-16 sticky left-0 bg-background z-20 border-r">Hour</TableHead>
                      <TableHead className="w-16 sticky left-16 bg-background z-20 border-r">Status</TableHead>
                      <TableHead className="min-w-[60px]">I-R</TableHead>
                      <TableHead className="min-w-[60px]">I-Y</TableHead>
                      <TableHead className="min-w-[60px]">I-B</TableHead>
                      <TableHead className="min-w-[70px]">V-RY</TableHead>
                      <TableHead className="min-w-[70px]">V-YB</TableHead>
                      <TableHead className="min-w-[70px]">V-BR</TableHead>
                      <TableHead className="min-w-[70px]">kW</TableHead>
                      <TableHead className="min-w-[70px]">kVAR</TableHead>
                      <TableHead className="min-w-[70px]">kVA</TableHead>
                      <TableHead className="min-w-[60px]">Freq</TableHead>
                      <TableHead className="min-w-[60px]">PF</TableHead>
                      <TableHead className="min-w-[60px]">RPM</TableHead>
                      <TableHead className="min-w-[70px]">MWH</TableHead>
                      <TableHead className="min-w-[70px]">MVARH</TableHead>
                      <TableHead className="min-w-[70px]">MVAH</TableHead>
                      <TableHead className="min-w-[80px]">AVR I</TableHead>
                      <TableHead className="min-w-[80px]">AVR V</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 24 }, (_, i) => {
                      const log = report.logs.find((l) => l.hour === i);
                      const issue = getIssue(i, 'any');

                      return (
                        <TableRow key={i} className={cn(issue && getSeverityColor(issue.severity))}>
                          <TableCell className="font-medium sticky left-0 bg-background border-r">
                            {i.toString().padStart(2, '0')}:00
                          </TableCell>
                          <TableCell className="sticky left-16 bg-background border-r">
                            {log ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <span className="text-xs text-muted-foreground">Not logged</span>
                            )}
                          </TableCell>
                          <TableCell>{log?.gen_current_r ? log.gen_current_r.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.gen_current_y ? log.gen_current_y.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.gen_current_b ? log.gen_current_b.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.gen_voltage_ry ? log.gen_voltage_ry.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.gen_voltage_yb ? log.gen_voltage_yb.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.gen_voltage_br ? log.gen_voltage_br.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.gen_kw ? log.gen_kw.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.gen_kvar ? log.gen_kvar.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.gen_kva ? log.gen_kva.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.gen_frequency ? log.gen_frequency.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.gen_power_factor ? log.gen_power_factor.toFixed(3) : '0'}</TableCell>
                          <TableCell>{log?.gen_rpm ? log.gen_rpm.toFixed(0) : '0'}</TableCell>
                          <TableCell>{log?.gen_mwh ? log.gen_mwh.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.gen_mvarh ? log.gen_mvarh.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.gen_mvah ? log.gen_mvah.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.avr_field_current ? log.avr_field_current.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.avr_field_voltage ? log.avr_field_voltage.toFixed(2) : '0'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* TEMPERATURES */}
            <TabsContent value="temperatures" className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Winding & Bearing temperatures • Scroll horizontally to see all data
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-[500px] border rounded-lg">
                <Table className="min-w-max">
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-16 sticky left-0 bg-background z-20 border-r">Hour</TableHead>
                      <TableHead className="w-16 sticky left-16 bg-background z-20 border-r">Status</TableHead>
                      <TableHead className="min-w-[70px]">R1</TableHead>
                      <TableHead className="min-w-[70px]">R2</TableHead>
                      <TableHead className="min-w-[70px]">Y1</TableHead>
                      <TableHead className="min-w-[70px]">Y2</TableHead>
                      <TableHead className="min-w-[70px]">B1</TableHead>
                      <TableHead className="min-w-[70px]">B2</TableHead>
                      <TableHead className="min-w-[70px]">G-DE CH7</TableHead>
                      <TableHead className="min-w-[70px]">G-NDE CH8</TableHead>
                      <TableHead className="min-w-[70px]">Thr-1 CH9</TableHead>
                      <TableHead className="min-w-[70px]">Thr-2 CH10</TableHead>
                      <TableHead className="min-w-[70px]">BGB-LS CH11</TableHead>
                      <TableHead className="min-w-[70px]">BGB-HS CH12</TableHead>
                      <TableHead className="min-w-[70px]">TGB-LS CH13</TableHead>
                      <TableHead className="min-w-[70px]">TGB-HS CH14</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 24 }, (_, i) => {
                      const log = report.logs.find((l) => l.hour === i);
                      const issue = getIssue(i, 'any');

                      return (
                        <TableRow key={i} className={cn(issue && getSeverityColor(issue.severity))}>
                          <TableCell className="font-medium sticky left-0 bg-background border-r">
                            {i.toString().padStart(2, '0')}:00
                          </TableCell>
                          <TableCell className="sticky left-16 bg-background border-r">
                            {log ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <span className="text-xs text-muted-foreground">Not logged</span>
                            )}
                          </TableCell>
                          <TableCell>{log?.winding_temp_r1 ? log.winding_temp_r1.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.winding_temp_r2 ? log.winding_temp_r2.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.winding_temp_y1 ? log.winding_temp_y1.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.winding_temp_y2 ? log.winding_temp_y2.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.winding_temp_b1 ? log.winding_temp_b1.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.winding_temp_b2 ? log.winding_temp_b2.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.bearing_g_de_brg_main_ch7 ? log.bearing_g_de_brg_main_ch7.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.bearing_g_nde_brg_stand_ch8 ? log.bearing_g_nde_brg_stand_ch8.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.bearing_thrust_1_ch9 ? log.bearing_thrust_1_ch9.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.bearing_thrust_2_ch10 ? log.bearing_thrust_2_ch10.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.bearing_bgb_low_speed_ch11 ? log.bearing_bgb_low_speed_ch11.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.bearing_bgb_high_speed_ch12 ? log.bearing_bgb_high_speed_ch12.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.bearing_tgb_low_speed_ch13 ? log.bearing_tgb_low_speed_ch13.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.bearing_tgb_high_speed_ch14 ? log.bearing_tgb_high_speed_ch14.toFixed(1) : '0'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* MECHANICAL SYSTEMS */}
            <TabsContent value="mechanical" className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Intake, Tail Race, T.OPU & Cooling systems • Scroll horizontally to see all data
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-[500px] border rounded-lg">
                <Table className="min-w-max">
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-16 sticky left-0 bg-background z-20 border-r">Hour</TableHead>
                      <TableHead className="w-16 sticky left-16 bg-background z-20 border-r">Status</TableHead>
                      <TableHead className="min-w-[70px]">GV %</TableHead>
                      <TableHead className="min-w-[70px]">RB %</TableHead>
                      <TableHead className="min-w-[80px]">Water P</TableHead>
                      <TableHead className="min-w-[80px]">Water L</TableHead>
                      <TableHead className="min-w-[80px]">TR Level</TableHead>
                      <TableHead className="min-w-[80px]">Net Head</TableHead>
                      <TableHead className="min-w-[80px]">T.OPU P</TableHead>
                      <TableHead className="min-w-[80px]">T.OPU T</TableHead>
                      <TableHead className="min-w-[80px]">T.OPU L</TableHead>
                      <TableHead className="min-w-[80px]">GB.LOS P</TableHead>
                      <TableHead className="min-w-[80px]">GB.LOS T</TableHead>
                      <TableHead className="min-w-[80px]">GB.LOS L</TableHead>
                      <TableHead className="min-w-[80px]">Cool Main P</TableHead>
                      <TableHead className="min-w-[80px]">Cool Brg F</TableHead>
                      <TableHead className="min-w-[80px]">Cool LOS F</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 24 }, (_, i) => {
                      const log = report.logs.find((l) => l.hour === i);
                      const issue = getIssue(i, 'any');

                      return (
                        <TableRow key={i} className={cn(issue && getSeverityColor(issue.severity))}>
                          <TableCell className="font-medium sticky left-0 bg-background border-r">
                            {i.toString().padStart(2, '0')}:00
                          </TableCell>
                          <TableCell className="sticky left-16 bg-background border-r">
                            {log ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <span className="text-xs text-muted-foreground">Not logged</span>
                            )}
                          </TableCell>
                          <TableCell>{log?.intake_gv_percentage ? log.intake_gv_percentage.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.intake_rb_percentage ? log.intake_rb_percentage.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.intake_water_pressure ? log.intake_water_pressure.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.intake_water_level ? log.intake_water_level.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.tail_race_water_level ? log.tail_race_water_level.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.tail_race_net_head ? log.tail_race_net_head.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.topu_oil_pressure ? log.topu_oil_pressure.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.topu_oil_temperature ? log.topu_oil_temperature.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.topu_oil_level ? log.topu_oil_level.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.gblos_oil_pressure ? log.gblos_oil_pressure.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.gblos_oil_temperature ? log.gblos_oil_temperature.toFixed(1) : '0'}</TableCell>
                          <TableCell>{log?.gblos_oil_level ? log.gblos_oil_level.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.cooling_main_pressure ? log.cooling_main_pressure.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.cooling_bearing_flow ? log.cooling_bearing_flow.toFixed(2) : '0'}</TableCell>
                          <TableCell>{log?.cooling_los_flow ? log.cooling_los_flow.toFixed(2) : '0'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* REMARKS */}
            <TabsContent value="remarks" className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Hourly remarks and observations
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-[500px] border rounded-lg">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-20">Hour</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 24 }, (_, i) => {
                      const log = report.logs.find((l) => l.hour === i);

                      return (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            {i.toString().padStart(2, '0')}:00
                          </TableCell>
                          <TableCell>
                            {log ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <span className="text-xs text-muted-foreground">Not logged</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-md">
                            {displayText(log?.remarks)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
