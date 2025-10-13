-- Add PTR Feeder missing fields (9 new fields)
ALTER TABLE transformer_logs 
ADD COLUMN IF NOT EXISTS kva numeric,
ADD COLUMN IF NOT EXISTS mwh numeric,
ADD COLUMN IF NOT EXISTS mvarh numeric,
ADD COLUMN IF NOT EXISTS mvah numeric,
ADD COLUMN IF NOT EXISTS cos_phi numeric CHECK (cos_phi >= 0 AND cos_phi <= 1),
ADD COLUMN IF NOT EXISTS oil_level text,
ADD COLUMN IF NOT EXISTS tap_position text,
ADD COLUMN IF NOT EXISTS tap_counter integer,
ADD COLUMN IF NOT EXISTS silica_gel_colour text CHECK (silica_gel_colour IN ('Blue', 'Pink', 'Other'));

-- Rename existing voltage columns to match specification (RY, YB, RB naming)
ALTER TABLE transformer_logs
RENAME COLUMN voltage_r TO voltage_ry;
ALTER TABLE transformer_logs
RENAME COLUMN voltage_y TO voltage_yb;
ALTER TABLE transformer_logs
RENAME COLUMN voltage_b TO voltage_rb;

-- Add LTAC Feeder fields (100 KVA transformer - 16 new fields)
ALTER TABLE transformer_logs
ADD COLUMN IF NOT EXISTS ltac_current_r numeric,
ADD COLUMN IF NOT EXISTS ltac_current_y numeric,
ADD COLUMN IF NOT EXISTS ltac_current_b numeric,
ADD COLUMN IF NOT EXISTS ltac_voltage_ry numeric,
ADD COLUMN IF NOT EXISTS ltac_voltage_yb numeric,
ADD COLUMN IF NOT EXISTS ltac_voltage_rb numeric,
ADD COLUMN IF NOT EXISTS ltac_kw numeric,
ADD COLUMN IF NOT EXISTS ltac_kva numeric,
ADD COLUMN IF NOT EXISTS ltac_kvar numeric,
ADD COLUMN IF NOT EXISTS ltac_kwh numeric,
ADD COLUMN IF NOT EXISTS ltac_kvah numeric,
ADD COLUMN IF NOT EXISTS ltac_kvarh numeric,
ADD COLUMN IF NOT EXISTS ltac_oil_temperature numeric,
ADD COLUMN IF NOT EXISTS ltac_grid_fail_time time,
ADD COLUMN IF NOT EXISTS ltac_grid_resume_time time,
ADD COLUMN IF NOT EXISTS ltac_supply_interruption text;

-- Add Generation Details fields (9 new fields)
ALTER TABLE transformer_logs
ADD COLUMN IF NOT EXISTS gen_total_generation numeric,
ADD COLUMN IF NOT EXISTS gen_xmer_export numeric,
ADD COLUMN IF NOT EXISTS gen_aux_consumption numeric,
ADD COLUMN IF NOT EXISTS gen_main_export numeric,
ADD COLUMN IF NOT EXISTS gen_check_export numeric,
ADD COLUMN IF NOT EXISTS gen_main_import numeric,
ADD COLUMN IF NOT EXISTS gen_check_import numeric,
ADD COLUMN IF NOT EXISTS gen_standby_export numeric,
ADD COLUMN IF NOT EXISTS gen_standby_import numeric;

-- Add index for performance on date and hour lookups
CREATE INDEX IF NOT EXISTS idx_transformer_logs_date_hour ON transformer_logs(date, hour);

-- Add comment for documentation
COMMENT ON TABLE transformer_logs IS 'Stores hourly transformer readings for PTR Feeder (3.2 MVA), LTAC Feeder (100 KVA), and Generation Details';
