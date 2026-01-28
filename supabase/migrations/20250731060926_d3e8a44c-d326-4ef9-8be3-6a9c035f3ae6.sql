-- Create industries table
CREATE TABLE public.industries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create departments table  
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_profiles table
CREATE TABLE public.business_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry_id UUID REFERENCES public.industries(id),
  department_id UUID REFERENCES public.departments(id),
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+')),
  phone TEXT,
  website TEXT,
  linkedin_url TEXT,
  bio TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_roles table for role-based access
CREATE TYPE public.app_role AS ENUM ('admin', 'business_user', 'public_user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'public_user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid LIMIT 1;
$$;

-- RLS Policies for industries (readable by all authenticated users)
CREATE POLICY "Industries are viewable by authenticated users" 
ON public.industries FOR SELECT 
TO authenticated 
USING (true);

-- RLS Policies for departments (readable by all authenticated users)
CREATE POLICY "Departments are viewable by authenticated users" 
ON public.departments FOR SELECT 
TO authenticated 
USING (true);

-- RLS Policies for business_profiles
CREATE POLICY "Users can view their own business profile" 
ON public.business_profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business profile" 
ON public.business_profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profile" 
ON public.business_profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all business profiles" 
ON public.business_profiles FOR SELECT 
TO authenticated 
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all business profiles" 
ON public.business_profiles FOR UPDATE 
TO authenticated 
USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user roles" 
ON public.user_roles FOR SELECT 
TO authenticated 
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage user roles" 
ON public.user_roles FOR ALL 
TO authenticated 
USING (public.get_user_role(auth.uid()) = 'admin');

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for business_profiles
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default industries
INSERT INTO public.industries (name, description) VALUES
('Technology', 'Software, hardware, and IT services'),
('Healthcare', 'Medical services, pharmaceuticals, and health tech'),
('Finance', 'Banking, insurance, and financial services'),
('Education', 'Schools, universities, and educational technology'),
('Retail', 'Consumer goods and retail services'),
('Manufacturing', 'Production and industrial manufacturing'),
('Consulting', 'Professional and business consulting services'),
('Media & Entertainment', 'Publishing, broadcasting, and entertainment'),
('Non-Profit', 'Charitable organizations and social causes'),
('Other', 'Other industries not listed above');

-- Insert default departments  
INSERT INTO public.departments (name, description) VALUES
('Engineering', 'Software development and technical roles'),
('Marketing', 'Marketing, advertising, and brand management'),
('Sales', 'Sales and business development'),
('Human Resources', 'HR, recruiting, and people operations'),
('Finance', 'Accounting, finance, and business operations'),
('Operations', 'Operations, logistics, and supply chain'),
('Product', 'Product management and strategy'),
('Design', 'UI/UX design and creative roles'),
('Customer Success', 'Customer support and success'),
('Executive', 'C-level and senior leadership'),
('Other', 'Other departments not listed above');

-- Function to automatically assign role when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'public_user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to assign default role to new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();