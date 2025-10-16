-- PHASE 4: Fix Transformer Logs Schema for Collective Work

-- Step 1: Drop old unique constraint
ALTER TABLE transformer_logs DROP CONSTRAINT IF EXISTS transformer_logs_unique_entry;

-- Step 2: Add tracking columns
ALTER TABLE transformer_logs ADD COLUMN IF NOT EXISTS logged_by UUID;
ALTER TABLE transformer_logs ADD COLUMN IF NOT EXISTS last_modified_by UUID;

-- Step 3: Make user_id nullable
ALTER TABLE transformer_logs ALTER COLUMN user_id DROP NOT NULL;

-- Step 4: Populate logged_by from existing user_id
UPDATE transformer_logs SET logged_by = user_id WHERE logged_by IS NULL;

-- Step 5: Add new collective unique constraint (date, hour, transformer_number)
ALTER TABLE transformer_logs ADD CONSTRAINT transformer_logs_unique_date_hour_transformer 
UNIQUE (date, hour, transformer_number);