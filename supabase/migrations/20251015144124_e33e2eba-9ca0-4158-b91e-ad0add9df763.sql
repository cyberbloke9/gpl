-- Create generator_logs table for hourly generator and turbine readings
CREATE TABLE public.generator_logs (
  -- Primary Keys & References
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  
  -- Timestamps & Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Finalization (prevents editing after hour completion)
  finalized BOOLEAN DEFAULT FALSE,
  finalized_at TIMESTAMPTZ,
  finalized_by UUID REFERENCES auth.users(id),
  
  -- Section 1: Generator Winding Temperatures (6 fields)
  winding_temp_r1 NUMERIC(5,1) CHECK (winding_temp_r1 >= 0 AND winding_temp_r1 <= 200),
  winding_temp_r2 NUMERIC(5,1) CHECK (winding_temp_r2 >= 0 AND winding_temp_r2 <= 200),
  winding_temp_y1 NUMERIC(5,1) CHECK (winding_temp_y1 >= 0 AND winding_temp_y1 <= 200),
  winding_temp_y2 NUMERIC(5,1) CHECK (winding_temp_y2 >= 0 AND winding_temp_y2 <= 200),
  winding_temp_b1 NUMERIC(5,1) CHECK (winding_temp_b1 >= 0 AND winding_temp_b1 <= 200),
  winding_temp_b2 NUMERIC(5,1) CHECK (winding_temp_b2 >= 0 AND winding_temp_b2 <= 200),
  
  -- Section 2: Bearing Temperatures (8 fields - CH7 to CH14)
  bearing_g_de_brg_main_ch7 NUMERIC(5,1) CHECK (bearing_g_de_brg_main_ch7 >= 0 AND bearing_g_de_brg_main_ch7 <= 200),
  bearing_g_nde_brg_stand_ch8 NUMERIC(5,1) CHECK (bearing_g_nde_brg_stand_ch8 >= 0 AND bearing_g_nde_brg_stand_ch8 <= 200),
  bearing_thrust_1_ch9 NUMERIC(5,1) CHECK (bearing_thrust_1_ch9 >= 0 AND bearing_thrust_1_ch9 <= 200),
  bearing_thrust_2_ch10 NUMERIC(5,1) CHECK (bearing_thrust_2_ch10 >= 0 AND bearing_thrust_2_ch10 <= 200),
  bearing_bgb_low_speed_ch11 NUMERIC(5,1) CHECK (bearing_bgb_low_speed_ch11 >= 0 AND bearing_bgb_low_speed_ch11 <= 200),
  bearing_bgb_high_speed_ch12 NUMERIC(5,1) CHECK (bearing_bgb_high_speed_ch12 >= 0 AND bearing_bgb_high_speed_ch12 <= 200),
  bearing_tgb_low_speed_ch13 NUMERIC(5,1) CHECK (bearing_tgb_low_speed_ch13 >= 0 AND bearing_tgb_low_speed_ch13 <= 200),
  bearing_tgb_high_speed_ch14 NUMERIC(5,1) CHECK (bearing_tgb_high_speed_ch14 >= 0 AND bearing_tgb_high_speed_ch14 <= 200),
  
  -- Section 3: 3.3 KV Generator - Electrical Parameters (15 fields)
  gen_current_r NUMERIC(8,2) CHECK (gen_current_r >= 0),
  gen_current_y NUMERIC(8,2) CHECK (gen_current_y >= 0),
  gen_current_b NUMERIC(8,2) CHECK (gen_current_b >= 0),
  gen_voltage_ry NUMERIC(8,2) CHECK (gen_voltage_ry >= 0),
  gen_voltage_yb NUMERIC(8,2) CHECK (gen_voltage_yb >= 0),
  gen_voltage_br NUMERIC(8,2) CHECK (gen_voltage_br >= 0),
  gen_kw NUMERIC(10,2),
  gen_kvar NUMERIC(10,2),
  gen_kva NUMERIC(10,2) CHECK (gen_kva >= 0),
  gen_frequency NUMERIC(5,2) CHECK (gen_frequency >= 45 AND gen_frequency <= 55),
  gen_power_factor NUMERIC(4,3) CHECK (gen_power_factor >= 0 AND gen_power_factor <= 1),
  gen_rpm NUMERIC(8,2) CHECK (gen_rpm >= 0),
  gen_mwh NUMERIC(10,3) CHECK (gen_mwh >= 0),
  gen_mvarh NUMERIC(10,3),
  gen_mvah NUMERIC(10,3) CHECK (gen_mvah >= 0),
  
  -- Section 4: AVR - Automatic Voltage Regulator (2 fields)
  avr_field_current NUMERIC(8,2) CHECK (avr_field_current >= 0),
  avr_field_voltage NUMERIC(8,2) CHECK (avr_field_voltage >= 0),
  
  -- Section 5: Intake System (4 fields)
  intake_gv_percentage NUMERIC(5,2) CHECK (intake_gv_percentage >= 0 AND intake_gv_percentage <= 100),
  intake_rb_percentage NUMERIC(5,2) CHECK (intake_rb_percentage >= 0 AND intake_rb_percentage <= 100),
  intake_water_pressure NUMERIC(8,2) CHECK (intake_water_pressure >= 0),
  intake_water_level NUMERIC(8,2),
  
  -- Section 6: Tail Race (2 fields)
  tail_race_water_level NUMERIC(8,2),
  tail_race_net_head NUMERIC(8,2) CHECK (tail_race_net_head >= 0),
  
  -- Section 7: T.OPU - Turbine Oil Pressure Unit (3 fields)
  topu_oil_pressure NUMERIC(8,2) CHECK (topu_oil_pressure >= 0),
  topu_oil_temperature NUMERIC(5,1) CHECK (topu_oil_temperature >= 0 AND topu_oil_temperature <= 150),
  topu_oil_level NUMERIC(5,2) CHECK (topu_oil_level >= 0 AND topu_oil_level <= 100),
  
  -- Section 8: GB.LOS & Cooling Water System (6 fields)
  gblos_oil_pressure NUMERIC(8,2) CHECK (gblos_oil_pressure >= 0),
  gblos_oil_temperature NUMERIC(5,1) CHECK (gblos_oil_temperature >= 0 AND gblos_oil_temperature <= 150),
  gblos_oil_level NUMERIC(5,2) CHECK (gblos_oil_level >= 0 AND gblos_oil_level <= 100),
  cooling_main_pressure NUMERIC(8,2) CHECK (cooling_main_pressure >= 0),
  cooling_los_flow NUMERIC(8,2) CHECK (cooling_los_flow >= 0),
  cooling_bearing_flow NUMERIC(8,2) CHECK (cooling_bearing_flow >= 0),
  
  -- Remarks field for additional notes
  remarks TEXT,
  
  -- Unique constraint: one log per user per date per hour
  UNIQUE (user_id, date, hour)
);

-- Create performance indexes
CREATE INDEX idx_generator_logs_user_date ON public.generator_logs(user_id, date);
CREATE INDEX idx_generator_logs_date_hour ON public.generator_logs(date, hour);

-- Enable Row Level Security
ALTER TABLE public.generator_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own generator logs
CREATE POLICY "Users can view own generator logs"
ON public.generator_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policy: Admins can view all generator logs
CREATE POLICY "Admins can view all generator logs"
ON public.generator_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Users can create their own generator logs
CREATE POLICY "Users can create generator logs"
ON public.generator_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own unfinalized logs
CREATE POLICY "Users can update own unfinalized logs"
ON public.generator_logs
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id AND 
  (finalized = FALSE OR finalized IS NULL)
)
WITH CHECK (
  auth.uid() = user_id AND 
  (finalized = FALSE OR finalized IS NULL)
);

-- Create trigger for automatic updated_at timestamp
CREATE TRIGGER update_generator_logs_updated_at
BEFORE UPDATE ON public.generator_logs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();