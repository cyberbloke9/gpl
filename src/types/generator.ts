export interface GeneratorLog {
  id: string;
  user_id: string;
  date: string;
  hour: number;
  created_at: string;
  updated_at: string;
  logged_at: string;
  finalized: boolean;
  finalized_at?: string;
  finalized_by?: string;
  
  // Section 1: Generator Winding Temperatures
  winding_temp_r1?: number;
  winding_temp_r2?: number;
  winding_temp_y1?: number;
  winding_temp_y2?: number;
  winding_temp_b1?: number;
  winding_temp_b2?: number;
  
  // Section 2: Bearing Temperatures
  bearing_g_de_brg_main_ch7?: number;
  bearing_g_nde_brg_stand_ch8?: number;
  bearing_thrust_1_ch9?: number;
  bearing_thrust_2_ch10?: number;
  bearing_bgb_low_speed_ch11?: number;
  bearing_bgb_high_speed_ch12?: number;
  bearing_tgb_low_speed_ch13?: number;
  bearing_tgb_high_speed_ch14?: number;
  
  // Section 3: Electrical Parameters
  gen_current_r?: number;
  gen_current_y?: number;
  gen_current_b?: number;
  gen_voltage_ry?: number;
  gen_voltage_yb?: number;
  gen_voltage_br?: number;
  gen_kw?: number;
  gen_kvar?: number;
  gen_kva?: number;
  gen_frequency?: number;
  gen_power_factor?: number;
  gen_rpm?: number;
  gen_mwh?: number;
  gen_mvarh?: number;
  gen_mvah?: number;
  
  // Section 4: AVR
  avr_field_current?: number;
  avr_field_voltage?: number;
  
  // Section 5: Intake System
  intake_gv_percentage?: number;
  intake_rb_percentage?: number;
  intake_water_pressure?: number;
  intake_water_level?: number;
  
  // Section 6: Tail Race
  tail_race_water_level?: number;
  tail_race_net_head?: number;
  
  // Section 7: T.OPU
  topu_oil_pressure?: number;
  topu_oil_temperature?: number;
  topu_oil_level?: number;
  
  // Section 8: GB.LOS & Cooling Water
  gblos_oil_pressure?: number;
  gblos_oil_temperature?: number;
  gblos_oil_level?: number;
  cooling_main_pressure?: number;
  cooling_los_flow?: number;
  cooling_bearing_flow?: number;
  
  remarks?: string;
}

export type HourStatus = 'current' | 'completed' | 'locked' | 'future';

export interface ValidationResult {
  status: 'valid' | 'warning' | 'error';
  message?: string;
}
