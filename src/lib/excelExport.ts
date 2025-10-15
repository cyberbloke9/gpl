import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const exportChecklistsToExcel = (data: any[], startDate: string, endDate: string) => {
  const workbook = XLSX.utils.book_new();
  
  // Summary Sheet
  const summaryData = [
    ['Checklists Report'],
    ['Period:', `${format(new Date(startDate), 'PPP')} - ${format(new Date(endDate), 'PPP')}`],
    ['Total Records:', data.length],
    [''],
    ['Statistics:'],
    ['Total Submitted:', data.filter(d => d.submitted).length],
    ['Total In Progress:', data.filter(d => !d.submitted).length],
    ['Average Completion:', `${(data.reduce((acc, d) => acc + (d.completion_percentage || 0), 0) / data.length).toFixed(2)}%`],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Checklist Data Sheet
  const checklistData = data.map(item => ({
    'Date': format(new Date(item.date), 'yyyy-MM-dd'),
    'User Name': item.user_name || 'N/A',
    'Employee ID': item.employee_id || 'N/A',
    'Shift': item.shift || 'N/A',
    'Status': item.status || 'in_progress',
    'Completion %': item.completion_percentage || 0,
    'Problem Count': item.problem_count || 0,
    'Flagged Issues': item.flagged_issues_count || 0,
    'Submitted': item.submitted ? 'Yes' : 'No',
    'Submission Time': item.submitted_at ? format(new Date(item.submitted_at), 'PPp') : 'N/A',
  }));
  
  const checklistSheet = XLSX.utils.json_to_sheet(checklistData);
  XLSX.utils.book_append_sheet(workbook, checklistSheet, 'Checklist Data');
  
  XLSX.writeFile(workbook, `Checklists_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const exportTransformerLogsToExcel = (data: any[], startDate: string, endDate: string) => {
  const workbook = XLSX.utils.book_new();
  
  const ptLogs = data.filter(log => log.transformer_number === 1);
  const atLogs = data.filter(log => log.transformer_number === 2);
  
  // PT Summary
  const ptSummary = [
    ['Power Transformer (PT) Summary'],
    ['Period:', `${format(new Date(startDate), 'PPP')} - ${format(new Date(endDate), 'PPP')}`],
    ['Total Records:', ptLogs.length],
  ];
  const ptSummarySheet = XLSX.utils.aoa_to_sheet(ptSummary);
  XLSX.utils.book_append_sheet(workbook, ptSummarySheet, 'PT Summary');
  
  // PT Hourly Data
  const ptData = ptLogs.map(log => ({
    'Date': format(new Date(log.date), 'yyyy-MM-dd'),
    'Hour': log.hour,
    'User': log.user_name || 'N/A',
    'Employee ID': log.employee_id || 'N/A',
    'Voltage R-Y': log.voltage_ry,
    'Voltage Y-B': log.voltage_yb,
    'Voltage B-R': log.voltage_rb,
    'Current R': log.current_r,
    'Current Y': log.current_y,
    'Current B': log.current_b,
    'Active Power': log.active_power,
    'Reactive Power': log.reactive_power,
    'KVA': log.kva,
    'Frequency': log.frequency,
    'Oil Temp': log.oil_temperature,
    'Winding Temp': log.winding_temperature,
    'Tap Position': log.tap_position,
    'Remarks': log.remarks || '',
  }));
  const ptDataSheet = XLSX.utils.json_to_sheet(ptData);
  XLSX.utils.book_append_sheet(workbook, ptDataSheet, 'PT Hourly Data');
  
  // AT Summary
  const atSummary = [
    ['Auxiliary Transformer (AT) Summary'],
    ['Period:', `${format(new Date(startDate), 'PPP')} - ${format(new Date(endDate), 'PPP')}`],
    ['Total Records:', atLogs.length],
  ];
  const atSummarySheet = XLSX.utils.aoa_to_sheet(atSummary);
  XLSX.utils.book_append_sheet(workbook, atSummarySheet, 'AT Summary');
  
  // AT Hourly Data
  const atData = atLogs.map(log => ({
    'Date': format(new Date(log.date), 'yyyy-MM-dd'),
    'Hour': log.hour,
    'User': log.user_name || 'N/A',
    'Employee ID': log.employee_id || 'N/A',
    'Voltage R-Y': log.voltage_ry,
    'Voltage Y-B': log.voltage_yb,
    'Voltage B-R': log.voltage_rb,
    'Current R': log.current_r,
    'Current Y': log.current_y,
    'Current B': log.current_b,
    'Active Power': log.active_power,
    'Reactive Power': log.reactive_power,
    'KVA': log.kva,
    'Frequency': log.frequency,
    'Oil Temp': log.oil_temperature,
    'Winding Temp': log.winding_temperature,
    'Tap Position': log.tap_position,
    'Remarks': log.remarks || '',
  }));
  const atDataSheet = XLSX.utils.json_to_sheet(atData);
  XLSX.utils.book_append_sheet(workbook, atDataSheet, 'AT Hourly Data');
  
  XLSX.writeFile(workbook, `Transformer_Logs_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const exportGeneratorLogsToExcel = (data: any[], startDate: string, endDate: string) => {
  const workbook = XLSX.utils.book_new();
  
  // Summary Sheet
  const summaryData = [
    ['Generator Logs Report'],
    ['Period:', `${format(new Date(startDate), 'PPP')} - ${format(new Date(endDate), 'PPP')}`],
    ['Total Records:', data.length],
    ['Total Hours Logged:', data.length],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Hourly Data Sheet
  const hourlyData = data.map(log => ({
    'Date': format(new Date(log.date), 'yyyy-MM-dd'),
    'Hour': log.hour,
    'User': log.user_name || 'N/A',
    'Employee ID': log.employee_id || 'N/A',
    'Gen Current R': log.gen_current_r,
    'Gen Current Y': log.gen_current_y,
    'Gen Current B': log.gen_current_b,
    'Gen Voltage RY': log.gen_voltage_ry,
    'Gen Voltage YB': log.gen_voltage_yb,
    'Gen Voltage BR': log.gen_voltage_br,
    'Gen KW': log.gen_kw,
    'Gen KVAR': log.gen_kvar,
    'Gen KVA': log.gen_kva,
    'Gen Frequency': log.gen_frequency,
    'Gen PF': log.gen_power_factor,
    'Gen RPM': log.gen_rpm,
    'Winding Temp R1': log.winding_temp_r1,
    'Winding Temp R2': log.winding_temp_r2,
    'Winding Temp Y1': log.winding_temp_y1,
    'Winding Temp Y2': log.winding_temp_y2,
    'Winding Temp B1': log.winding_temp_b1,
    'Winding Temp B2': log.winding_temp_b2,
    'AVR Field Current': log.avr_field_current,
    'AVR Field Voltage': log.avr_field_voltage,
    'Remarks': log.remarks || '',
  }));
  const hourlySheet = XLSX.utils.json_to_sheet(hourlyData);
  XLSX.utils.book_append_sheet(workbook, hourlySheet, 'Hourly Data');
  
  XLSX.writeFile(workbook, `Generator_Logs_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const exportIssuesToExcel = (data: any[], startDate: string, endDate: string) => {
  const workbook = XLSX.utils.book_new();
  
  const issuesData = data.map(issue => ({
    'Issue ID': issue.id,
    'Date': format(new Date(issue.reported_at), 'yyyy-MM-dd'),
    'Time': format(new Date(issue.reported_at), 'HH:mm'),
    'User': issue.user_name || 'N/A',
    'Employee ID': issue.employee_id || 'N/A',
    'Module': issue.module,
    'Section': issue.section,
    'Item': issue.item,
    'Issue Code': issue.issue_code,
    'Severity': issue.severity,
    'Status': issue.status,
    'Description': issue.description,
    'Resolution Notes': issue.resolution_notes || 'N/A',
    'Assigned To': issue.assigned_to || 'N/A',
    'Resolved At': issue.resolved_at ? format(new Date(issue.resolved_at), 'PPp') : 'N/A',
  }));
  
  const issuesSheet = XLSX.utils.json_to_sheet(issuesData);
  XLSX.utils.book_append_sheet(workbook, issuesSheet, 'Flagged Issues');
  
  XLSX.writeFile(workbook, `Flagged_Issues_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
