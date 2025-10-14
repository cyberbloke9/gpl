import { forwardRef } from "react";
import { Module1DataDisplay } from "@/components/checklist/reports/Module1DataDisplay";
import { Module2DataDisplay } from "@/components/checklist/reports/Module2DataDisplay";
import { Module3DataDisplay } from "@/components/checklist/reports/Module3DataDisplay";
import { Module4DataDisplay } from "@/components/checklist/reports/Module4DataDisplay";
import { format } from "date-fns";

interface ChecklistPrintViewProps {
  checklist: any;
  userName?: string;
  employeeId?: string;
  flaggedIssues?: Map<string, any>;
}

export const ChecklistPrintView = forwardRef<HTMLDivElement, ChecklistPrintViewProps>(
  ({ checklist, userName, employeeId, flaggedIssues }, ref) => {
    if (!checklist) return null;

    return (
      <div ref={ref} className="p-8 bg-white text-black">
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">Daily Checklist Inspection Report</h1>
          <p className="text-center text-sm text-gray-600">Generated on {format(new Date(), "PPpp")}</p>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-100 rounded">
          <div>
            <p className="text-sm font-semibold text-gray-600">Date</p>
            <p className="text-lg">{format(new Date(checklist.date), "MMMM d, yyyy")}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Shift</p>
            <p className="text-lg">{checklist.shift || "Not specified"}</p>
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
            <p className="text-sm font-semibold text-gray-600">Start Time</p>
            <p className="text-lg">{checklist.start_time ? format(new Date(checklist.start_time), "p") : "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Completion Time</p>
            <p className="text-lg">
              {checklist.completion_time ? format(new Date(checklist.completion_time), "p") : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Status</p>
            <p className="text-lg font-semibold text-green-600">
              {checklist.submitted ? "Submitted" : checklist.status || "In Progress"}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Problems Detected</p>
            <p className={`text-lg font-semibold ${checklist.problem_count > 0 ? "text-red-600" : "text-green-600"}`}>
              {checklist.problem_count || 0}
            </p>
          </div>
        </div>

        {/* Severity Legend */}
        {checklist.flagged_issues_count > 0 && (
          <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-500 rounded">
            <h2 className="text-xl font-bold text-orange-800 mb-3">⚠️ Flagged Issues Severity Legend</h2>
            <div className="flex gap-4 text-sm">
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

        {/* Module 1 - CORRECTED TITLE */}
        <div className="mb-8 page-break-inside-avoid">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-2 mb-4">
            Module 1: Turbine, OPU & Cooling System
          </h2>
          <Module1DataDisplay data={checklist.module1_data || {}} flaggedIssues={flaggedIssues} />
        </div>

        {/* Module 2 - CORRECTED TITLE */}
        <div className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-2 mb-4">Module 2: Generator</h2>
          <Module2DataDisplay data={checklist.module2_data || {}} flaggedIssues={flaggedIssues} />
        </div>

        {/* Module 3 - CORRECTED TITLE */}
        <div className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-2 mb-4">Module 3: De-watering Sump</h2>
          <Module3DataDisplay data={checklist.module3_data || {}} flaggedIssues={flaggedIssues} />
        </div>

        {/* Module 4 - Already Correct */}
        <div className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-2 mb-4">Module 4: Electrical Systems</h2>
          <Module4DataDisplay data={checklist.module4_data || {}} flaggedIssues={flaggedIssues} />
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p>This is an official checklist inspection report.</p>
          <p>Document ID: {checklist.id}</p>
        </div>

        <style>
          {`
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }

              /* Severity Legend Colors */
              .bg-red-100 { background-color: #fee2e2 !important; }
              .text-red-900 { color: #7f1d1d !important; }
              .border-red-500 { border-color: #ef4444 !important; }
              
              .bg-orange-100 { background-color: #ffedd5 !important; }
              .text-orange-900 { color: #7c2d12 !important; }
              .border-orange-500 { border-color: #f97316 !important; }
              
              .bg-yellow-100 { background-color: #fef3c7 !important; }
              .text-yellow-900 { color: #78350f !important; }
              .border-yellow-500 { border-color: #eab308 !important; }
              
              .bg-yellow-50 { background-color: #fefce8 !important; }
              .text-yellow-800 { color: #854d0e !important; }
              .border-yellow-300 { border-color: #fde047 !important; }
              
              .bg-orange-50 { background-color: #fff7ed !important; }
              .text-orange-800 { color: #9a3412 !important; }
              
              /* Gray colors for summary section */
              .bg-gray-100 { background-color: #f3f4f6 !important; }
              .text-gray-600 { color: #4b5563 !important; }
              .border-gray-300 { border-color: #d1d5db !important; }
              .border-gray-800 { border-color: #1f2937 !important; }
              
              /* Status colors */
              .bg-green-100 { background-color: #dcfce7 !important; }
              .text-green-600 { color: #16a34a !important; }
              .text-green-800 { color: #166534 !important; }
              .border-green-200 { border-color: #bbf7d0 !important; }
              
              /* Ensure borders render */
              .border-2 { border-width: 2px !important; }
              .border { border-width: 1px !important; }

              .page-break-before {
                page-break-before: always;
              }
              .page-break-inside-avoid {
                page-break-inside: avoid;
              }
            }
            
            @page {
              size: A4;
              margin: 15mm;
            }
          `}
        </style>
      </div>
    );
  },
);

ChecklistPrintView.displayName = "ChecklistPrintView";
