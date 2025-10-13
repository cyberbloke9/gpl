import { forwardRef } from 'react';
import { format } from 'date-fns';

const getTransformerName = (number: number): string => {
  return number === 1 ? 'Power Transformer' : 'Auxiliary Transformer';
};

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

interface TransformerPrintViewProps {
  date: string;
  transformerNumber: number;
  logs: TransformerLog[];
  userName?: string;
  employeeId?: string;
  flaggedIssues?: any[];
}

export const TransformerPrintView = forwardRef<HTMLDivElement, TransformerPrintViewProps>(
  ({ date, transformerNumber, logs, userName, employeeId, flaggedIssues = [] }, ref) => {
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    const logsByHour = new Map(logs.map(log => [log.hour, log]));

    const getIssue = (hour: number, field: string) => {
      return flaggedIssues.find(issue => 
        issue.section === getTransformerName(transformerNumber) &&
        issue.item?.includes(`Hour ${hour}`) &&
        issue.item?.includes(field)
      );
    };

    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case 'critical': return 'bg-red-100';
        case 'warning': return 'bg-yellow-100';
        case 'info': return 'bg-blue-100';
        default: return '';
      }
    };

    const avgFreq = logs.length > 0 
      ? (logs.reduce((sum, l) => sum + (l.frequency || 0), 0) / logs.length).toFixed(2)
      : '-';
    
    const avgPower = logs.length > 0
      ? (logs.reduce((sum, l) => sum + (l.active_power || 0), 0) / logs.length).toFixed(2)
      : '-';
    
    const maxOilTemp = logs.length > 0
      ? Math.max(...logs.map(l => l.oil_temperature || 0)).toFixed(1)
      : '-';
    
    const maxWindingTemp = logs.length > 0
      ? Math.max(...logs.map(l => l.winding_temperature || 0)).toFixed(1)
      : '-';

    return (
      <div ref={ref} className="p-8 bg-white text-black" style={{ width: '210mm', minHeight: '297mm' }}>
        {/* Header */}
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold">GAYATRI POWER PRIVATE LIMITED</h1>
          <h2 className="text-xl mt-2">TRANSFORMER LOG SHEET</h2>
          <p className="text-sm mt-1">Generated on: {format(new Date(), 'PPP HH:mm')}</p>
        </div>

        {/* Summary Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p><strong>Date:</strong> {format(new Date(date), 'PPP')}</p>
            <p><strong>Transformer:</strong> {getTransformerName(transformerNumber)}</p>
          </div>
          <div>
            {userName && <p><strong>Operator:</strong> {userName}</p>}
            {employeeId && <p><strong>Employee ID:</strong> {employeeId}</p>}
            <p><strong>Logged Hours:</strong> {logs.length}/24</p>
          </div>
        </div>

        {/* Severity Legend */}
        {flaggedIssues.length > 0 && (
          <div className="mb-4 p-2 border border-gray-300 text-xs">
            <strong>Severity Legend:</strong>
            <span className="ml-2 bg-red-100 px-2 py-1">Critical</span>
            <span className="ml-2 bg-yellow-100 px-2 py-1">Warning</span>
            <span className="ml-2 bg-blue-100 px-2 py-1">Info</span>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="mb-6 p-4 border border-gray-300">
          <h3 className="font-bold mb-2">Summary Statistics</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div><strong>Avg Frequency:</strong> {avgFreq} Hz</div>
            <div><strong>Avg Power:</strong> {avgPower} kW</div>
            <div><strong>Max Oil Temp:</strong> {maxOilTemp} °C</div>
            <div><strong>Max Winding Temp:</strong> {maxWindingTemp} °C</div>
          </div>
        </div>

        {/* PTR Feeder Data */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-2 border-b border-gray-400">PTR Feeder (3.2 MVA, 33 KV / 3.3 KV)</h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1">Hr</th>
                <th className="border border-gray-400 p-1">Freq</th>
                <th className="border border-gray-400 p-1">V-RY</th>
                <th className="border border-gray-400 p-1">V-YB</th>
                <th className="border border-gray-400 p-1">V-RB</th>
                <th className="border border-gray-400 p-1">I-R</th>
                <th className="border border-gray-400 p-1">I-Y</th>
                <th className="border border-gray-400 p-1">I-B</th>
                <th className="border border-gray-400 p-1">kW</th>
                <th className="border border-gray-400 p-1">kVAR</th>
                <th className="border border-gray-400 p-1">kVA</th>
                <th className="border border-gray-400 p-1">Oil°C</th>
                <th className="border border-gray-400 p-1">Wind°C</th>
              </tr>
            </thead>
            <tbody>
              {allHours.map(hour => {
                const log = logsByHour.get(hour);
                const issue = getIssue(hour, 'any');
                return (
                  <tr key={hour} className={issue ? getSeverityColor(issue.severity) : ''}>
                    <td className="border border-gray-400 p-1 text-center font-medium">{hour.toString().padStart(2, '0')}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.frequency?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.voltage_ry?.toFixed(1) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.voltage_yb?.toFixed(1) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.voltage_rb?.toFixed(1) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.current_r?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.current_y?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.current_b?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.active_power?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.reactive_power?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.kva?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.oil_temperature?.toFixed(1) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.winding_temperature?.toFixed(1) || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ pageBreakBefore: 'always' }} />

        {/* LTAC Feeder Data */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-2 border-b border-gray-400">LTAC Feeder (100 KVA, 33 KV / 0.433 KV)</h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1">Hr</th>
                <th className="border border-gray-400 p-1">I-R</th>
                <th className="border border-gray-400 p-1">I-Y</th>
                <th className="border border-gray-400 p-1">I-B</th>
                <th className="border border-gray-400 p-1">V-RY</th>
                <th className="border border-gray-400 p-1">V-YB</th>
                <th className="border border-gray-400 p-1">V-RB</th>
                <th className="border border-gray-400 p-1">kW</th>
                <th className="border border-gray-400 p-1">kVA</th>
                <th className="border border-gray-400 p-1">kVAR</th>
                <th className="border border-gray-400 p-1">Oil°C</th>
              </tr>
            </thead>
            <tbody>
              {allHours.map(hour => {
                const log = logsByHour.get(hour);
                return (
                  <tr key={hour}>
                    <td className="border border-gray-400 p-1 text-center font-medium">{hour.toString().padStart(2, '0')}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_current_r?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_current_y?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_current_b?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_voltage_ry?.toFixed(1) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_voltage_yb?.toFixed(1) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_voltage_rb?.toFixed(1) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_kw?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_kva?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_kvar?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_oil_temperature?.toFixed(1) || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Generation Details */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-2 border-b border-gray-400">Generation Details</h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1">Hr</th>
                <th className="border border-gray-400 p-1">Total Gen</th>
                <th className="border border-gray-400 p-1">X'MER Exp</th>
                <th className="border border-gray-400 p-1">AUX Cons</th>
                <th className="border border-gray-400 p-1">Main Exp</th>
                <th className="border border-gray-400 p-1">Check Exp</th>
                <th className="border border-gray-400 p-1">Main Imp</th>
                <th className="border border-gray-400 p-1">Check Imp</th>
                <th className="border border-gray-400 p-1">Stby Exp</th>
                <th className="border border-gray-400 p-1">Stby Imp</th>
              </tr>
            </thead>
            <tbody>
              {allHours.map(hour => {
                const log = logsByHour.get(hour);
                return (
                  <tr key={hour}>
                    <td className="border border-gray-400 p-1 text-center font-medium">{hour.toString().padStart(2, '0')}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.gen_total_generation?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.gen_xmer_export?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.gen_aux_consumption?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.gen_main_export?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.gen_check_export?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.gen_main_import?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.gen_check_import?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.gen_standby_export?.toFixed(2) || '-'}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.gen_standby_import?.toFixed(2) || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Remarks Section */}
        {logs.some(l => l.remarks) && (
          <div className="mt-6">
            <h3 className="font-bold text-lg mb-2 border-b border-gray-400">Remarks</h3>
            {logs.filter(l => l.remarks).map(log => (
              <div key={log.hour} className="text-xs mb-2">
                <strong>Hour {log.hour.toString().padStart(2, '0')}:00</strong> - {log.remarks}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

TransformerPrintView.displayName = 'TransformerPrintView';
