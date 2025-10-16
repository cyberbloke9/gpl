-- PHASE 1: Fix Generator Logs Schema for Collective Work

-- Step 1: Drop old unique constraint
ALTER TABLE generator_logs DROP CONSTRAINT IF EXISTS generator_logs_user_id_date_hour_key;

-- Step 2: Add tracking columns
ALTER TABLE generator_logs ADD COLUMN IF NOT EXISTS logged_by UUID;
ALTER TABLE generator_logs ADD COLUMN IF NOT EXISTS last_modified_by UUID;

-- Step 3: Make user_id nullable
ALTER TABLE generator_logs ALTER COLUMN user_id DROP NOT NULL;

-- Step 4: Populate logged_by from existing user_id
UPDATE generator_logs SET logged_by = user_id WHERE logged_by IS NULL;

-- Step 5: Add new collective unique constraint
ALTER TABLE generator_logs ADD CONSTRAINT generator_logs_unique_date_hour UNIQUE (date, hour);