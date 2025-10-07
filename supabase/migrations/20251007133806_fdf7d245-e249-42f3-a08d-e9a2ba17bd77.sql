-- Add validation constraints for transformer logs to ensure data integrity

-- Voltage constraints (typical power system voltages: 0-50kV)
ALTER TABLE public.transformer_logs 
  ADD CONSTRAINT valid_voltage_r CHECK (voltage_r >= 0 AND voltage_r <= 50000),
  ADD CONSTRAINT valid_voltage_y CHECK (voltage_y >= 0 AND voltage_y <= 50000),
  ADD CONSTRAINT valid_voltage_b CHECK (voltage_b >= 0 AND voltage_b <= 50000);

-- Current constraints (typical transformer currents: 0-5000A)
ALTER TABLE public.transformer_logs 
  ADD CONSTRAINT valid_current_r CHECK (current_r >= 0 AND current_r <= 5000),
  ADD CONSTRAINT valid_current_y CHECK (current_y >= 0 AND current_y <= 5000),
  ADD CONSTRAINT valid_current_b CHECK (current_b >= 0 AND current_b <= 5000);

-- Frequency constraints (typical power grid frequency: 45-65Hz)
ALTER TABLE public.transformer_logs 
  ADD CONSTRAINT valid_frequency CHECK (frequency >= 45 AND frequency <= 65);

-- Power constraints (0-100MW for typical industrial transformers)
ALTER TABLE public.transformer_logs 
  ADD CONSTRAINT valid_active_power CHECK (active_power >= 0 AND active_power <= 100000),
  ADD CONSTRAINT valid_reactive_power CHECK (reactive_power >= -50000 AND reactive_power <= 50000);

-- Temperature constraints (typical operating range: -50°C to 200°C)
ALTER TABLE public.transformer_logs 
  ADD CONSTRAINT valid_winding_temperature CHECK (winding_temperature >= -50 AND winding_temperature <= 200),
  ADD CONSTRAINT valid_oil_temperature CHECK (oil_temperature >= -50 AND oil_temperature <= 150);