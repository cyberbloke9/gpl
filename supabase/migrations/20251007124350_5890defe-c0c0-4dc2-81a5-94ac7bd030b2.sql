-- Phase 6: Add problem tracking and submission fields to checklists table
ALTER TABLE public.checklists
ADD COLUMN IF NOT EXISTS problem_fields JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS problem_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS submitted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN public.checklists.problem_fields IS 'Array of objects tracking out-of-range values: {module, field, value, range, unit, timestamp}';
COMMENT ON COLUMN public.checklists.problem_count IS 'Count of fields with values out of acceptable range';
COMMENT ON COLUMN public.checklists.submitted IS 'Whether the checklist has been submitted for admin review';
COMMENT ON COLUMN public.checklists.submitted_at IS 'Timestamp when the checklist was submitted';

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Admins can update checklists" ON public.checklists;
CREATE POLICY "Admins can update checklists"
ON public.checklists
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Admins can view all transformer logs" ON public.transformer_logs;
CREATE POLICY "Admins can view all transformer logs"
ON public.transformer_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for admin dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.checklists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flagged_issues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transformer_logs;