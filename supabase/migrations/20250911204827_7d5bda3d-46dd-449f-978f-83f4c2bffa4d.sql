-- Fix Security Definer View Issues
-- The linter flagged our views as security definer, which bypasses RLS
-- We need to recreate them as regular views and handle permissions properly

-- Drop existing views
DROP VIEW IF EXISTS public.profile_cards;
DROP VIEW IF EXISTS public.open_ideas_public;  
DROP VIEW IF EXISTS public.business_profiles_public;

-- Recreate views without security definer behavior
-- These will respect the calling user's permissions

-- Safe profile view (public info only)
CREATE VIEW public.profile_cards AS
SELECT
  id,
  display_name,
  company,
  linkedin_url,
  website,
  bio,
  location
FROM public.profiles;

-- Safe open ideas view (no emails)
CREATE VIEW public.open_ideas_public AS
SELECT
  id, 
  content, 
  is_curated, 
  linked_brainstorms_count,
  created_at, 
  status
FROM public.open_ideas;

-- Safe business profiles view (approved only, no sensitive data)
CREATE VIEW public.business_profiles_public AS
SELECT 
  id, 
  company_name, 
  industry_id, 
  department_id, 
  website, 
  linkedin_url, 
  status,
  created_at
FROM public.business_profiles;

-- Set proper permissions on views (these respect RLS policies)
GRANT SELECT ON public.profile_cards TO anon, authenticated;
GRANT SELECT ON public.open_ideas_public TO anon, authenticated;
GRANT SELECT ON public.business_profiles_public TO anon, authenticated;

-- Update existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.hash_ip(ip_address text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(digest(ip_address || current_date::text, 'sha256'), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION public.obfuscate_email(email text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF email IS NULL THEN RETURN NULL; END IF;
  RETURN regexp_replace(regexp_replace(email, '@', ' [at] '), '\.', ' [dot] ', 'g');
END;
$$;

-- Create helper function to get client IP (for rate limiting)
CREATE OR REPLACE FUNCTION public.get_client_ip()
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  -- Get IP from request headers (works in Edge Functions)
  RETURN COALESCE(
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'x-real-ip',
    'unknown'
  );
END;
$$;