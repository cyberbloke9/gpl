-- Add constraint to ensure data consistency
-- Submitted checklists must have 100% completion
ALTER TABLE public.checklists 
ADD CONSTRAINT checklists_submitted_completion_check 
CHECK (
  (submitted = false) OR 
  (submitted = true AND completion_percentage = 100)
);