-- PHASE 5 Part 2: Update Checklists RLS Policies for Collective Work

-- Drop old per-user RLS policies
DROP POLICY IF EXISTS "Users can view own checklists" ON checklists;
DROP POLICY IF EXISTS "Users can update own unsubmitted checklists" ON checklists;
DROP POLICY IF EXISTS "Users can create own checklists" ON checklists;
DROP POLICY IF EXISTS "Admins can view all checklists" ON checklists;
DROP POLICY IF EXISTS "Admins can update checklists" ON checklists;

-- Create new collective RLS policies
CREATE POLICY "Operators and admins can view all checklists"
ON checklists FOR SELECT
USING (
  has_role(auth.uid(), 'operator'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Operators can insert unsubmitted checklists"
ON checklists FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'operator'::app_role) AND
  (submitted = false OR submitted IS NULL)
);

CREATE POLICY "Operators can update unsubmitted checklists"
ON checklists FOR UPDATE
USING (
  has_role(auth.uid(), 'operator'::app_role) AND
  (submitted = false OR submitted IS NULL)
);

CREATE POLICY "Admins can manage all checklists"
ON checklists FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));