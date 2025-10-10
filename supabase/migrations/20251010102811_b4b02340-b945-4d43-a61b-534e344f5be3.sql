-- Fix transformer_logs SELECT policy to scope by user_id
-- Drop the overly permissive policy that allows all users to see all logs
DROP POLICY IF EXISTS "Users can view all transformer logs" ON public.transformer_logs;

-- Create user-scoped policy so users only see their own logs
CREATE POLICY "Users can view own transformer logs"
ON public.transformer_logs FOR SELECT
USING (auth.uid() = user_id);

-- Note: The "Admins can view all transformer logs" policy already exists for admin access

-- Drop the interval_reminders table and all associated policies
-- This feature is not being used
DROP TABLE IF EXISTS public.interval_reminders CASCADE;