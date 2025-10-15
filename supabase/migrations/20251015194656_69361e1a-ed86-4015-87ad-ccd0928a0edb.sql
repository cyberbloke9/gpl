-- Recreate assign_admin_role function with proper access control
-- Only existing admins can assign admin role to others
CREATE OR REPLACE FUNCTION public.assign_admin_role(_user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  _user_id uuid;
  _caller_is_admin boolean;
BEGIN
  -- Check if the caller is an admin (unless this is the first admin)
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  ) INTO _caller_is_admin;
  
  -- If admins exist, verify the caller is one of them
  IF _caller_is_admin THEN
    IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Only admins can assign admin role';
    END IF;
  END IF;
  
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
$function$;