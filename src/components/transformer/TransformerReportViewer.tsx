import { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, Download } from 'lucide-react';
import { TransformerPrintView } from '@/components/reports/TransformerPrintView';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Helper function to get transformer display name
const getTransformerName = (number: number): string => {
  return number === 1 ? 'Power Transformer' : 'Auxiliary Transformer';
};

interface TransformerLog {
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
}

interface TransformerReportViewerProps {
  isOpen: boolean;
  onClose: () => void;
  report: {
    date: string;
    transformerNumber: number;
    logs: TransformerLog[];
  } | null;
  userName?: string;
  employeeId?: string;
}

export const TransformerReportViewer = ({ isOpen, onClose, report, userName, employeeId }: TransformerReportViewerProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [flaggedIssues, setFlaggedIssues] = useState<any[]>([]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Transformer${report?.transformerNumber}_${format(new Date(report?.date || new Date()), 'yyyy-MM-dd')}_${employeeId || 'Report'}`,
    onAfterPrint: () => toast.success('PDF downloaded successfully'),
  });

  // Fetch flagged issues for transformer logs
  useEffect(() => {
    const fetchFlaggedIssues = async () => {
      if (!report?.logs || report.logs.length === 0) return;
      
      const { data } = await supabase
        .from('flagged_issues')
        .select('*')
        .eq('module', 'Transformer Logs');
      
      setFlaggedIssues(data || []);
    };
    
    if (isOpen && report) {
      fetchFlaggedIssues();
    }
  }, [isOpen, report]);

  if (!report) return null;

  const { date, transformerNumber, logs } = report;
  
  // Helper to check if a field is flagged
  const getIssue = (hour: number, field: string) => {
    return flaggedIssues.find(issue => 
      issue.section === getTransformerName(transformerNumber) &&
      issue.item?.includes(`Hour ${hour}`) &&
      issue.item?.includes(field)
    );
  };

  // Helper to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-900';
      case 'high': return 'bg-orange-100 text-orange-900';
      case 'medium': return 'bg-yellow-100 text-yellow-900';
      case 'low': return 'bg-yellow-50 text-yellow-800';
      default: return '';
    }
  };
  
  // Create a map of hour -> log for quick lookup
  const logsByHour = new Map(logs.map(log => [log.hour, log]));
  
  // Generate all 24 hours
  const allHours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <>
      {/* Hidden print view */}
      <div className="hidden">
        <TransformerPrintView 
          ref={printRef} 
          date={date} 
          transformerNumber={transformerNumber} 
          logs={logs}
          userName={userName}
          employeeId={employeeId}
          flaggedIssues={flaggedIssues}
        />
      </div>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">
                {getTransformerName(transformerNumber)} Report - {format(new Date(date), 'MMMM d, yyyy')}
              </DialogTitle>
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </DialogHeader>

        <div className="space-y-4">
          {/* Severity Legend */}
          {flaggedIssues.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-3">Flagged Issues Severity Legend</h4>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="px-3 py-1.5 bg-red-100 text-red-900 border-2 border-red-500 rounded font-medium">
                  🔴 Critical
                </span>
                <span className="px-3 py-1.5 bg-orange-100 text-orange-900 border-2 border-orange-500 rounded font-medium">
                  🟠 High
                </span>
                <span className="px-3 py-1.5 bg-yellow-100 text-yellow-900 border-2 border-yellow-500 rounded font-medium">
                  🟡 Medium
                </span>
                <span className="px-3 py-1.5 bg-yellow-50 text-yellow-800 border-2 border-yellow-300 rounded font-medium">
                  ⚪ Low
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Badge variant="outline">
              {logs.length}/24 Hours Logged ({Math.round((logs.length / 24) * 100)}%)
            </Badge>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Hour</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead>Freq (Hz)</TableHead>
                  <TableHead>V-R (V)</TableHead>
                  <TableHead>V-Y (V)</TableHead>
                  <TableHead>V-B (V)</TableHead>
                  <TableHead>I-R (A)</TableHead>
                  <TableHead>I-Y (A)</TableHead>
                  <TableHead>I-B (A)</TableHead>
                  <TableHead>P (kW)</TableHead>
                  <TableHead>Q (kVAR)</TableHead>
                  <TableHead>Winding (°C)</TableHead>
                  <TableHead>Oil (°C)</TableHead>
                  <TableHead className="min-w-[200px]">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allHours.map((hour) => {
                  const log = logsByHour.get(hour);
                  const isLogged = !!log;
                  
                  return (
                    <TableRow 
                      key={hour} 
                      className={isLogged ? '' : 'bg-muted/30'}
                    >
                      <TableCell className="font-medium">
                        {hour.toString().padStart(2, '0')}:00
                      </TableCell>
                      <TableCell>
                        {isLogged ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                      </TableCell>
                      {isLogged ? (
                        <>
                          <TableCell className={getIssue(hour, 'Frequency') ? getSeverityColor(getIssue(hour, 'Frequency')?.severity) : ''}>
                            {log.frequency.toFixed(2)}
                            {getIssue(hour, 'Frequency') && <span className="ml-1">⚠️</span>}
                          </TableCell>
                          <TableCell className={getIssue(hour, 'Voltage R') ? getSeverityColor(getIssue(hour, 'Voltage R')?.severity) : ''}>
                            {log.voltage_r.toFixed(0)}
                            {getIssue(hour, 'Voltage R') && <span className="ml-1">⚠️</span>}
                          </TableCell>
                          <TableCell className={getIssue(hour, 'Voltage Y') ? getSeverityColor(getIssue(hour, 'Voltage Y')?.severity) : ''}>
                            {log.voltage_y.toFixed(0)}
                            {getIssue(hour, 'Voltage Y') && <span className="ml-1">⚠️</span>}
                          </TableCell>
                          <TableCell className={getIssue(hour, 'Voltage B') ? getSeverityColor(getIssue(hour, 'Voltage B')?.severity) : ''}>
                            {log.voltage_b.toFixed(0)}
                            {getIssue(hour, 'Voltage B') && <span className="ml-1">⚠️</span>}
                          </TableCell>
                          <TableCell className={getIssue(hour, 'Current R') ? getSeverityColor(getIssue(hour, 'Current R')?.severity) : ''}>
                            {log.current_r.toFixed(1)}
                            {getIssue(hour, 'Current R') && <span className="ml-1">⚠️</span>}
                          </TableCell>
                          <TableCell className={getIssue(hour, 'Current Y') ? getSeverityColor(getIssue(hour, 'Current Y')?.severity) : ''}>
                            {log.current_y.toFixed(1)}
                            {getIssue(hour, 'Current Y') && <span className="ml-1">⚠️</span>}
                          </TableCell>
                          <TableCell className={getIssue(hour, 'Current B') ? getSeverityColor(getIssue(hour, 'Current B')?.severity) : ''}>
                            {log.current_b.toFixed(1)}
                            {getIssue(hour, 'Current B') && <span className="ml-1">⚠️</span>}
                          </TableCell>
                          <TableCell className={getIssue(hour, 'Active Power') ? getSeverityColor(getIssue(hour, 'Active Power')?.severity) : ''}>
                            {log.active_power.toFixed(1)}
                            {getIssue(hour, 'Active Power') && <span className="ml-1">⚠️</span>}
                          </TableCell>
                          <TableCell className={getIssue(hour, 'Reactive Power') ? getSeverityColor(getIssue(hour, 'Reactive Power')?.severity) : ''}>
                            {log.reactive_power.toFixed(1)}
                            {getIssue(hour, 'Reactive Power') && <span className="ml-1">⚠️</span>}
                          </TableCell>
                          <TableCell className={getIssue(hour, 'Winding Temperature') ? getSeverityColor(getIssue(hour, 'Winding Temperature')?.severity) : ''}>
                            {log.winding_temperature.toFixed(1)}
                            {getIssue(hour, 'Winding Temperature') && <span className="ml-1">⚠️</span>}
                          </TableCell>
                          <TableCell className={getIssue(hour, 'Oil Temperature') ? getSeverityColor(getIssue(hour, 'Oil Temperature')?.severity) : ''}>
                            {log.oil_temperature.toFixed(1)}
                            {getIssue(hour, 'Oil Temperature') && <span className="ml-1">⚠️</span>}
                          </TableCell>
                          <TableCell className="text-sm">{log.remarks || '-'}</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell colSpan={12} className="text-center text-muted-foreground">
                            Not logged
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};