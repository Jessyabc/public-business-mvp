-- Fix database security vulnerabilities

-- 1. Update database functions to use proper search_path for security
CREATE OR REPLACE FUNCTION public.get_client_ip()
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Get IP from request headers (works in Edge Functions)
  RETURN COALESCE(
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'x-real-ip',
    'unknown'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.obfuscate_email(email text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF email IS NULL THEN RETURN NULL; END IF;
  RETURN regexp_replace(regexp_replace(email, '@', ' [at] '), '\.', ' [dot] ', 'g');
END;
$function$;

CREATE OR REPLACE FUNCTION public.hash_ip(ip_address text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN encode(digest(ip_address || current_date::text, 'sha256'), 'hex');
END;
$function$;

-- 2. Tighten RLS policies for sensitive admin-only tables

-- Ensure contact_requests is admin-only
DROP POLICY IF EXISTS "contact_requests_admin_only" ON public.contact_requests;
CREATE POLICY "contact_requests_admin_only" 
ON public.contact_requests 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Ensure email_subscriptions has proper admin access
DROP POLICY IF EXISTS "email_subscriptions_admin_read" ON public.email_subscriptions;
DROP POLICY IF EXISTS "email_subscriptions_admin_update" ON public.email_subscriptions; 
DROP POLICY IF EXISTS "email_subscriptions_admin_delete" ON public.email_subscriptions;

CREATE POLICY "email_subscriptions_admin_read" 
ON public.email_subscriptions 
FOR SELECT 
USING (is_admin());

CREATE POLICY "email_subscriptions_admin_update" 
ON public.email_subscriptions 
FOR UPDATE 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "email_subscriptions_admin_delete" 
ON public.email_subscriptions 
FOR DELETE 
USING (is_admin());

-- Ensure leads table is admin-only for read access
DROP POLICY IF EXISTS "leads_admin_read_only" ON public.leads;
CREATE POLICY "leads_admin_read_only" 
ON public.leads 
FOR SELECT 
USING (is_admin());

-- 3. Ensure open_ideas admin access for curation
DROP POLICY IF EXISTS "open_ideas_admin_curate" ON public.open_ideas;
CREATE POLICY "open_ideas_admin_curate" 
ON public.open_ideas 
FOR UPDATE 
USING (is_admin()) 
WITH CHECK (is_admin());

-- 4. Add audit logging for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id) NOT NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_audit_log_admin_only" 
ON public.admin_audit_log 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());