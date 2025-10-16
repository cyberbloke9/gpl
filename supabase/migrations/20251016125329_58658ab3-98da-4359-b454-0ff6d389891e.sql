-- PHASE 2: Update Generator Logs RLS Policies for Collective Work

-- Drop old per-user RLS policies
DROP POLICY IF EXISTS "Users can view own generator logs" ON generator_logs;
DROP POLICY IF EXISTS "Users can update own unfinalized logs" ON generator_logs;
DROP POLICY IF EXISTS "Users can create generator logs" ON generator_logs;
DROP POLICY IF EXISTS "Admins can view all generator logs" ON generator_logs;

-- Create new collective RLS policies
CREATE POLICY "Operators and admins can view all generator logs"
ON generator_logs FOR SELECT
USING (
  has_role(auth.uid(), 'operator'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Operators can insert unfinalized logs"
ON generator_logs FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'operator'::app_role) AND
  (finalized = false OR finalized IS NULL)
);

CREATE POLICY "Operators can update unfinalized logs"
ON generator_logs FOR UPDATE
USING (
  has_role(auth.uid(), 'operator'::app_role) AND
  (finalized = false OR finalized IS NULL)
);

CREATE POLICY "Admins can manage all generator logs"
ON generator_logs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));