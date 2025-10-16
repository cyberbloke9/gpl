-- Drop old restrictive RLS policies
DROP POLICY IF EXISTS "Users can view own issues" ON public.flagged_issues;
DROP POLICY IF EXISTS "Users can create own issues" ON public.flagged_issues;
DROP POLICY IF EXISTS "Admins can view all issues" ON public.flagged_issues;
DROP POLICY IF EXISTS "Admins can update all issues" ON public.flagged_issues;

-- Create new collective RLS policies
CREATE POLICY "Operators and admins can view all issues"
  ON public.flagged_issues
  FOR SELECT
  USING (
    has_role(auth.uid(), 'operator'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Operators can create issues"
  ON public.flagged_issues
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'operator'::app_role) AND
    auth.uid() = user_id
  );

CREATE POLICY "Admins can update all issues"
  ON public.flagged_issues
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all issues"
  ON public.flagged_issues
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));