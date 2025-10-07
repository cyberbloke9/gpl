-- Add logged_at timestamp to transformer_logs for history tracking
ALTER TABLE public.transformer_logs 
ADD COLUMN IF NOT EXISTS logged_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create admin user account
-- Email: admin@powerstation.local
-- Password: AdminTest123!
-- This is a temporary password that should be changed after deployment

-- Insert admin user into auth.users (using Supabase's internal auth schema)
-- Note: We'll need to sign up through the app UI first, then assign admin role
-- For now, we'll create a function to easily assign admin role to any user

-- Create helper function to assign admin role
CREATE OR REPLACE FUNCTION public.assign_admin_role(_user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Get user ID from email
  SELECT id INTO _user_id FROM auth.users WHERE email = _user_email;
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', _user_email;
  END IF;
  
  -- Insert admin role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;