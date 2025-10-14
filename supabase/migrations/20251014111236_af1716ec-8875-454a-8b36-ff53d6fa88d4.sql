-- Add unique constraint to prevent duplicate hourly logs
-- This allows upsert operations to work correctly
ALTER TABLE transformer_logs 
ADD CONSTRAINT transformer_logs_unique_entry 
UNIQUE (date, hour, transformer_number, user_id);