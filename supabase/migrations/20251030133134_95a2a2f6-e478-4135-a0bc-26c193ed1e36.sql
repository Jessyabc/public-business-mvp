-- Allow admins to access open_ideas_legacy table during transition period
-- This enables the admin panel to manage legacy data

-- Drop the deny-all policies
DROP POLICY IF EXISTS "legacy_deny_select" ON public.open_ideas_legacy;
DROP POLICY IF EXISTS "legacy_deny_insert" ON public.open_ideas_legacy;
DROP POLICY IF EXISTS "legacy_deny_update" ON public.open_ideas_legacy;
DROP POLICY IF EXISTS "legacy_deny_delete" ON public.open_ideas_legacy;

-- Create admin-only policies
CREATE POLICY "legacy_admin_select" ON public.open_ideas_legacy
  FOR SELECT 
  USING (is_admin());

CREATE POLICY "legacy_admin_update" ON public.open_ideas_legacy
  FOR UPDATE 
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "legacy_admin_delete" ON public.open_ideas_legacy
  FOR DELETE 
  USING (is_admin());

-- Note: No INSERT policy - legacy table should not receive new data
-- All new submissions should go through open_ideas_intake or open_ideas_user