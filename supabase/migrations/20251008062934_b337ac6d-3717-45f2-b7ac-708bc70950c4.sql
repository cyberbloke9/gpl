-- Phase 4: Update flagged_issues table to support transformer logs

-- Add transformer_log_id column
ALTER TABLE flagged_issues 
ADD COLUMN transformer_log_id uuid REFERENCES transformer_logs(id);

-- Make checklist_id nullable (it was NOT NULL before)
ALTER TABLE flagged_issues 
ALTER COLUMN checklist_id DROP NOT NULL;

-- Add check constraint to ensure either checklist_id OR transformer_log_id exists
ALTER TABLE flagged_issues 
ADD CONSTRAINT check_issue_reference 
CHECK (
  (checklist_id IS NOT NULL AND transformer_log_id IS NULL) OR
  (checklist_id IS NULL AND transformer_log_id IS NOT NULL)
);