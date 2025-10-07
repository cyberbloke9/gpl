import { forwardRef } from 'react';
import { format } from 'date-fns';

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

interface TransformerPrintViewProps {
  date: string;
  transformerNumber: number;
  logs: TransformerLog[];
  userName?: string;
  employeeId?: string;
}

export const TransformerPrintView = forwardRef<HTMLDivElement, TransformerPrintViewProps>(
  ({ date, transformerNumber, logs, userName, employeeId }, ref) => {
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    const logsByHour = new Map(logs.map(log => [log.hour, log]));

    // Calculate summary statistics
    const avgFrequency = logs.length > 0 
      ? logs.reduce((sum, log) => sum + log.frequency, 0) / logs.length 
      : 0;
    const avgActivePower = logs.length > 0
      ? logs.reduce((sum, log) => sum + log.active_power, 0) / logs.length
      : 0;
    const maxWindingTemp = logs.length > 0
      ? Math.max(...logs.map(log => log.winding_temperature))
      : 0;
    const maxOilTemp = logs.length > 0
      ? Math.max(...logs.map(log => log.oil_temperature))
      : 0;

    return (
      <div ref={ref} className="p-8 bg-white text-black">
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">
            Transformer {transformerNumber} - Hourly Log Report
          </h1>
          <p className="text-center text-sm text-gray-600">
            Generated on {format(new Date(), 'PPpp')}
          </p>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-100 rounded">
          <div>
            <p className="text-sm font-semibold text-gray-600">Date</p>
            <p className="text-lg">{format(new Date(date), 'MMMM d, yyyy')}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Transformer Number</p>
            <p className="text-lg font-bold">T{transformerNumber}</p>
          </div>
          {userName && (
            <div>
              <p className="text-sm font-semibold text-gray-600">Operator</p>
              <p className="text-lg">{userName}</p>
            </div>
          )}
          {employeeId && (
            <div>
              <p className="text-sm font-semibold text-gray-600">Employee ID</p>
              <p className="text-lg">{employeeId}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-600">Hours Logged</p>
            <p className="text-lg font-semibold">{logs.length}/24 ({Math.round((logs.length / 24) * 100)}%)</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Completion Status</p>
            <p className={`text-lg font-semibold ${logs.length === 24 ? 'text-green-600' : 'text-yellow-600'}`}>
              {logs.length === 24 ? 'Complete' : 'Incomplete'}
            </p>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-300 rounded">
          <h2 className="text-xl font-bold text-blue-800 mb-3">Summary Statistics</h2>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Avg Frequency</p>
              <p className="text-lg font-semibold">{avgFrequency.toFixed(2)} Hz</p>
            </div>
            <div>
              <p className="text-gray-600">Avg Active Power</p>
              <p className="text-lg font-semibold">{avgActivePower.toFixed(1)} kW</p>
            </div>
            <div>
              <p className="text-gray-600">Max Winding Temp</p>
              <p className="text-lg font-semibold">{maxWindingTemp.toFixed(1)} °C</p>
            </div>
            <div>
              <p className="text-gray-600">Max Oil Temp</p>
              <p className="text-lg font-semibold">{maxOilTemp.toFixed(1)} °C</p>
            </div>
          </div>
        </div>

        {/* Hourly Data Table */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">Hourly Readings</h2>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-2">Hour</th>
                <th className="border border-gray-400 p-2">Status</th>
                <th className="border border-gray-400 p-2">Freq<br/>(Hz)</th>
                <th className="border border-gray-400 p-2">V-R<br/>(V)</th>
                <th className="border border-gray-400 p-2">V-Y<br/>(V)</th>
                <th className="border border-gray-400 p-2">V-B<br/>(V)</th>
                <th className="border border-gray-400 p-2">I-R<br/>(A)</th>
                <th className="border border-gray-400 p-2">I-Y<br/>(A)</th>
                <th className="border border-gray-400 p-2">I-B<br/>(A)</th>
                <th className="border border-gray-400 p-2">P<br/>(kW)</th>
                <th className="border border-gray-400 p-2">Q<br/>(kVAR)</th>
                <th className="border border-gray-400 p-2">Wind<br/>(°C)</th>
                <th className="border border-gray-400 p-2">Oil<br/>(°C)</th>
                <th className="border border-gray-400 p-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {allHours.map((hour) => {
                const log = logsByHour.get(hour);
                const isLogged = !!log;
                
                return (
                  <tr key={hour} className={isLogged ? '' : 'bg-gray-100'}>
                    <td className="border border-gray-400 p-2 font-semibold text-center">
                      {hour.toString().padStart(2, '0')}:00
                    </td>
                    <td className="border border-gray-400 p-2 text-center">
                      {isLogged ? '✓' : '✗'}
                    </td>
                    {isLogged ? (
                      <>
                        <td className="border border-gray-400 p-2 text-right">{log.frequency.toFixed(2)}</td>
                        <td className="border border-gray-400 p-2 text-right">{log.voltage_r.toFixed(0)}</td>
                        <td className="border border-gray-400 p-2 text-right">{log.voltage_y.toFixed(0)}</td>
                        <td className="border border-gray-400 p-2 text-right">{log.voltage_b.toFixed(0)}</td>
                        <td className="border border-gray-400 p-2 text-right">{log.current_r.toFixed(1)}</td>
                        <td className="border border-gray-400 p-2 text-right">{log.current_y.toFixed(1)}</td>
                        <td className="border border-gray-400 p-2 text-right">{log.current_b.toFixed(1)}</td>
                        <td className="border border-gray-400 p-2 text-right">{log.active_power.toFixed(1)}</td>
                        <td className="border border-gray-400 p-2 text-right">{log.reactive_power.toFixed(1)}</td>
                        <td className="border border-gray-400 p-2 text-right">{log.winding_temperature.toFixed(1)}</td>
                        <td className="border border-gray-400 p-2 text-right">{log.oil_temperature.toFixed(1)}</td>
                        <td className="border border-gray-400 p-2 text-xs">{log.remarks || '-'}</td>
                      </>
                    ) : (
                      <td colSpan={12} className="border border-gray-400 p-2 text-center text-gray-500">
                        Not logged
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p>This is an official transformer log report.</p>
          <p>Transformer {transformerNumber} - {format(new Date(date), 'yyyy-MM-dd')}</p>
        </div>
      </div>
    );
  }
);

TransformerPrintView.displayName = 'TransformerPrintView';