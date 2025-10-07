-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  employee_id TEXT UNIQUE,
  shift TEXT CHECK (shift IN ('Day', 'Night', 'General')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create user roles table with enum
CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'supervisor');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admins can view all profiles and roles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create checklists table
CREATE TABLE public.checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  shift TEXT CHECK (shift IN ('Day', 'Night')),
  module1_data JSONB DEFAULT '{}',
  module2_data JSONB DEFAULT '{}',
  module3_data JSONB DEFAULT '{}',
  module4_data JSONB DEFAULT '{}',
  completion_percentage INTEGER DEFAULT 0,
  flagged_issues_count INTEGER DEFAULT 0,
  start_time TIMESTAMPTZ,
  completion_time TIMESTAMPTZ,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'submitted')) DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on checklists
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

-- Checklists policies
CREATE POLICY "Users can view own checklists" ON public.checklists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own checklists" ON public.checklists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklists" ON public.checklists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all checklists" ON public.checklists
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create flagged issues table
CREATE TABLE public.flagged_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_code TEXT UNIQUE NOT NULL,
  checklist_id UUID REFERENCES public.checklists(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  module TEXT NOT NULL,
  section TEXT NOT NULL,
  item TEXT NOT NULL,
  unit TEXT,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  status TEXT CHECK (status IN ('reported', 'acknowledged', 'in_progress', 'resolved')) DEFAULT 'reported',
  assigned_to TEXT,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on flagged_issues
ALTER TABLE public.flagged_issues ENABLE ROW LEVEL SECURITY;

-- Flagged issues policies
CREATE POLICY "Users can view own issues" ON public.flagged_issues
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own issues" ON public.flagged_issues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all issues" ON public.flagged_issues
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all issues" ON public.flagged_issues
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Create interval reminders table
CREATE TABLE public.interval_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reminder_type TEXT CHECK (reminder_type IN ('15day', 'monthly')) NOT NULL,
  reminder_key TEXT NOT NULL,
  description TEXT NOT NULL,
  last_completed DATE,
  next_due DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'due_soon', 'overdue', 'completed')) DEFAULT 'pending',
  notification_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, reminder_type, reminder_key)
);

-- Enable RLS on interval_reminders
ALTER TABLE public.interval_reminders ENABLE ROW LEVEL SECURITY;

-- Interval reminders policies
CREATE POLICY "Users can view own reminders" ON public.interval_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reminders" ON public.interval_reminders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reminders" ON public.interval_reminders
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create transformer logs table
CREATE TABLE public.transformer_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  transformer_number INTEGER CHECK (transformer_number IN (1, 2)) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hour INTEGER CHECK (hour >= 0 AND hour <= 23) NOT NULL,
  active_power NUMERIC(10, 2),
  reactive_power NUMERIC(10, 2),
  frequency NUMERIC(5, 2),
  voltage_r NUMERIC(10, 2),
  voltage_y NUMERIC(10, 2),
  voltage_b NUMERIC(10, 2),
  current_r NUMERIC(10, 2),
  current_y NUMERIC(10, 2),
  current_b NUMERIC(10, 2),
  oil_temperature NUMERIC(5, 2),
  winding_temperature NUMERIC(5, 2),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(transformer_number, date, hour)
);

-- Enable RLS on transformer_logs
ALTER TABLE public.transformer_logs ENABLE ROW LEVEL SECURITY;

-- Transformer logs policies
CREATE POLICY "Users can view all transformer logs" ON public.transformer_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create transformer logs" ON public.transformer_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transformer logs" ON public.transformer_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transformer logs" ON public.transformer_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklists_updated_at
  BEFORE UPDATE ON public.checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flagged_issues_updated_at
  BEFORE UPDATE ON public.flagged_issues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interval_reminders_updated_at
  BEFORE UPDATE ON public.interval_reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transformer_logs_updated_at
  BEFORE UPDATE ON public.transformer_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name, employee_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'employee_id', NULL)
  );
  
  -- Assign operator role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'operator');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for checklist photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'checklist-media',
  'checklist-media',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/webm', 'video/mp4', 'video/quicktime']
);

-- Storage policies for checklist media
CREATE POLICY "Users can upload own media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'checklist-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own media" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'checklist-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all media" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'checklist-media' AND
    public.has_role(auth.uid(), 'admin')
  );