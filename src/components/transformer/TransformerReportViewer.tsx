import { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, CheckCircle2, ArrowLeftRight } from "lucide-react";
import { TransformerPrintView } from "@/components/reports/TransformerPrintView";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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

export function TransformerReportViewer({
  isOpen,
  onClose,
  report,
  userName,
  employeeId,
}: TransformerReportViewerProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [flaggedIssues, setFlaggedIssues] = useState<any[]>([]);

  // Helper functions for default values
  const displayValue = (value: number | null | undefined): string => {
    return value !== null && value !== undefined ? value.toString() : "0";
  };

  const displayText = (value: string | null | undefined): string => {
    return value || "-";
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: report ? `Unified_Transformer_Report_${report.date}` : "Unified_Transformer_Report",
  });

  useEffect(() => {
    const fetchFlaggedIssues = async () => {
      if (!report || !isOpen) return;

      const { data } = await supabase.from("flagged_issues").select("*").eq("module", "transformer");

      setFlaggedIssues(data || []);
    };

    fetchFlaggedIssues();
  }, [report, isOpen]);

  if (!report) return null;

  const getIssue = (hour: number, field: string) => {
    return flaggedIssues.find((issue) => issue.item?.includes(`Hour ${hour}`) && issue.item?.includes(field));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 dark:bg-red-950";
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-950";
      case "info":
        return "bg-blue-100 dark:bg-blue-950";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg">
              Unified Transformer Report - {format(new Date(report.date), "PPP")}
            </DialogTitle>
            <Button onClick={handlePrint} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
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
            <div className="flex gap-2 items-center text-sm flex-wrap">
              <span className="font-medium">Severity Legend:</span>
              <Badge variant="destructive" className="text-xs">
                Critical
              </Badge>
              <Badge className="bg-yellow-500 text-xs">Warning</Badge>
              <Badge variant="secondary" className="text-xs">
                Info
              </Badge>
            </div>
          )}

          {/* Mobile Scroll Hint */}
          <div className="block sm:hidden bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-2 text-xs flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-800 dark:text-blue-200">Swipe left/right to view all columns</span>
          </div>

          <Tabs defaultValue="ptr" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ptr" className="text-xs sm:text-sm">
                PTR Feeder
              </TabsTrigger>
              <TabsTrigger value="ltac" className="text-xs sm:text-sm">
                LTAC Feeder
              </TabsTrigger>
              <TabsTrigger value="generation" className="text-xs sm:text-sm">
                Generation
              </TabsTrigger>
            </TabsList>

            {/* PTR FEEDER - ALL 22 COLUMNS */}
            <TabsContent value="ptr" className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Showing all 22 fields • Scroll horizontally to see all data
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-[500px] border rounded-lg">
                <Table className="min-w-max">
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-16 sticky left-0 bg-background z-20 border-r">Hour</TableHead>
                      <TableHead className="w-16 sticky left-16 bg-background z-20 border-r">Status</TableHead>
                      <TableHead className="min-w-[60px]">Freq</TableHead>
                      <TableHead className="min-w-[70px]">V-RY</TableHead>
                      <TableHead className="min-w-[70px]">V-YB</TableHead>
                      <TableHead className="min-w-[70px]">V-RB</TableHead>
                      <TableHead className="min-w-[60px]">I-R</TableHead>
                      <TableHead className="min-w-[60px]">I-Y</TableHead>
                      <TableHead className="min-w-[60px]">I-B</TableHead>
                      <TableHead className="min-w-[70px]">kW</TableHead>
                      <TableHead className="min-w-[70px]">kVAR</TableHead>
                      <TableHead className="min-w-[70px]">kVA</TableHead>
                      <TableHead className="min-w-[70px]">MWH</TableHead>
                      <TableHead className="min-w-[70px]">MVARH</TableHead>
                      <TableHead className="min-w-[70px]">MVAH</TableHead>
                      <TableHead className="min-w-[70px]">Cos φ</TableHead>
                      <TableHead className="min-w-[70px]">Oil °C</TableHead>
                      <TableHead className="min-w-[70px]">Wind °C</TableHead>
                      <TableHead className="min-w-[80px]">Oil Lvl</TableHead>
                      <TableHead className="min-w-[70px]">Tap Pos</TableHead>
                      <TableHead className="min-w-[80px]">Tap Counter</TableHead>
                      <TableHead className="min-w-[100px]">Silica Gel</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 24 }, (_, i) => {
                      const log = report.logs.find((l) => l.hour === i);
                      const issue = getIssue(i, "any");

                      return (
                        <TableRow key={i} className={cn(issue && getSeverityColor(issue.severity))}>
                          <TableCell className="font-medium sticky left-0 bg-background border-r">
                            {i.toString().padStart(2, "0")}:00
                          </TableCell>
                          <TableCell className="sticky left-16 bg-background border-r">
                            {log ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <span className="text-xs text-muted-foreground">Not logged</span>
                            )}
                          </TableCell>
                          <TableCell>{log?.frequency ? log.frequency.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.voltage_ry ? log.voltage_ry.toFixed(1) : "0"}</TableCell>
                          <TableCell>{log?.voltage_yb ? log.voltage_yb.toFixed(1) : "0"}</TableCell>
                          <TableCell>{log?.voltage_rb ? log.voltage_rb.toFixed(1) : "0"}</TableCell>
                          <TableCell>{log?.current_r ? log.current_r.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.current_y ? log.current_y.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.current_b ? log.current_b.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.active_power ? log.active_power.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.reactive_power ? log.reactive_power.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.kva ? log.kva.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.mwh ? log.mwh.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.mvarh ? log.mvarh.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.mvah ? log.mvah.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.cos_phi ? log.cos_phi.toFixed(3) : "0"}</TableCell>
                          <TableCell>{log?.oil_temperature ? log.oil_temperature.toFixed(1) : "0"}</TableCell>
                          <TableCell>{log?.winding_temperature ? log.winding_temperature.toFixed(1) : "0"}</TableCell>
                          <TableCell>{displayText(log?.oil_level)}</TableCell>
                          <TableCell>{displayText(log?.tap_position)}</TableCell>
                          <TableCell>{displayValue(log?.tap_counter)}</TableCell>
                          <TableCell>{displayText(log?.silica_gel_colour)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* LTAC FEEDER - ALL 18 COLUMNS */}
            <TabsContent value="ltac" className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Showing all 18 fields • Scroll horizontally to see all data
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
                      <TableHead className="min-w-[70px]">V-RB</TableHead>
                      <TableHead className="min-w-[70px]">kW</TableHead>
                      <TableHead className="min-w-[70px]">kVA</TableHead>
                      <TableHead className="min-w-[70px]">kVAR</TableHead>
                      <TableHead className="min-w-[70px]">KWH</TableHead>
                      <TableHead className="min-w-[70px]">KVAH</TableHead>
                      <TableHead className="min-w-[70px]">KVARH</TableHead>
                      <TableHead className="min-w-[70px]">Oil °C</TableHead>
                      <TableHead className="min-w-[90px]">Fail Time</TableHead>
                      <TableHead className="min-w-[90px]">Resume</TableHead>
                      <TableHead className="min-w-[120px]">Supply Int.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 24 }, (_, i) => {
                      const log = report.logs.find((l) => l.hour === i);
                      const issue = getIssue(i, "any");

                      return (
                        <TableRow key={i} className={cn(issue && getSeverityColor(issue.severity))}>
                          <TableCell className="font-medium sticky left-0 bg-background border-r">
                            {i.toString().padStart(2, "0")}:00
                          </TableCell>
                          <TableCell className="sticky left-16 bg-background border-r">
                            {log ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <span className="text-xs text-muted-foreground">Not logged</span>
                            )}
                          </TableCell>
                          <TableCell>{log?.ltac_current_r ? log.ltac_current_r.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.ltac_current_y ? log.ltac_current_y.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.ltac_current_b ? log.ltac_current_b.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.ltac_voltage_ry ? log.ltac_voltage_ry.toFixed(1) : "0"}</TableCell>
                          <TableCell>{log?.ltac_voltage_yb ? log.ltac_voltage_yb.toFixed(1) : "0"}</TableCell>
                          <TableCell>{log?.ltac_voltage_rb ? log.ltac_voltage_rb.toFixed(1) : "0"}</TableCell>
                          <TableCell>{log?.ltac_kw ? log.ltac_kw.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.ltac_kva ? log.ltac_kva.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.ltac_kvar ? log.ltac_kvar.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.ltac_kwh ? log.ltac_kwh.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.ltac_kvah ? log.ltac_kvah.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.ltac_kvarh ? log.ltac_kvarh.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.ltac_oil_temperature ? log.ltac_oil_temperature.toFixed(1) : "0"}</TableCell>
                          <TableCell className="text-xs">{displayText(log?.ltac_grid_fail_time)}</TableCell>
                          <TableCell className="text-xs">{displayText(log?.ltac_grid_resume_time)}</TableCell>
                          <TableCell className="text-xs">{displayText(log?.ltac_supply_interruption)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* GENERATION - ALL 12 COLUMNS */}
            <TabsContent value="generation" className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Showing all 12 fields • Scroll horizontally to see all data
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-[500px] border rounded-lg">
                <Table className="min-w-max">
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-16 sticky left-0 bg-background z-20 border-r">Hour</TableHead>
                      <TableHead className="w-16 sticky left-16 bg-background z-20 border-r">Status</TableHead>
                      <TableHead className="min-w-[80px]">Total Gen</TableHead>
                      <TableHead className="min-w-[80px]">X'MER Exp</TableHead>
                      <TableHead className="min-w-[80px]">AUX Cons</TableHead>
                      <TableHead className="min-w-[80px]">Main Exp</TableHead>
                      <TableHead className="min-w-[80px]">Check Exp</TableHead>
                      <TableHead className="min-w-[80px]">Main Imp</TableHead>
                      <TableHead className="min-w-[80px]">Check Imp</TableHead>
                      <TableHead className="min-w-[80px]">Stby Exp</TableHead>
                      <TableHead className="min-w-[80px]">Stby Imp</TableHead>
                      <TableHead className="min-w-[150px]">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 24 }, (_, i) => {
                      const log = report.logs.find((l) => l.hour === i);
                      const issue = getIssue(i, "any");

                      return (
                        <TableRow key={i} className={cn(issue && getSeverityColor(issue.severity))}>
                          <TableCell className="font-medium sticky left-0 bg-background border-r">
                            {i.toString().padStart(2, "0")}:00
                          </TableCell>
                          <TableCell className="sticky left-16 bg-background border-r">
                            {log ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <span className="text-xs text-muted-foreground">Not logged</span>
                            )}
                          </TableCell>
                          <TableCell>{log?.gen_total_generation ? log.gen_total_generation.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.gen_xmer_export ? log.gen_xmer_export.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.gen_aux_consumption ? log.gen_aux_consumption.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.gen_main_export ? log.gen_main_export.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.gen_check_export ? log.gen_check_export.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.gen_main_import ? log.gen_main_import.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.gen_check_import ? log.gen_check_import.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.gen_standby_export ? log.gen_standby_export.toFixed(2) : "0"}</TableCell>
                          <TableCell>{log?.gen_standby_import ? log.gen_standby_import.toFixed(2) : "0"}</TableCell>
                          <TableCell className="text-xs max-w-[200px]">{displayText(log?.remarks)}</TableCell>
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
