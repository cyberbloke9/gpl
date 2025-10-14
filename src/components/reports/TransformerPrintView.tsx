import { forwardRef } from "react";
import { format } from "date-fns";
import { CheckCircle2, X } from "lucide-react";

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
  logs: TransformerLog[];
  userName?: string;
  employeeId?: string;
  flaggedIssues?: any[];
}

export const TransformerPrintView = forwardRef<HTMLDivElement, TransformerPrintViewProps>(
  ({ date, logs, userName, employeeId, flaggedIssues = [] }, ref) => {
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    const logsByHour = new Map(logs.map((log) => [log.hour, log]));

    const getIssue = (hour: number) => {
      return flaggedIssues.find((issue) => issue.item?.includes(`Hour ${hour}`));
    };

    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case "critical":
          return "bg-red-100";
        case "warning":
          return "bg-yellow-100";
        case "info":
          return "bg-blue-100";
        default:
          return "";
      }
    };

    const avgFreq =
      logs.length > 0 ? (logs.reduce((sum, l) => sum + (l.frequency || 0), 0) / logs.length).toFixed(2) : "0";

    const avgPower =
      logs.length > 0 ? (logs.reduce((sum, l) => sum + (l.active_power || 0), 0) / logs.length).toFixed(2) : "0";

    const maxOilTemp = logs.length > 0 ? Math.max(...logs.map((l) => l.oil_temperature || 0)).toFixed(1) : "0";

    const maxWindingTemp = logs.length > 0 ? Math.max(...logs.map((l) => l.winding_temperature || 0)).toFixed(1) : "0";

    // Split hours into chunks for better pagination
    const ptrHoursChunk1 = allHours.slice(0, 12); // Hours 0-11
    const ptrHoursChunk2 = allHours.slice(12, 24); // Hours 12-23

    return (
      <div ref={ref} className="bg-white text-black" style={{ width: "210mm" }}>
        <style>{`
          @media print {
            @page {
              size: A4 landscape;
              margin: 8mm;
            }
            .page-break {
              page-break-before: always;
            }
            .avoid-break {
              page-break-inside: avoid;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
          .compact-table {
            font-size: 7px;
            line-height: 1.2;
          }
          .compact-table th,
          .compact-table td {
            padding: 2px 1px;
          }
        `}</style>

        {/* PAGE 1: Cover & Table of Contents */}
        <div className="p-8 min-h-[210mm]">
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-3xl font-bold">GAYATRI POWER PRIVATE LIMITED</h1>
            <h2 className="text-2xl mt-3">UNIFIED TRANSFORMER LOG SHEET</h2>
            <p className="text-base mt-2">Date: {format(new Date(date), "PPP")}</p>
            <p className="text-sm mt-1">Generated: {format(new Date(), "PPP HH:mm")}</p>
          </div>

          {/* Summary Info */}
          <div className="grid grid-cols-2 gap-6 mb-8 text-sm avoid-break">
            <div className="space-y-2">
              <p>
                <strong>Report Date:</strong> {format(new Date(date), "PPP")}
              </p>
              <p>
                <strong>Logged Hours:</strong> {logs.length}/24
              </p>
            </div>
            <div className="space-y-2">
              {userName && (
                <p>
                  <strong>Operator:</strong> {userName}
                </p>
              )}
              {employeeId && (
                <p>
                  <strong>Employee ID:</strong> {employeeId}
                </p>
              )}
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="mb-8 p-6 border-2 border-gray-300 avoid-break">
            <h3 className="font-bold text-xl mb-4">Summary Statistics</h3>
            <div className="grid grid-cols-2 gap-4 text-base">
              <div>
                <strong>Avg Frequency:</strong> {avgFreq} Hz
              </div>
              <div>
                <strong>Avg Power:</strong> {avgPower} kW
              </div>
              <div>
                <strong>Max Oil Temp:</strong> {maxOilTemp} °C
              </div>
              <div>
                <strong>Max Winding Temp:</strong> {maxWindingTemp} °C
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="mb-8 avoid-break">
            <h3 className="font-bold text-xl mb-4 border-b border-gray-400 pb-2">📑 Table of Contents</h3>
            <div className="space-y-2 text-base pl-4">
              <p>
                📄 <strong>Page 1:</strong> Cover & Summary
              </p>
              <p>
                📄 <strong>Page 2-3:</strong> PTR Feeder Data (All Fields - Hours 0-23)
              </p>
              <p>
                📄 <strong>Page 4:</strong> LTAC Feeder Data (All Fields - Hours 0-23)
              </p>
              <p>
                📄 <strong>Page 5:</strong> Generation Details (All Fields - Hours 0-23)
              </p>
              {logs.some((l) => l.remarks) && (
                <p>
                  📄 <strong>Page 6:</strong> Remarks & Observations
                </p>
              )}
            </div>
          </div>

          {/* Severity Legend */}
          {flaggedIssues.length > 0 && (
            <div className="p-4 border border-gray-300 text-sm avoid-break">
              <strong className="block mb-2">⚠️ Severity Legend:</strong>
              <div className="flex gap-4">
                <span className="bg-red-100 px-3 py-1 border border-red-300">🔴 Critical</span>
                <span className="bg-yellow-100 px-3 py-1 border border-yellow-300">🟡 Warning</span>
                <span className="bg-blue-100 px-3 py-1 border border-blue-300">🔵 Info</span>
              </div>
            </div>
          )}

          {/* Navigation Instructions for Mobile */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-300 rounded text-sm">
            <h4 className="font-bold mb-2">📱 Mobile Navigation Guide:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Swipe left/right to navigate between pages</li>
              <li>Pinch to zoom for detailed view</li>
              <li>Use the page numbers at bottom to jump to sections</li>
              <li>All data fields from the web viewer are included</li>
            </ul>
          </div>
        </div>

        {/* PAGE 2: PTR Feeder Data (Hours 0-11) - COMPLETE */}
        <div className="page-break p-4">
          <h3 className="font-bold text-base mb-2 border-b-2 border-gray-400 pb-1">
            PTR Feeder (3.2 MVA, 33 KV / 3.3 KV) - Hours 00:00 to 11:00 - COMPLETE DATA
          </h3>
          <table className="w-full compact-table border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1">Hr</th>
                <th className="border border-gray-400 p-1">✓</th>
                <th className="border border-gray-400 p-1">
                  Freq
                  <br />
                  (Hz)
                </th>
                <th className="border border-gray-400 p-1">
                  V-RY
                  <br />
                  (V)
                </th>
                <th className="border border-gray-400 p-1">
                  V-YB
                  <br />
                  (V)
                </th>
                <th className="border border-gray-400 p-1">
                  V-RB
                  <br />
                  (V)
                </th>
                <th className="border border-gray-400 p-1">
                  I-R
                  <br />
                  (A)
                </th>
                <th className="border border-gray-400 p-1">
                  I-Y
                  <br />
                  (A)
                </th>
                <th className="border border-gray-400 p-1">
                  I-B
                  <br />
                  (A)
                </th>
                <th className="border border-gray-400 p-1">kW</th>
                <th className="border border-gray-400 p-1">kVAR</th>
                <th className="border border-gray-400 p-1">kVA</th>
                <th className="border border-gray-400 p-1">MWH</th>
                <th className="border border-gray-400 p-1">MVARH</th>
                <th className="border border-gray-400 p-1">MVAH</th>
                <th className="border border-gray-400 p-1">Cos φ</th>
                <th className="border border-gray-400 p-1">
                  Oil
                  <br />
                  (°C)
                </th>
                <th className="border border-gray-400 p-1">
                  Wind
                  <br />
                  (°C)
                </th>
                <th className="border border-gray-400 p-1">
                  Oil
                  <br />
                  Lvl
                </th>
                <th className="border border-gray-400 p-1">
                  Tap
                  <br />
                  Pos
                </th>
              </tr>
            </thead>
            <tbody>
              {ptrHoursChunk1.map((hour) => {
                const log = logsByHour.get(hour);
                const issue = getIssue(hour);
                return (
                  <tr key={hour} className={issue ? getSeverityColor(issue.severity) : ""}>
                    <td className="border border-gray-400 p-1 text-center font-bold">
                      {hour.toString().padStart(2, "0")}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">{log ? "✓" : "✗"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.frequency?.toFixed(2) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.voltage_ry?.toFixed(0) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.voltage_yb?.toFixed(0) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.voltage_rb?.toFixed(0) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.current_r?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.current_y?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.current_b?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.active_power?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.reactive_power?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.kva?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.mwh?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.mvarh?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.mvah?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.cos_phi?.toFixed(2) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.oil_temperature?.toFixed(0) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.winding_temperature?.toFixed(0) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center text-[6px]">{log?.oil_level || "-"}</td>
                    <td className="border border-gray-400 p-1 text-center text-[6px]">{log?.tap_position || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-center mt-2 text-gray-600">Page 2 of 6 | Swipe right for Hours 12-23 →</p>
        </div>

        {/* PAGE 3: PTR Feeder Data (Hours 12-23) - COMPLETE */}
        <div className="page-break p-4">
          <h3 className="font-bold text-base mb-2 border-b-2 border-gray-400 pb-1">
            PTR Feeder (3.2 MVA, 33 KV / 3.3 KV) - Hours 12:00 to 23:00 - COMPLETE DATA
          </h3>
          <table className="w-full compact-table border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1">Hr</th>
                <th className="border border-gray-400 p-1">✓</th>
                <th className="border border-gray-400 p-1">
                  Freq
                  <br />
                  (Hz)
                </th>
                <th className="border border-gray-400 p-1">
                  V-RY
                  <br />
                  (V)
                </th>
                <th className="border border-gray-400 p-1">
                  V-YB
                  <br />
                  (V)
                </th>
                <th className="border border-gray-400 p-1">
                  V-RB
                  <br />
                  (V)
                </th>
                <th className="border border-gray-400 p-1">
                  I-R
                  <br />
                  (A)
                </th>
                <th className="border border-gray-400 p-1">
                  I-Y
                  <br />
                  (A)
                </th>
                <th className="border border-gray-400 p-1">
                  I-B
                  <br />
                  (A)
                </th>
                <th className="border border-gray-400 p-1">kW</th>
                <th className="border border-gray-400 p-1">kVAR</th>
                <th className="border border-gray-400 p-1">kVA</th>
                <th className="border border-gray-400 p-1">MWH</th>
                <th className="border border-gray-400 p-1">MVARH</th>
                <th className="border border-gray-400 p-1">MVAH</th>
                <th className="border border-gray-400 p-1">Cos φ</th>
                <th className="border border-gray-400 p-1">
                  Oil
                  <br />
                  (°C)
                </th>
                <th className="border border-gray-400 p-1">
                  Wind
                  <br />
                  (°C)
                </th>
                <th className="border border-gray-400 p-1">
                  Oil
                  <br />
                  Lvl
                </th>
                <th className="border border-gray-400 p-1">
                  Tap
                  <br />
                  Pos
                </th>
              </tr>
            </thead>
            <tbody>
              {ptrHoursChunk2.map((hour) => {
                const log = logsByHour.get(hour);
                const issue = getIssue(hour);
                return (
                  <tr key={hour} className={issue ? getSeverityColor(issue.severity) : ""}>
                    <td className="border border-gray-400 p-1 text-center font-bold">
                      {hour.toString().padStart(2, "0")}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">{log ? "✓" : "✗"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.frequency?.toFixed(2) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.voltage_ry?.toFixed(0) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.voltage_yb?.toFixed(0) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.voltage_rb?.toFixed(0) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.current_r?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.current_y?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.current_b?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.active_power?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.reactive_power?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.kva?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.mwh?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.mvarh?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.mvah?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.cos_phi?.toFixed(2) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.oil_temperature?.toFixed(0) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.winding_temperature?.toFixed(0) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center text-[6px]">{log?.oil_level || "-"}</td>
                    <td className="border border-gray-400 p-1 text-center text-[6px]">{log?.tap_position || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-center mt-2 text-gray-600">Page 3 of 6 | Swipe right for LTAC Data →</p>
        </div>

        {/* PAGE 4: LTAC Feeder Data - COMPLETE */}
        <div className="page-break p-4">
          <h3 className="font-bold text-base mb-2 border-b-2 border-gray-400 pb-1">
            LTAC Feeder (100 KVA, 33 KV / 0.433 KV) - Hours 00:00 to 23:00 - COMPLETE DATA
          </h3>
          <table className="w-full compact-table border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1">Hr</th>
                <th className="border border-gray-400 p-1">✓</th>
                <th className="border border-gray-400 p-1">
                  I-R
                  <br />
                  (A)
                </th>
                <th className="border border-gray-400 p-1">
                  I-Y
                  <br />
                  (A)
                </th>
                <th className="border border-gray-400 p-1">
                  I-B
                  <br />
                  (A)
                </th>
                <th className="border border-gray-400 p-1">
                  V-RY
                  <br />
                  (V)
                </th>
                <th className="border border-gray-400 p-1">
                  V-YB
                  <br />
                  (V)
                </th>
                <th className="border border-gray-400 p-1">
                  V-RB
                  <br />
                  (V)
                </th>
                <th className="border border-gray-400 p-1">kW</th>
                <th className="border border-gray-400 p-1">kVA</th>
                <th className="border border-gray-400 p-1">kVAR</th>
                <th className="border border-gray-400 p-1">KWH</th>
                <th className="border border-gray-400 p-1">KVAH</th>
                <th className="border border-gray-400 p-1">KVARH</th>
                <th className="border border-gray-400 p-1">
                  Oil
                  <br />
                  (°C)
                </th>
                <th className="border border-gray-400 p-1">
                  Fail
                  <br />
                  Time
                </th>
                <th className="border border-gray-400 p-1">
                  Resume
                  <br />
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {allHours.map((hour) => {
                const log = logsByHour.get(hour);
                const issue = getIssue(hour);
                return (
                  <tr key={hour} className={issue ? getSeverityColor(issue.severity) : ""}>
                    <td className="border border-gray-400 p-1 text-center font-bold">
                      {hour.toString().padStart(2, "0")}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">{log ? "✓" : "✗"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_current_r?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_current_y?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_current_b?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.ltac_voltage_ry?.toFixed(0) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.ltac_voltage_yb?.toFixed(0) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.ltac_voltage_rb?.toFixed(0) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_kw?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_kva?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_kvar?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_kwh?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_kvah?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_kvarh?.toFixed(1) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.ltac_oil_temperature?.toFixed(0) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center text-[6px]">
                      {log?.ltac_grid_fail_time || "-"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center text-[6px]">
                      {log?.ltac_grid_resume_time || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-center mt-2 text-gray-600">Page 4 of 6 | Swipe right for Generation Data →</p>
        </div>

        {/* PAGE 5: Generation Details - COMPLETE */}
        <div className="page-break p-4">
          <h3 className="font-bold text-base mb-2 border-b-2 border-gray-400 pb-1">
            Generation Details - Hours 00:00 to 23:00 - COMPLETE DATA
          </h3>
          <table className="w-full compact-table border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1">Hr</th>
                <th className="border border-gray-400 p-1">✓</th>
                <th className="border border-gray-400 p-1">
                  Total
                  <br />
                  Gen
                </th>
                <th className="border border-gray-400 p-1">
                  X'MER
                  <br />
                  Exp
                </th>
                <th className="border border-gray-400 p-1">
                  AUX
                  <br />
                  Cons
                </th>
                <th className="border border-gray-400 p-1">
                  Main
                  <br />
                  Exp
                </th>
                <th className="border border-gray-400 p-1">
                  Chk
                  <br />
                  Exp
                </th>
                <th className="border border-gray-400 p-1">
                  Main
                  <br />
                  Imp
                </th>
                <th className="border border-gray-400 p-1">
                  Chk
                  <br />
                  Imp
                </th>
                <th className="border border-gray-400 p-1">
                  Stby
                  <br />
                  Exp
                </th>
                <th className="border border-gray-400 p-1">
                  Stby
                  <br />
                  Imp
                </th>
                <th className="border border-gray-400 p-1" style={{ minWidth: "80px" }}>
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {allHours.map((hour) => {
                const log = logsByHour.get(hour);
                const issue = getIssue(hour);
                return (
                  <tr key={hour} className={issue ? getSeverityColor(issue.severity) : ""}>
                    <td className="border border-gray-400 p-1 text-center font-bold">
                      {hour.toString().padStart(2, "0")}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">{log ? "✓" : "✗"}</td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.gen_total_generation?.toFixed(1) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.gen_xmer_export?.toFixed(1) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.gen_aux_consumption?.toFixed(1) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.gen_main_export?.toFixed(1) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.gen_check_export?.toFixed(1) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.gen_main_import?.toFixed(1) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.gen_check_import?.toFixed(1) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.gen_standby_export?.toFixed(1) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.gen_standby_import?.toFixed(1) || "0"}
                    </td>
                    <td
                      className="border border-gray-400 p-1 text-left text-[6px]"
                      style={{ maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {log?.remarks || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-center mt-2 text-gray-600">
            Page 5 of {logs.some((l) => l.remarks) ? "6" : "5"} |{" "}
            {logs.some((l) => l.remarks) ? "Swipe right for Detailed Remarks →" : "End of Report"}
          </p>
        </div>

        {/* PAGE 6: Remarks (if any) - EXPANDED */}
        {logs.some((l) => l.remarks) && (
          <div className="page-break p-8">
            <h3 className="font-bold text-xl mb-4 border-b-2 border-gray-400 pb-2">📝 Remarks & Observations</h3>
            <p className="text-sm text-gray-600 mb-4">Detailed remarks for each logged hour</p>
            <div className="space-y-3">
              {logs
                .filter((l) => l.remarks)
                .map((log) => (
                  <div key={log.hour} className="p-3 border border-gray-300 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-base">Hour {log.hour.toString().padStart(2, "0")}:00</strong>
                      <span className="text-xs text-gray-500">
                        Logged: {log.logged_at ? format(new Date(log.logged_at), "HH:mm") : "N/A"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">{log.remarks}</p>
                  </div>
                ))}
            </div>
            <p className="text-xs text-center mt-4 text-gray-600">Page 6 of 6 | End of Report</p>
          </div>
        )}

        {/* Footer on last page */}
        <div className="text-center text-xs text-gray-500 mt-8 border-t pt-4">
          <p>Generated by Gayatri Power Transformer Logging System</p>
          <p>
            Report Date: {format(new Date(date), "PPP")} | Generated: {format(new Date(), "PPP HH:mm")}
          </p>
          {userName && employeeId && (
            <p>
              Operator: {userName} (ID: {employeeId})
            </p>
          )}
        </div>
      </div>
    );
  },
);

TransformerPrintView.displayName = "TransformerPrintView";
