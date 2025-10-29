import * as XLSX from 'xlsx';
import { formatIST } from '@/lib/timezone-utils';
import { format } from 'date-fns';

// Helper function to group logs by date
const groupByDate = (logs: any[]) => {
  return logs.reduce((acc, log) => {
    const date = format(new Date(log.date), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, any[]>);
};

// Helper to safely get nested values
const getValue = (obj: any, path: string, defaultValue: any = '') => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? defaultValue;
};

export const exportChecklistsToExcel = (data: any[], startDate: string, endDate: string) => {
  const workbook = XLSX.utils.book_new();
  
  // Summary Sheet
  const summaryData = [
    ['HYDRO ELECTRIC PLANT - CHECKLISTS REPORT'],
    ['Period:', `${format(new Date(startDate), 'PPP')} - ${format(new Date(endDate), 'PPP')}`],
    ['Generated:', format(new Date(), 'PPp')],
    [''],
    ['SUMMARY STATISTICS'],
    ['Total Checklists:', data.length],
    ['Submitted:', data.filter(d => d.submitted).length],
    ['In Progress:', data.filter(d => !d.submitted).length],
    ['Average Completion:', `${data.length > 0 ? (data.reduce((acc, d) => acc + (d.completion_percentage || 0), 0) / data.length).toFixed(2) : 0}%`],
    ['Total Problems:', data.reduce((acc, d) => acc + (d.problem_count || 0), 0)],
    ['Total Flagged Issues:', data.reduce((acc, d) => acc + (d.flagged_issues_count || 0), 0)],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Detailed Checklist Data
  data.forEach((checklist, idx) => {
    const sheetName = `${format(new Date(checklist.date), 'MMM-dd')}`;
    const sheetData: any[] = [
      ['DAILY INSPECTION CHECKLIST'],
      ['Date:', format(new Date(checklist.date), 'PPP')],
      ['Shift:', checklist.shift || 'N/A'],
      ['Operator:', checklist.user_name || 'N/A'],
      ['Employee ID:', checklist.employee_id || 'N/A'],
      ['Status:', checklist.submitted ? 'SUBMITTED' : 'IN PROGRESS'],
      ['Completion:', `${checklist.completion_percentage || 0}%`],
      [''],
    ];

    // MODULE 1: UNIT INSPECTION
    if (checklist.module1_data) {
      sheetData.push(['MODULE 1: UNIT INSPECTION'], ['']);
      
      // Unit 1
      sheetData.push(['UNIT 1 (1.5 MW)'], ['']);
      sheetData.push(['A. TURBINE VISUAL INSPECTION']);
      sheetData.push(['Parameter', 'Value']);
      sheetData.push(['Guide Bearing Oil Level', getValue(checklist.module1_data, 'unit1.turbine.guide_bearing', 'N/A')]);
      sheetData.push(['Union Leakage', getValue(checklist.module1_data, 'unit1.turbine.union_leakage', 'N/A')]);
      sheetData.push(['Servomotor Photo', getValue(checklist.module1_data, 'unit1.turbine.servomotor_photo') ? 'Uploaded' : 'Not uploaded']);
      sheetData.push(['']);
      
      sheetData.push(['B. OIL PRESSURE UNIT (OPU)']);
      sheetData.push(['Parameter', 'Value', 'Unit']);
      sheetData.push(['TOPU Pressure', getValue(checklist.module1_data, 'unit1.opu.pressure'), 'bar']);
      sheetData.push(['Oil Sump Level', getValue(checklist.module1_data, 'unit1.opu.oil_sump'), '%']);
      sheetData.push(['Oil Temperature', getValue(checklist.module1_data, 'unit1.opu.temperature'), '°C']);
      sheetData.push(['Pump Sound', getValue(checklist.module1_data, 'unit1.opu.pump_sound', 'N/A')]);
      sheetData.push(['Motor Condition', getValue(checklist.module1_data, 'unit1.opu.motor_condition', 'N/A')]);
      sheetData.push(['Leakage Remarks', getValue(checklist.module1_data, 'unit1.opu.leakage_remarks')]);
      sheetData.push(['']);
      
      sheetData.push(['C. GEARBOX UNIT']);
      sheetData.push(['Parameter', 'Value']);
      sheetData.push(['Upper Leakage', getValue(checklist.module1_data, 'unit1.gearbox.upper_leakage', 'N/A')]);
      sheetData.push(['Lower Leakage', getValue(checklist.module1_data, 'unit1.gearbox.lower_leakage', 'N/A')]);
      sheetData.push(['LOS Pressure Photo', getValue(checklist.module1_data, 'unit1.gearbox.los_pressure_photo') ? 'Uploaded' : 'Not uploaded']);
      sheetData.push(['']);
      
      sheetData.push(['D. COOLING SYSTEM']);
      sheetData.push(['Parameter', 'Value', 'Unit']);
      sheetData.push(['CW Pressure', getValue(checklist.module1_data, 'unit1.cooling.cw_pressure'), 'Bar']);
      sheetData.push(['Filter Condition', getValue(checklist.module1_data, 'unit1.cooling.filter_condition', 'N/A')]);
      sheetData.push(['Flow Indicators Photo', getValue(checklist.module1_data, 'unit1.cooling.flow_indicators_photo') ? 'Uploaded' : 'Not uploaded']);
      sheetData.push(['Filter Photo', getValue(checklist.module1_data, 'unit1.cooling.filter_photo') ? 'Uploaded' : 'Not uploaded']);
      sheetData.push(['']);

      // Unit 2
      sheetData.push(['UNIT 2 (0.7 MW)'], ['']);
      sheetData.push(['A. TURBINE VISUAL INSPECTION']);
      sheetData.push(['Parameter', 'Value']);
      sheetData.push(['Guide Bearing Oil Level', getValue(checklist.module1_data, 'unit2.turbine.guide_bearing', 'N/A')]);
      sheetData.push(['Union Leakage', getValue(checklist.module1_data, 'unit2.turbine.union_leakage', 'N/A')]);
      sheetData.push(['Servomotor Photo', getValue(checklist.module1_data, 'unit2.turbine.servomotor_photo') ? 'Uploaded' : 'Not uploaded']);
      sheetData.push(['']);
      
      sheetData.push(['B. OIL PRESSURE UNIT (OPU)']);
      sheetData.push(['Parameter', 'Value', 'Unit']);
      sheetData.push(['TOPU Pressure', getValue(checklist.module1_data, 'unit2.opu.pressure'), 'bar']);
      sheetData.push(['Oil Sump Level', getValue(checklist.module1_data, 'unit2.opu.oil_sump'), '%']);
      sheetData.push(['Oil Temperature', getValue(checklist.module1_data, 'unit2.opu.temperature'), '°C']);
      sheetData.push(['Pump Sound', getValue(checklist.module1_data, 'unit2.opu.pump_sound', 'N/A')]);
      sheetData.push(['Motor Condition', getValue(checklist.module1_data, 'unit2.opu.motor_condition', 'N/A')]);
      sheetData.push(['']);
      
      sheetData.push(['C. GEARBOX UNIT']);
      sheetData.push(['Parameter', 'Value']);
      sheetData.push(['Upper Leakage', getValue(checklist.module1_data, 'unit2.gearbox.upper_leakage', 'N/A')]);
      sheetData.push(['Lower Leakage', getValue(checklist.module1_data, 'unit2.gearbox.lower_leakage', 'N/A')]);
      sheetData.push(['']);
      
      sheetData.push(['D. COOLING SYSTEM']);
      sheetData.push(['Parameter', 'Value', 'Unit']);
      sheetData.push(['CW Pressure', getValue(checklist.module1_data, 'unit2.cooling.cw_pressure'), 'Bar']);
      sheetData.push(['Filter Condition', getValue(checklist.module1_data, 'unit2.cooling.filter_condition', 'N/A')]);
      sheetData.push(['']);
    }

    // MODULE 2: GENERATOR CHECKS
    if (checklist.module2_data) {
      sheetData.push(['MODULE 2: GENERATOR CHECKS'], ['']);
      
      ['unit1', 'unit2'].forEach((unit, unitIdx) => {
        const unitLabel = unitIdx === 0 ? 'UNIT 1 (1.5 MW)' : 'UNIT 2 (0.7 MW)';
        sheetData.push([unitLabel], ['']);
        
        sheetData.push(['DAILY CHECKS']);
        sheetData.push(['Parameter', 'Value']);
        sheetData.push(['Earthing Condition', getValue(checklist.module2_data, `${unit}.daily.earthing_condition`, 'N/A')]);
        sheetData.push(['Air Filter Condition', getValue(checklist.module2_data, `${unit}.daily.air_filter`, 'N/A')]);
        sheetData.push(['Abnormal Sound', getValue(checklist.module2_data, `${unit}.daily.abnormal_sound`, 'N/A')]);
        sheetData.push(['Vibration Level', getValue(checklist.module2_data, `${unit}.daily.vibration`, 'N/A')]);
        sheetData.push(['RTD Display Photo', getValue(checklist.module2_data, `${unit}.daily.rtd_display_photo`) ? 'Uploaded' : 'Not uploaded']);
        sheetData.push(['WRTI Reading (°C)', getValue(checklist.module2_data, `${unit}.daily.wrti_reading`)]);
        sheetData.push(['WRTI Photo', getValue(checklist.module2_data, `${unit}.daily.wrti_photo`) ? 'Uploaded' : 'Not uploaded']);
        sheetData.push(['']);
        
        sheetData.push(['15-DAY INTERVAL CHECKS']);
        sheetData.push(['Parameter', 'Value']);
        sheetData.push(['Slip Ring Condition', getValue(checklist.module2_data, `${unit}.interval.slip_ring`, 'N/A')]);
        sheetData.push(['Carbon Brush Condition', getValue(checklist.module2_data, `${unit}.interval.carbon_brush`, 'N/A')]);
        sheetData.push(['General Remarks', getValue(checklist.module2_data, `${unit}.interval.general_remarks`)]);
        sheetData.push(['']);
      });
    }

    // MODULE 3: DE-WATERING SUMP
    if (checklist.module3_data) {
      sheetData.push(['MODULE 3: DE-WATERING SUMP'], ['']);
      sheetData.push(['Parameter', 'Value']);
      sheetData.push(['Sump Level Photo', getValue(checklist.module3_data, 'sump_level_photo') ? 'Uploaded' : 'Not uploaded']);
      sheetData.push(['Sump Condition', getValue(checklist.module3_data, 'sump_condition', 'N/A')]);
      sheetData.push(['1 HP Motors Condition', getValue(checklist.module3_data, 'hp_motors_condition', 'N/A')]);
      sheetData.push(['']);
      
      sheetData.push(['GUIDE VANE SUMP - UNIT 1']);
      sheetData.push(['Water Level (cm)', getValue(checklist.module3_data, 'gv_sump_unit1_level')]);
      sheetData.push(['Photo', getValue(checklist.module3_data, 'gv_sump_unit1_photo') ? 'Uploaded' : 'Not uploaded']);
      sheetData.push(['']);
      
      sheetData.push(['GUIDE VANE SUMP - UNIT 2']);
      sheetData.push(['Water Level (cm)', getValue(checklist.module3_data, 'gv_sump_unit2_level')]);
      sheetData.push(['Photo', getValue(checklist.module3_data, 'gv_sump_unit2_photo') ? 'Uploaded' : 'Not uploaded']);
      sheetData.push(['']);
    }

    // MODULE 4: OD YARD & CONTROL ROOM
    if (checklist.module4_data) {
      sheetData.push(['MODULE 4: OD YARD & CONTROL ROOM'], ['']);
      
      if (checklist.module4_data.od_yard) {
        sheetData.push(['OD YARD SECTION'], ['']);
        sheetData.push(['Parameter', 'Value']);
        
        const odYard = checklist.module4_data.od_yard;
        if (odYard.switchyard) {
          sheetData.push(['SWITCHYARD']);
          sheetData.push(['Cable Tray Condition', getValue(odYard, 'switchyard.cable_tray', 'N/A')]);
          sheetData.push(['Isolator Condition', getValue(odYard, 'switchyard.isolator_condition', 'N/A')]);
          sheetData.push(['LA Condition', getValue(odYard, 'switchyard.la_condition', 'N/A')]);
          sheetData.push(['']);
        }
        
        if (odYard.transformer_yard) {
          sheetData.push(['TRANSFORMER YARD']);
          sheetData.push(['Breaker Condition', getValue(odYard, 'transformer_yard.breaker', 'N/A')]);
          sheetData.push(['Busbar Condition', getValue(odYard, 'transformer_yard.busbar', 'N/A')]);
          sheetData.push(['']);
        }
      }
      
      if (checklist.module4_data.control_room) {
        sheetData.push(['CONTROL ROOM SECTION'], ['']);
        sheetData.push(['Parameter', 'Value']);
        
        const controlRoom = checklist.module4_data.control_room;
        if (controlRoom.panels) {
          sheetData.push(['CONTROL PANELS']);
          sheetData.push(['Relay Panel Condition', getValue(controlRoom, 'panels.relay_panel', 'N/A')]);
          sheetData.push(['SCADA Status', getValue(controlRoom, 'panels.scada_status', 'N/A')]);
          sheetData.push(['']);
        }
      }
    }

    // Add flagged issues if present
    if (checklist.flagged_issues && checklist.flagged_issues.length > 0) {
      sheetData.push([''], ['FLAGGED ISSUES'], ['']);
      sheetData.push(['Module', 'Section', 'Item', 'Severity', 'Description', 'Status']);
      checklist.flagged_issues.forEach((issue: any) => {
        sheetData.push([
          issue.module || '',
          issue.section || '',
          issue.item || '',
          issue.severity || '',
          issue.description || '',
          issue.status || 'reported'
        ]);
      });
    }

    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName.substring(0, 31));
  });
  
  XLSX.writeFile(workbook, `Checklists_Detailed_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const exportTransformerLogsToExcel = (data: any[], startDate: string, endDate: string) => {
  const workbook = XLSX.utils.book_new();
  
  const ptLogs = data.filter(log => log.transformer_number === 1);
  const atLogs = data.filter(log => log.transformer_number === 2);
  
  // Group by date for daily sheets
  const ptByDate = groupByDate(ptLogs);
  const atByDate = groupByDate(atLogs);
  
  // Create daily sheets for PT
  Object.entries(ptByDate).forEach(([date, logs]) => {
    const sheetData: any[] = [
      ['POWER TRANSFORMER (PT) - HOURLY LOG'],
      [`Date: ${format(new Date(date), 'PPP')}`],
      [''],
      ['Hour', 'Voltage RY (kV)', 'Voltage YB (kV)', 'Voltage BR (kV)', 
       'Current R (A)', 'Current Y (A)', 'Current B (A)',
       'Active Power (MW)', 'Reactive Power (MVAR)', 'KVA', 'Frequency (Hz)',
       'Oil Temp (°C)', 'Winding Temp (°C)', 'Oil Level', 'Tap Position', 'Silica Gel',
       'MWH', 'MVARH', 'MVAH', 'COS φ', 'Tap Counter', 'Remarks', 'Operator']
    ];
    
    // Create 24-hour rows
    const hourlyLogs = logs as any[];
    for (let hour = 0; hour < 24; hour++) {
      const log = hourlyLogs.find(l => l.hour === hour);
      sheetData.push([
        hour,
        log?.voltage_ry || '',
        log?.voltage_yb || '',
        log?.voltage_rb || '',
        log?.current_r || '',
        log?.current_y || '',
        log?.current_b || '',
        log?.active_power || '',
        log?.reactive_power || '',
        log?.kva || '',
        log?.frequency || '',
        log?.oil_temperature || '',
        log?.winding_temperature || '',
        log?.oil_level || '',
        log?.tap_position || '',
        log?.silica_gel_colour || '',
        log?.mwh || '',
        log?.mvarh || '',
        log?.mvah || '',
        log?.cos_phi || '',
        log?.tap_counter || '',
        log?.remarks || '',
        log?.user_name || ''
      ]);
    }
    
    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    const sheetName = `PT_${date}`;
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName.substring(0, 31));
  });
  
  // PT LTAC Panel Data (if exists)
  const ptLtacData = ptLogs.filter(log => log.ltac_current_r || log.ltac_voltage_ry);
  if (ptLtacData.length > 0) {
    const ltacSheet: any[] = [
      ['PT - LTAC PANEL DATA'],
      [''],
      ['Date', 'Hour', 'Current R', 'Current Y', 'Current B', 
       'Voltage RY', 'Voltage YB', 'Voltage BR',
       'KW', 'KVA', 'KVAR', 'KWH', 'KVAH', 'KVARH',
       'Oil Temperature', 'Grid Fail Time', 'Grid Resume Time',
       'Supply Interruption', 'Operator']
    ];
    
    ptLtacData.forEach(log => {
      ltacSheet.push([
        format(new Date(log.date), 'yyyy-MM-dd'),
        log.hour,
        log.ltac_current_r || '',
        log.ltac_current_y || '',
        log.ltac_current_b || '',
        log.ltac_voltage_ry || '',
        log.ltac_voltage_yb || '',
        log.ltac_voltage_rb || '',
        log.ltac_kw || '',
        log.ltac_kva || '',
        log.ltac_kvar || '',
        log.ltac_kwh || '',
        log.ltac_kvah || '',
        log.ltac_kvarh || '',
        log.ltac_oil_temperature || '',
        log.ltac_grid_fail_time || '',
        log.ltac_grid_resume_time || '',
        log.ltac_supply_interruption || '',
        log.user_name || ''
      ]);
    });
    
    const sheet = XLSX.utils.aoa_to_sheet(ltacSheet);
    XLSX.utils.book_append_sheet(workbook, sheet, 'PT_LTAC_Panel');
  }
  
  // PT Generation Panel Data (if exists)
  const ptGenData = ptLogs.filter(log => log.gen_total_generation || log.gen_xmer_export);
  if (ptGenData.length > 0) {
    const genSheet: any[] = [
      ['PT - GENERATION PANEL'],
      [''],
      ['Date', 'Hour', 'Total Generation', 'Xmer Export', 'Aux Consumption',
       'Main Export', 'Check Export', 'Main Import', 'Check Import',
       'Standby Export', 'Standby Import', 'Operator']
    ];
    
    ptGenData.forEach(log => {
      genSheet.push([
        format(new Date(log.date), 'yyyy-MM-dd'),
        log.hour,
        log.gen_total_generation || '',
        log.gen_xmer_export || '',
        log.gen_aux_consumption || '',
        log.gen_main_export || '',
        log.gen_check_export || '',
        log.gen_main_import || '',
        log.gen_check_import || '',
        log.gen_standby_export || '',
        log.gen_standby_import || '',
        log.user_name || ''
      ]);
    });
    
    const sheet = XLSX.utils.aoa_to_sheet(genSheet);
    XLSX.utils.book_append_sheet(workbook, sheet, 'PT_Generation');
  }
  
  // Create daily sheets for AT
  Object.entries(atByDate).forEach(([date, logs]) => {
    const sheetData: any[] = [
      ['AUXILIARY TRANSFORMER (AT) - HOURLY LOG'],
      [`Date: ${format(new Date(date), 'PPP')}`],
      [''],
      ['Hour', 'Voltage RY (kV)', 'Voltage YB (kV)', 'Voltage BR (kV)', 
       'Current R (A)', 'Current Y (A)', 'Current B (A)',
       'Active Power (MW)', 'Reactive Power (MVAR)', 'KVA', 'Frequency (Hz)',
       'Oil Temp (°C)', 'Winding Temp (°C)', 'Oil Level', 'Tap Position', 'Silica Gel',
       'MWH', 'MVARH', 'MVAH', 'COS φ', 'Tap Counter', 'Remarks', 'Operator']
    ];
    
    const hourlyLogs = logs as any[];
    for (let hour = 0; hour < 24; hour++) {
      const log = hourlyLogs.find(l => l.hour === hour);
      sheetData.push([
        hour,
        log?.voltage_ry || '',
        log?.voltage_yb || '',
        log?.voltage_rb || '',
        log?.current_r || '',
        log?.current_y || '',
        log?.current_b || '',
        log?.active_power || '',
        log?.reactive_power || '',
        log?.kva || '',
        log?.frequency || '',
        log?.oil_temperature || '',
        log?.winding_temperature || '',
        log?.oil_level || '',
        log?.tap_position || '',
        log?.silica_gel_colour || '',
        log?.mwh || '',
        log?.mvarh || '',
        log?.mvah || '',
        log?.cos_phi || '',
        log?.tap_counter || '',
        log?.remarks || '',
        log?.user_name || ''
      ]);
    }
    
    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    const sheetName = `AT_${date}`;
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName.substring(0, 31));
  });
  
  // AT LTAC Panel Data
  const atLtacData = atLogs.filter(log => log.ltac_current_r || log.ltac_voltage_ry);
  if (atLtacData.length > 0) {
    const ltacSheet: any[] = [
      ['AT - LTAC PANEL DATA'],
      [''],
      ['Date', 'Hour', 'Current R', 'Current Y', 'Current B', 
       'Voltage RY', 'Voltage YB', 'Voltage BR',
       'KW', 'KVA', 'KVAR', 'KWH', 'KVAH', 'KVARH',
       'Oil Temperature', 'Grid Fail Time', 'Grid Resume Time',
       'Supply Interruption', 'Operator']
    ];
    
    atLtacData.forEach(log => {
      ltacSheet.push([
        format(new Date(log.date), 'yyyy-MM-dd'),
        log.hour,
        log.ltac_current_r || '',
        log.ltac_current_y || '',
        log.ltac_current_b || '',
        log.ltac_voltage_ry || '',
        log.ltac_voltage_yb || '',
        log.ltac_voltage_rb || '',
        log.ltac_kw || '',
        log.ltac_kva || '',
        log.ltac_kvar || '',
        log.ltac_kwh || '',
        log.ltac_kvah || '',
        log.ltac_kvarh || '',
        log.ltac_oil_temperature || '',
        log.ltac_grid_fail_time || '',
        log.ltac_grid_resume_time || '',
        log.ltac_supply_interruption || '',
        log.user_name || ''
      ]);
    });
    
    const sheet = XLSX.utils.aoa_to_sheet(ltacSheet);
    XLSX.utils.book_append_sheet(workbook, sheet, 'AT_LTAC_Panel');
  }
  
  // Summary sheet
  const summaryData = [
    ['TRANSFORMER LOGS SUMMARY REPORT'],
    ['Period:', `${format(new Date(startDate), 'PPP')} - ${format(new Date(endDate), 'PPP')}`],
    ['Generated:', format(new Date(), 'PPp')],
    [''],
    ['POWER TRANSFORMER (PT)'],
    ['Total Records:', ptLogs.length],
    ['Date Range:', `${ptLogs.length > 0 ? format(new Date(ptLogs[0].date), 'PPP') : 'N/A'} to ${ptLogs.length > 0 ? format(new Date(ptLogs[ptLogs.length - 1].date), 'PPP') : 'N/A'}`],
    [''],
    ['AUXILIARY TRANSFORMER (AT)'],
    ['Total Records:', atLogs.length],
    ['Date Range:', `${atLogs.length > 0 ? format(new Date(atLogs[0].date), 'PPP') : 'N/A'} to ${atLogs.length > 0 ? format(new Date(atLogs[atLogs.length - 1].date), 'PPP') : 'N/A'}`],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  XLSX.writeFile(workbook, `Transformer_Logs_Detailed_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const exportGeneratorLogsToExcel = (data: any[], startDate: string, endDate: string) => {
  const workbook = XLSX.utils.book_new();
  
  const logsByDate = groupByDate(data);
  
  // Create daily sheets with complete data
  Object.entries(logsByDate).forEach(([date, logs]) => {
    const sheetData: any[] = [
      ['GENERATOR HOURLY LOG SHEET'],
      [`Date: ${format(new Date(date), 'PPP')}`],
      [''],
      ['Hour', 
       // Electrical Parameters
       'Current R (A)', 'Current Y (A)', 'Current B (A)', 
       'Voltage RY (kV)', 'Voltage YB (kV)', 'Voltage BR (kV)',
       'KW', 'KVAR', 'KVA', 'Frequency (Hz)', 'Power Factor', 'RPM', 
       'MWH', 'MVARH', 'MVAH',
       // Winding Temperatures
       'Winding R1 (°C)', 'Winding R2 (°C)', 'Winding Y1 (°C)', 
       'Winding Y2 (°C)', 'Winding B1 (°C)', 'Winding B2 (°C)',
       // Bearing Temperatures (8 Channels)
       'G.DE CH7 (°C)', 'G.NDE CH8 (°C)', 'Thrust1 CH9 (°C)', 'Thrust2 CH10 (°C)',
       'BGB Low CH11 (°C)', 'BGB High CH12 (°C)', 'TGB Low CH13 (°C)', 'TGB High CH14 (°C)',
       // AVR
       'AVR Field Current (A)', 'AVR Field Voltage (V)',
       // Intake System
       'GV %', 'RB %', 'Water Pressure (bar)', 'Water Level (m)',
       // Tail Race
       'TR Water Level (m)', 'Net Head (m)',
       // T.OPU
       'TOPU Oil Pressure (bar)', 'TOPU Oil Temp (°C)', 'TOPU Oil Level (%)',
       // GB.LOS & Cooling
       'GBLOS Oil Pressure (bar)', 'GBLOS Oil Temp (°C)', 'GBLOS Oil Level (%)',
       'CW Main Pressure (bar)', 'CW LOS Flow (l/min)', 'CW Bearing Flow (l/min)',
       // Remarks & Operator
       'Remarks', 'Operator']
    ];
    
    // Create 24-hour rows with all data
    const hourlyLogs = logs as any[];
    for (let hour = 0; hour < 24; hour++) {
      const log = hourlyLogs.find(l => l.hour === hour);
      sheetData.push([
        hour,
        // Electrical
        log?.gen_current_r || '',
        log?.gen_current_y || '',
        log?.gen_current_b || '',
        log?.gen_voltage_ry || '',
        log?.gen_voltage_yb || '',
        log?.gen_voltage_br || '',
        log?.gen_kw || '',
        log?.gen_kvar || '',
        log?.gen_kva || '',
        log?.gen_frequency || '',
        log?.gen_power_factor || '',
        log?.gen_rpm || '',
        log?.gen_mwh || '',
        log?.gen_mvarh || '',
        log?.gen_mvah || '',
        // Winding Temps
        log?.winding_temp_r1 || '',
        log?.winding_temp_r2 || '',
        log?.winding_temp_y1 || '',
        log?.winding_temp_y2 || '',
        log?.winding_temp_b1 || '',
        log?.winding_temp_b2 || '',
        // Bearing Temps
        log?.bearing_g_de_brg_main_ch7 || '',
        log?.bearing_g_nde_brg_stand_ch8 || '',
        log?.bearing_thrust_1_ch9 || '',
        log?.bearing_thrust_2_ch10 || '',
        log?.bearing_bgb_low_speed_ch11 || '',
        log?.bearing_bgb_high_speed_ch12 || '',
        log?.bearing_tgb_low_speed_ch13 || '',
        log?.bearing_tgb_high_speed_ch14 || '',
        // AVR
        log?.avr_field_current || '',
        log?.avr_field_voltage || '',
        // Intake
        log?.intake_gv_percentage || '',
        log?.intake_rb_percentage || '',
        log?.intake_water_pressure || '',
        log?.intake_water_level || '',
        // Tail Race
        log?.tail_race_water_level || '',
        log?.tail_race_net_head || '',
        // T.OPU
        log?.topu_oil_pressure || '',
        log?.topu_oil_temperature || '',
        log?.topu_oil_level || '',
        // GB.LOS & Cooling
        log?.gblos_oil_pressure || '',
        log?.gblos_oil_temperature || '',
        log?.gblos_oil_level || '',
        log?.cooling_main_pressure || '',
        log?.cooling_los_flow || '',
        log?.cooling_bearing_flow || '',
        // Remarks
        log?.remarks || '',
        log?.user_name || ''
      ]);
    }
    
    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    const sheetName = `Gen_${date}`;
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName.substring(0, 31));
  });
  
  // Summary sheet with aggregated statistics
  const summaryData = [
    ['GENERATOR LOGS SUMMARY REPORT'],
    ['Period:', `${format(new Date(startDate), 'PPP')} - ${format(new Date(endDate), 'PPP')}`],
    ['Generated:', format(new Date(), 'PPp')],
    [''],
    ['STATISTICS'],
    ['Total Records:', data.length],
    ['Total Hours Logged:', data.length],
    ['Unique Dates:', Object.keys(logsByDate).length],
    [''],
    ['AVERAGE VALUES (Where Available)'],
    ['Avg KW:', data.filter(d => d.gen_kw).length > 0 ? (data.reduce((acc, d) => acc + (d.gen_kw || 0), 0) / data.filter(d => d.gen_kw).length).toFixed(2) : 'N/A'],
    ['Avg Frequency:', data.filter(d => d.gen_frequency).length > 0 ? (data.reduce((acc, d) => acc + (d.gen_frequency || 0), 0) / data.filter(d => d.gen_frequency).length).toFixed(2) : 'N/A'],
    ['Avg Power Factor:', data.filter(d => d.gen_power_factor).length > 0 ? (data.reduce((acc, d) => acc + (d.gen_power_factor || 0), 0) / data.filter(d => d.gen_power_factor).length).toFixed(3) : 'N/A'],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  XLSX.writeFile(workbook, `Generator_Logs_Detailed_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const exportIssuesToExcel = (data: any[], startDate: string, endDate: string) => {
  const workbook = XLSX.utils.book_new();
  
  // Summary by Severity
  const critical = data.filter(i => i.severity === 'critical');
  const high = data.filter(i => i.severity === 'high');
  const medium = data.filter(i => i.severity === 'medium');
  const low = data.filter(i => i.severity === 'low');
  
  const summaryData = [
    ['FLAGGED ISSUES SUMMARY REPORT'],
    ['Period:', `${format(new Date(startDate), 'PPP')} - ${format(new Date(endDate), 'PPP')}`],
    ['Generated:', format(new Date(), 'PPp')],
    [''],
    ['SEVERITY BREAKDOWN'],
    ['Critical:', critical.length],
    ['High:', high.length],
    ['Medium:', medium.length],
    ['Low:', low.length],
    ['Total Issues:', data.length],
    [''],
    ['STATUS BREAKDOWN'],
    ['Reported:', data.filter(i => i.status === 'reported').length],
    ['In Progress:', data.filter(i => i.status === 'in_progress').length],
    ['Resolved:', data.filter(i => i.status === 'resolved').length],
    [''],
    ['MODULE BREAKDOWN'],
  ];
  
  // Count issues by module
  const moduleBreakdown = data.reduce((acc, issue) => {
    const moduleName = issue.module || 'Unknown';
    acc[moduleName] = ((acc[moduleName] as number) || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  Object.entries(moduleBreakdown).forEach(([module, count]) => {
    summaryData.push([module, count as number]);
  });
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // All Issues Sheet
  const issuesData = data.map(issue => ({
    'Issue ID': issue.id?.substring(0, 8) || 'N/A',
    'Date': format(new Date(issue.reported_at), 'yyyy-MM-dd'),
    'Time': format(new Date(issue.reported_at), 'HH:mm'),
    'User': issue.user_name || 'N/A',
    'Employee ID': issue.employee_id || 'N/A',
    'Module': issue.module,
    'Section': issue.section,
    'Item': issue.item,
    'Unit': issue.unit || 'N/A',
    'Issue Code': issue.issue_code,
    'Severity': issue.severity,
    'Status': issue.status,
    'Description': issue.description,
    'Resolution Notes': issue.resolution_notes || 'N/A',
    'Assigned To': issue.assigned_to || 'N/A',
    'Resolved At': issue.resolved_at ? format(new Date(issue.resolved_at), 'PPp') : 'N/A',
  }));
  
  const issuesSheet = XLSX.utils.json_to_sheet(issuesData);
  XLSX.utils.book_append_sheet(workbook, issuesSheet, 'All Issues');
  
  // Critical Issues Sheet
  if (critical.length > 0) {
    const criticalData = critical.map(issue => ({
      'Date': format(new Date(issue.reported_at), 'yyyy-MM-dd'),
      'Module': issue.module,
      'Section': issue.section,
      'Item': issue.item,
      'Description': issue.description,
      'Status': issue.status,
      'Assigned To': issue.assigned_to || 'Unassigned',
    }));
    const criticalSheet = XLSX.utils.json_to_sheet(criticalData);
    XLSX.utils.book_append_sheet(workbook, criticalSheet, 'Critical Issues');
  }
  
  // High Priority Issues Sheet
  if (high.length > 0) {
    const highData = high.map(issue => ({
      'Date': format(new Date(issue.reported_at), 'yyyy-MM-dd'),
      'Module': issue.module,
      'Section': issue.section,
      'Item': issue.item,
      'Description': issue.description,
      'Status': issue.status,
    }));
    const highSheet = XLSX.utils.json_to_sheet(highData);
    XLSX.utils.book_append_sheet(workbook, highSheet, 'High Priority');
  }
  
  // Resolved Issues Sheet
  const resolved = data.filter(i => i.status === 'resolved');
  if (resolved.length > 0) {
    const resolvedData = resolved.map(issue => ({
      'Reported': format(new Date(issue.reported_at), 'yyyy-MM-dd'),
      'Resolved': issue.resolved_at ? format(new Date(issue.resolved_at), 'yyyy-MM-dd') : 'N/A',
      'Module': issue.module,
      'Item': issue.item,
      'Description': issue.description,
      'Resolution': issue.resolution_notes || 'N/A',
    }));
    const resolvedSheet = XLSX.utils.json_to_sheet(resolvedData);
    XLSX.utils.book_append_sheet(workbook, resolvedSheet, 'Resolved Issues');
  }
  
  XLSX.writeFile(workbook, `Flagged_Issues_Detailed_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
