import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GeneratorPrintView } from '@/components/reports/GeneratorPrintView';
import { GeneratorLog } from '@/types/generator';
import { Printer } from 'lucide-react';

interface GeneratorReportViewerProps {
  log: GeneratorLog;
}

export function GeneratorReportViewer({ log }: GeneratorReportViewerProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Generator_Log_${log.date}`,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Generator Log Report</h2>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={printRef}>
            <GeneratorPrintView log={log} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
