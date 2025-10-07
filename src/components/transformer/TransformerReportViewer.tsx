import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { CheckCircle2, XCircle } from 'lucide-react';

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
}

export const TransformerReportViewer = ({ isOpen, onClose, report }: TransformerReportViewerProps) => {
  if (!report) return null;

  const { date, transformerNumber, logs } = report;
  
  // Create a map of hour -> log for quick lookup
  const logsByHour = new Map(logs.map(log => [log.hour, log]));
  
  // Generate all 24 hours
  const allHours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Transformer {transformerNumber} Report - {format(new Date(date), 'MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
                          <TableCell>{log.frequency.toFixed(2)}</TableCell>
                          <TableCell>{log.voltage_r.toFixed(0)}</TableCell>
                          <TableCell>{log.voltage_y.toFixed(0)}</TableCell>
                          <TableCell>{log.voltage_b.toFixed(0)}</TableCell>
                          <TableCell>{log.current_r.toFixed(1)}</TableCell>
                          <TableCell>{log.current_y.toFixed(1)}</TableCell>
                          <TableCell>{log.current_b.toFixed(1)}</TableCell>
                          <TableCell>{log.active_power.toFixed(1)}</TableCell>
                          <TableCell>{log.reactive_power.toFixed(1)}</TableCell>
                          <TableCell>{log.winding_temperature.toFixed(1)}</TableCell>
                          <TableCell>{log.oil_temperature.toFixed(1)}</TableCell>
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
  );
};