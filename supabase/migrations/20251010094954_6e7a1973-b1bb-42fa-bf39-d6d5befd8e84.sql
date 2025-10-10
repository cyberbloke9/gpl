-- Add finalization tracking to transformer_logs
ALTER TABLE transformer_logs 
ADD COLUMN IF NOT EXISTS finalized BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS finalized_by UUID REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_transformer_logs_finalized 
ON transformer_logs(date, transformer_number, finalized);

-- Update RLS policies for checklists (prevent editing after submission)
DROP POLICY IF EXISTS "Users can update own checklists" ON checklists;

CREATE POLICY "Users can update own unsubmitted checklists"
ON checklists FOR UPDATE
TO public
USING (
  auth.uid() = user_id 
  AND (submitted = FALSE OR submitted IS NULL)
)
WITH CHECK (
  auth.uid() = user_id 
  AND (submitted = FALSE OR submitted IS NULL)
);

-- Update RLS policies for transformer_logs (prevent editing after finalization)
DROP POLICY IF EXISTS "Users can update own transformer logs" ON transformer_logs;

CREATE POLICY "Users can update own unfinalized logs"
ON transformer_logs FOR UPDATE
TO public
USING (
  auth.uid() = user_id 
  AND (finalized = FALSE OR finalized IS NULL)
)
WITH CHECK (
  auth.uid() = user_id 
  AND (finalized = FALSE OR finalized IS NULL)
);