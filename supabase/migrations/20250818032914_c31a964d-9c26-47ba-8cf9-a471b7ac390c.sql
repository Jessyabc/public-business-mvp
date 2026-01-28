-- Fix critical security vulnerability: restrict profiles access to authenticated users only
-- This prevents unauthorized access to personal information

-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "rls_profiles_select" ON public.profiles;

-- Create a more secure policy that only allows authenticated users to view profiles
-- Users can see their own profile, and authenticated users can see public profiles for legitimate business features
CREATE POLICY "rls_profiles_select_secure" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Users can always see their own profile
  id = auth.uid() 
  OR 
  -- Authenticated users can see profiles that are marked as completed (opted into visibility)
  (auth.uid() IS NOT NULL AND is_completed = true)
);