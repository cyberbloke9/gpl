import { forwardRef } from 'react';
import { Module1DataDisplay } from '@/components/checklist/reports/Module1DataDisplay';
import { Module2DataDisplay } from '@/components/checklist/reports/Module2DataDisplay';
import { Module3DataDisplay } from '@/components/checklist/reports/Module3DataDisplay';
import { Module4DataDisplay } from '@/components/checklist/reports/Module4DataDisplay';
import { format } from 'date-fns';

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
          <p className="text-center text-sm text-gray-600">
            Generated on {format(new Date(), 'PPpp')}
          </p>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-100 rounded">
          <div>
            <p className="text-sm font-semibold text-gray-600">Date</p>
            <p className="text-lg">{format(new Date(checklist.date), 'MMMM d, yyyy')}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Shift</p>
            <p className="text-lg">{checklist.shift || 'Not specified'}</p>
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
            <p className="text-lg">
              {checklist.start_time ? format(new Date(checklist.start_time), 'p') : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Completion Time</p>
            <p className="text-lg">
              {checklist.completion_time ? format(new Date(checklist.completion_time), 'p') : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Status</p>
            <p className="text-lg font-semibold text-green-600">
              {checklist.submitted ? 'Submitted' : checklist.status || 'In Progress'}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Problems Detected</p>
            <p className={`text-lg font-semibold ${checklist.problem_count > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {checklist.problem_count || 0}
            </p>
          </div>
        </div>

        {/* Flagged Issues Section */}
        {checklist.problem_count > 0 && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded">
            <h2 className="text-xl font-bold text-red-800 mb-2">⚠️ Flagged Issues</h2>
            <p className="text-red-700">
              {checklist.problem_count} issue(s) detected during inspection. Review module details below.
            </p>
          </div>
        )}

        {/* Module 1 */}
        <div className="mb-8 page-break-inside-avoid">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-2 mb-4">Module 1: Fire Protection</h2>
          <Module1DataDisplay data={checklist.module1_data || {}} flaggedIssues={flaggedIssues} />
        </div>

        {/* Module 2 */}
        <div className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-2 mb-4">Module 2: Equipment Inspection</h2>
          <Module2DataDisplay data={checklist.module2_data || {}} flaggedIssues={flaggedIssues} />
        </div>

        {/* Module 3 */}
        <div className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-2 mb-4">Module 3: Safety & Operations</h2>
          <Module3DataDisplay data={checklist.module3_data || {}} flaggedIssues={flaggedIssues} />
        </div>

        {/* Module 4 */}
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
              .page-break-before {
                page-break-before: always;
              }
              .page-break-inside-avoid {
                page-break-inside: avoid;
              }
            }
          `}
        </style>
      </div>
    );
  }
);

ChecklistPrintView.displayName = 'ChecklistPrintView';