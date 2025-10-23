import { forwardRef } from "react";
import { format } from "date-fns";
import logo from "@/assets/logo.png";

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

    return (
      <div ref={ref} className="bg-white text-black" style={{ width: "210mm" }}>
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
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
            font-size: 8px;
            line-height: 1.3;
          }
          .compact-table th,
          .compact-table td {
            padding: 3px 2px;
            white-space: nowrap;
          }
          .status-icon {
            font-size: 10px;
          }
        `}</style>

        {/* PAGE 1: Cover & Table of Contents */}
        <div className="p-8">
          <div className="text-center mb-8 border-b-2 border-black pb-4 relative">
            <img 
              src={logo} 
              alt="Company Logo" 
              className="absolute top-0 right-0 w-20 h-20 object-contain"
            />
            <h1 className="text-3xl font-bold">GAYATRI POWER PRIVATE LIMITED</h1>
            <h2 className="text-2xl mt-3">UNIFIED TRANSFORMER LOG SHEET</h2>
            <p className="text-base mt-2">Date: {format(new Date(date), "PPP")}</p>
            <p className="text-sm mt-1">Generated: {format(new Date(), "PPP HH:mm")}</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
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

          <div className="mb-8 p-6 border-2 border-gray-300">
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

          <div className="mb-8">
            <h3 className="font-bold text-xl mb-4 border-b border-gray-400 pb-2">📑 Table of Contents</h3>
            <div className="space-y-2 text-sm pl-4">
              <p>
                <strong>Page 1:</strong> Cover & Summary
              </p>
              <p>
                <strong>Pages 2-5:</strong> PTR Feeder Data (Complete - 4 sections)
              </p>
              <p className="pl-4 text-xs text-gray-600">
                • Page 2: Electrical Parameters (Voltage, Current, Power)
                <br />
                • Page 3: Energy & Power Factor (MWH, MVARH, MVAH, Cos φ)
                <br />
                • Page 4: Temperature & Status (Oil, Winding, Level, Tap)
                <br />• Page 5: Additional Parameters (Tap Counter, Silica Gel)
              </p>
              <p>
                <strong>Pages 6-8:</strong> LTAC Feeder Data (Complete - 3 sections)
              </p>
              <p className="pl-4 text-xs text-gray-600">
                • Page 6: Electrical Parameters (Voltage, Current, Power)
                <br />
                • Page 7: Energy Readings (KWH, KVAH, KVARH)
                <br />• Page 8: Grid Status (Temp, Fail Time, Resume, Interruption)
              </p>
              <p>
                <strong>Pages 9-10:</strong> Generation Details (Complete)
              </p>
              {logs.some((l) => l.remarks) && (
                <p>
                  <strong>Page 11:</strong> Detailed Remarks
                </p>
              )}
            </div>
          </div>

          {flaggedIssues.length > 0 && (
            <div className="p-4 border border-gray-300 text-sm">
              <strong className="block mb-2">⚠️ Severity Legend:</strong>
              <div className="flex gap-4">
                <span className="bg-red-100 px-3 py-1 border border-red-300">🔴 Critical</span>
                <span className="bg-yellow-100 px-3 py-1 border border-yellow-300">🟡 Warning</span>
                <span className="bg-blue-100 px-3 py-1 border border-blue-300">🔵 Info</span>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded text-xs">
            <h4 className="font-bold mb-2">📱 Mobile Viewing Guide:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Swipe left/right to navigate pages</li>
              <li>Each section split for easy viewing</li>
              <li>All fields from web viewer included</li>
              <li>Total {logs.some((l) => l.remarks) ? "11" : "10"} pages</li>
            </ul>
          </div>
        </div>

        {/* PAGE 2: PTR - Electrical Parameters Part 1 */}
        <div className="page-break p-6">
          <h3 className="font-bold text-base mb-3 border-b-2 border-gray-400 pb-2">
            PTR Feeder - Part 1: Electrical Parameters (All 24 Hours)
          </h3>
          <table className="w-full compact-table border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1">Hour</th>
                <th className="border border-gray-400 p-1">✓</th>
                <th className="border border-gray-400 p-1">Freq (Hz)</th>
                <th className="border border-gray-400 p-1">V-RY (V)</th>
                <th className="border border-gray-400 p-1">V-YB (V)</th>
                <th className="border border-gray-400 p-1">V-RB (V)</th>
                <th className="border border-gray-400 p-1">I-R (A)</th>
                <th className="border border-gray-400 p-1">I-Y (A)</th>
                <th className="border border-gray-400 p-1">I-B (A)</th>
                <th className="border border-gray-400 p-1">kW</th>
                <th className="border border-gray-400 p-1">kVAR</th>
                <th className="border border-gray-400 p-1">kVA</th>
              </tr>
            </thead>
            <tbody>
              {allHours.map((hour) => {
                const log = logsByHour.get(hour);
                const issue = getIssue(hour);
                return (
                  <tr key={hour} className={issue ? getSeverityColor(issue.severity) : ""}>
                    <td className="border border-gray-400 p-1 text-center font-bold">
                      {hour.toString().padStart(2, "0")}:00
                    </td>
                    <td className="border border-gray-400 p-1 text-center status-icon">{log ? "✓" : "✗"}</td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-center mt-3 text-gray-600">
            Page 2 of {logs.some((l) => l.remarks) ? "11" : "10"} | PTR Part 1/4
          </p>
        </div>

        {/* PAGE 3: PTR - Energy & Power Factor */}
        <div className="page-break p-6">
          <h3 className="font-bold text-base mb-3 border-b-2 border-gray-400 pb-2">
            PTR Feeder - Part 2: Energy & Power Factor (All 24 Hours)
          </h3>
          <table className="w-full compact-table border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1">Hour</th>
                <th className="border border-gray-400 p-1">✓</th>
                <th className="border border-gray-400 p-1">MWH</th>
                <th className="border border-gray-400 p-1">MVARH</th>
                <th className="border border-gray-400 p-1">MVAH</th>
                <th className="border border-gray-400 p-1">Cos φ</th>
              </tr>
            </thead>
            <tbody>
              {allHours.map((hour) => {
                const log = logsByHour.get(hour);
                const issue = getIssue(hour);
                return (
                  <tr key={hour} className={issue ? getSeverityColor(issue.severity) : ""}>
                    <td className="border border-gray-400 p-1 text-center font-bold">
                      {hour.toString().padStart(2, "0")}:00
                    </td>
                    <td className="border border-gray-400 p-1 text-center status-icon">{log ? "✓" : "✗"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.mwh?.toFixed(2) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.mvarh?.toFixed(2) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.mvah?.toFixed(2) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.cos_phi?.toFixed(3) || "0"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-center mt-3 text-gray-600">
            Page 3 of {logs.some((l) => l.remarks) ? "11" : "10"} | PTR Part 2/4
          </p>
        </div>

        {/* PAGE 4: PTR - Temperature & Status */}
        <div className="page-break p-6">
          <h3 className="font-bold text-base mb-3 border-b-2 border-gray-400 pb-2">
            PTR Feeder - Part 3: Temperature & Status (All 24 Hours)
          </h3>
          <table className="w-full compact-table border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1">Hour</th>
                <th className="border border-gray-400 p-1">✓</th>
                <th className="border border-gray-400 p-1">Oil Temp (°C)</th>
                <th className="border border-gray-400 p-1">Winding Temp (°C)</th>
                <th className="border border-gray-400 p-1">Oil Level</th>
                <th className="border border-gray-400 p-1">Tap Position</th>
              </tr>
            </thead>
            <tbody>
              {allHours.map((hour) => {
                const log = logsByHour.get(hour);
                const issue = getIssue(hour);
                return (
                  <tr key={hour} className={issue ? getSeverityColor(issue.severity) : ""}>
                    <td className="border border-gray-400 p-1 text-center font-bold">
                      {hour.toString().padStart(2, "0")}:00
                    </td>
                    <td className="border border-gray-400 p-1 text-center status-icon">{log ? "✓" : "✗"}</td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.oil_temperature?.toFixed(1) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.winding_temperature?.toFixed(1) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">{log?.oil_level || "-"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.tap_position || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-center mt-3 text-gray-600">
            Page 4 of {logs.some((l) => l.remarks) ? "11" : "10"} | PTR Part 3/4
          </p>
        </div>

        {/* PAGE 5: PTR - Tap Counter & Silica Gel */}
        <div className="page-break p-6">
          <h3 className="font-bold text-base mb-3 border-b-2 border-gray-400 pb-2">
            PTR Feeder - Part 4: Tap Counter & Silica Gel Color (All 24 Hours)
          </h3>
          <table className="w-full compact-table border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1">Hour</th>
                <th className="border border-gray-400 p-1">✓</th>
                <th className="border border-gray-400 p-1">Tap Counter</th>
                <th className="border border-gray-400 p-1">Silica Gel Colour</th>
              </tr>
            </thead>
            <tbody>
              {allHours.map((hour) => {
                const log = logsByHour.get(hour);
                const issue = getIssue(hour);
                return (
                  <tr key={hour} className={issue ? getSeverityColor(issue.severity) : ""}>
                    <td className="border border-gray-400 p-1 text-center font-bold">
                      {hour.toString().padStart(2, "0")}:00
                    </td>
                    <td className="border border-gray-400 p-1 text-center status-icon">{log ? "✓" : "✗"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.tap_counter || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.silica_gel_colour || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-center mt-3 text-gray-600">
            Page 5 of {logs.some((l) => l.remarks) ? "11" : "10"} | PTR Part 4/4 Complete ✓
          </p>
        </div>

        {/* PAGE 6: LTAC - Electrical Parameters */}
        <div className="page-break p-6">
          <h3 className="font-bold text-base mb-3 border-b-2 border-gray-400 pb-2">
            LTAC Feeder - Part 1: Electrical Parameters (All 24 Hours)
          </h3>
          <table className="w-full compact-table border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1">Hour</th>
                <th className="border border-gray-400 p-1">✓</th>
                <th className="border border-gray-400 p-1">I-R (A)</th>
                <th className="border border-gray-400 p-1">I-Y (A)</th>
                <th className="border border-gray-400 p-1">I-B (A)</th>
                <th className="border border-gray-400 p-1">V-RY (V)</th>
                <th className="border border-gray-400 p-1">V-YB (V)</th>
                <th className="border border-gray-400 p-1">V-RB (V)</th>
                <th className="border border-gray-400 p-1">kW</th>
                <th className="border border-gray-400 p-1">kVA</th>
                <th className="border border-gray-400 p-1">kVAR</th>
              </tr>
            </thead>
            <tbody>
              {allHours.map((hour) => {
                const log = logsByHour.get(hour);
                const issue = getIssue(hour);
                return (
                  <tr key={hour} className={issue ? getSeverityColor(issue.severity) : ""}>
                    <td className="border border-gray-400 p-1 text-center font-bold">
                      {hour.toString().padStart(2, "0")}:00
                    </td>
                    <td className="border border-gray-400 p-1 text-center status-icon">{log ? "✓" : "✗"}</td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-center mt-3 text-gray-600">
            Page 6 of {logs.some((l) => l.remarks) ? "11" : "10"} | LTAC Part 1/3
          </p>
        </div>

        {/* PAGE 7: LTAC - Energy Readings */}
        <div className="page-break p-6">
          <h3 className="font-bold text-base mb-3 border-b-2 border-gray-400 pb-2">
            LTAC Feeder - Part 2: Energy Readings (All 24 Hours)
          </h3>
          <table className="w-full compact-table border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1">Hour</th>
                <th className="border border-gray-400 p-1">✓</th>
                <th className="border border-gray-400 p-1">KWH</th>
                <th className="border border-gray-400 p-1">KVAH</th>
                <th className="border border-gray-400 p-1">KVARH</th>
              </tr>
            </thead>
            <tbody>
              {allHours.map((hour) => {
                const log = logsByHour.get(hour);
                const issue = getIssue(hour);
                return (
                  <tr key={hour} className={issue ? getSeverityColor(issue.severity) : ""}>
                    <td className="border border-gray-400 p-1 text-center font-bold">
                      {hour.toString().padStart(2, "0")}:00
                    </td>
                    <td className="border border-gray-400 p-1 text-center status-icon">{log ? "✓" : "✗"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_kwh?.toFixed(2) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_kvah?.toFixed(2) || "0"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_kvarh?.toFixed(2) || "0"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-center mt-3 text-gray-600">
            Page 7 of {logs.some((l) => l.remarks) ? "11" : "10"} | LTAC Part 2/3
          </p>
        </div>

        {/* PAGE 8: LTAC - Grid Status & Temperature */}
        <div className="page-break p-6">
          <h3 className="font-bold text-base mb-3 border-b-2 border-gray-400 pb-2">
            LTAC Feeder - Part 3: Grid Status & Temperature (All 24 Hours)
          </h3>
          <table className="w-full compact-table border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1">Hour</th>
                <th className="border border-gray-400 p-1">✓</th>
                <th className="border border-gray-400 p-1">Oil Temp (°C)</th>
                <th className="border border-gray-400 p-1">Grid Fail Time</th>
                <th className="border border-gray-400 p-1">Grid Resume Time</th>
                <th className="border border-gray-400 p-1">Supply Interruption</th>
              </tr>
            </thead>
            <tbody>
              {allHours.map((hour) => {
                const log = logsByHour.get(hour);
                const issue = getIssue(hour);
                return (
                  <tr key={hour} className={issue ? getSeverityColor(issue.severity) : ""}>
                    <td className="border border-gray-400 p-1 text-center font-bold">
                      {hour.toString().padStart(2, "0")}:00
                    </td>
                    <td className="border border-gray-400 p-1 text-center status-icon">{log ? "✓" : "✗"}</td>
                    <td className="border border-gray-400 p-1 text-center">
                      {log?.ltac_oil_temperature?.toFixed(1) || "0"}
                    </td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_grid_fail_time || "-"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_grid_resume_time || "-"}</td>
                    <td className="border border-gray-400 p-1 text-center">{log?.ltac_supply_interruption || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-center mt-3 text-gray-600">
            Page 8 of {logs.some((l) => l.remarks) ? "11" : "10"} | LTAC Part 3/3 Complete ✓
          </p>
        </div>

        {/* PAGE 9: Generation - Part 1 */}
        <div className="page-break p-6">
          <h3 className="font-bold text-base mb-3 border-b-2 border-gray-400 pb-2">
            Generation Details - Part 1: Generation & Export (All 24 Hours)
          </h3>
          <table className="w-full compact-table border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1">Hour</th>
                <th className="border border-gray-400 p-1">✓</th>
                <th className="border border-gray-400 p-1">Total Generation</th>
                <th className="border border-gray-400 p-1">X'MER Export</th>
                <th className="border border-gray-400 p-1">AUX Consumption</th>
                <th className="border border-gray-400 p-1">Main Export</th>
                <th className="border border-gray-400 p-1">Check Export</th>
              </tr>
            </thead>
            <tbody>
              {allHours.map((hour) => {
                const log = logsByHour.get(hour);
                const issue = getIssue(hour);
                return (
                  <tr key={hour} className={issue ? getSeverityColor(issue.severity) : ""}>
                    <td className="border border-gray-400 p-1 text-center font-bold">
                      {hour.toString().padStart(2, "0")}:00
                    </td>
                    <td className="border border-gray-400 p-1 text-center status-icon">{log ? "✓" : "✗"}</td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-center mt-3 text-gray-600">
            Page 9 of {logs.some((l) => l.remarks) ? "11" : "10"} | Generation Part 1/2
          </p>
        </div>

        {/* PAGE 10: Generation - Part 2 & Remarks */}
        <div className="page-break p-6">
          <h3 className="font-bold text-base mb-3 border-b-2 border-gray-400 pb-2">
            Generation Details - Part 2: Import, Standby & Remarks (All 24 Hours)
          </h3>
          <table className="w-full compact-table border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1">Hour</th>
                <th className="border border-gray-400 p-1">✓</th>
                <th className="border border-gray-400 p-1">Main Import</th>
                <th className="border border-gray-400 p-1">Check Import</th>
                <th className="border border-gray-400 p-1">Standby Export</th>
                <th className="border border-gray-400 p-1">Standby Import</th>
                <th className="border border-gray-400 p-1" style={{ minWidth: "100px" }}>
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
                      {hour.toString().padStart(2, "0")}:00
                    </td>
                    <td className="border border-gray-400 p-1 text-center status-icon">{log ? "✓" : "✗"}</td>
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
                      className="border border-gray-400 p-1 text-left"
                      style={{ fontSize: "7px", maxWidth: "100px", wordWrap: "break-word" }}
                    >
                      {log?.remarks
                        ? log.remarks.length > 30
                          ? log.remarks.substring(0, 30) + "..."
                          : log.remarks
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-center mt-3 text-gray-600">
            Page 10 of {logs.some((l) => l.remarks) ? "11" : "10"} | Generation Part 2/2 Complete ✓
          </p>
        </div>

        {/* PAGE 11: Detailed Remarks (if any) */}
        {logs.some((l) => l.remarks) && (
          <div className="page-break p-8">
            <h3 className="font-bold text-xl mb-4 border-b-2 border-gray-400 pb-2">
              📝 Detailed Remarks & Observations
            </h3>
            <p className="text-sm text-gray-600 mb-4">Complete remarks for each logged hour</p>
            <div className="space-y-3">
              {logs
                .filter((l) => l.remarks)
                .map((log) => (
                  <div key={log.hour} className="p-3 border border-gray-300 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-base">Hour {log.hour.toString().padStart(2, "0")}:00</strong>
                      <span className="text-xs text-gray-500">
                        {log.logged_at ? format(new Date(log.logged_at), "HH:mm") : "N/A"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">{log.remarks}</p>
                  </div>
                ))}
            </div>
            <p className="text-xs text-center mt-4 text-gray-600">Page 11 of 11 | End of Report</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-4 pt-4 border-t">
          <p>Gayatri Power Transformer Logging System</p>
          <p>
            Report: {format(new Date(date), "PPP")} | Generated: {format(new Date(), "PPP HH:mm")}
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
