-- Fix RLS policy to allow checklist submission
-- The issue is that the WITH CHECK clause was preventing users from setting submitted = true
-- This drops and recreates the policy to allow the submission transition

DROP POLICY IF EXISTS "Users can update own unsubmitted checklists" ON checklists;

CREATE POLICY "Users can update own unsubmitted checklists"
ON checklists FOR UPDATE
TO public
USING (
  -- Only allow updates to checklists that are currently unsubmitted
  auth.uid() = user_id 
  AND (submitted = FALSE OR submitted IS NULL)
)
WITH CHECK (
  -- Allow the user to submit (transition to submitted = true)
  -- Only verify ownership, not the submitted state
  auth.uid() = user_id
);