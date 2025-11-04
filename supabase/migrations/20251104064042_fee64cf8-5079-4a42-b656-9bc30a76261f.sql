-- Create admin_audit_log table for tracking all administrative actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id, timestamp DESC);
CREATE INDEX idx_admin_audit_log_action ON public.admin_audit_log(action, timestamp DESC);
CREATE INDEX idx_admin_audit_log_target ON public.admin_audit_log(target_user_id, timestamp DESC);
CREATE INDEX idx_admin_audit_log_timestamp ON public.admin_audit_log(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs (edge functions use service role)
CREATE POLICY "System can insert audit logs"
ON public.admin_audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- No updates or deletes allowed (immutable audit trail)
CREATE POLICY "Audit logs are immutable"
ON public.admin_audit_log
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Audit logs cannot be deleted"
ON public.admin_audit_log
FOR DELETE
TO authenticated
USING (false);