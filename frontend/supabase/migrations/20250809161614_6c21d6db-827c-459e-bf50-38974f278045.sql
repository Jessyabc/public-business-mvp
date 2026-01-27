-- Fix RLS policies to prevent recursive issues and improve security

-- Drop problematic policies that reference other tables
DROP POLICY IF EXISTS "must complete profileupdate" ON public.business_profiles;
DROP POLICY IF EXISTS "Only completed profiles can view posts" ON public.posts;

-- Add proper admin policies for departments and industries
CREATE POLICY "Admins can manage departments" 
ON public.departments 
FOR ALL 
TO authenticated 
USING (get_user_role(auth.uid()) = 'admin'::app_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::app_role);

CREATE POLICY "Admins can manage industries" 
ON public.industries 
FOR ALL 
TO authenticated 
USING (get_user_role(auth.uid()) = 'admin'::app_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::app_role);

-- Improve business_profiles policies
DROP POLICY IF EXISTS "Admins can update all business profiles" ON public.business_profiles;
DROP POLICY IF EXISTS "Admins can view all business profiles" ON public.business_profiles;

CREATE POLICY "Admins can manage all business profiles" 
ON public.business_profiles 
FOR ALL 
TO authenticated 
USING (get_user_role(auth.uid()) = 'admin'::app_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::app_role);

-- Add policy for business members to view other business profiles
CREATE POLICY "Business members can view business profiles" 
ON public.business_profiles 
FOR SELECT 
TO authenticated 
USING (
  status = 'approved' AND (
    get_user_role(auth.uid()) = 'business_member'::app_role OR 
    get_user_role(auth.uid()) = 'admin'::app_role
  )
);

-- Improve posts policies by removing profile completion requirement
-- and making it more straightforward
DROP POLICY IF EXISTS "Public posts are viewable by everyone, private posts by owners" ON public.posts;

CREATE POLICY "Posts visibility policy" 
ON public.posts 
FOR SELECT 
TO authenticated 
USING (
  -- Public posts are viewable by everyone authenticated
  (visibility = 'public'::text AND status = 'active'::text) OR
  -- Users can always see their own posts
  (auth.uid() = user_id) OR
  -- Business members can see business posts with appropriate visibility
  (
    mode = 'business'::text AND 
    status = 'active'::text AND
    visibility IN ('other_businesses'::text, 'my_business'::text) AND
    (get_user_role(auth.uid()) = 'business_member'::app_role OR get_user_role(auth.uid()) = 'admin'::app_role)
  )
);

-- Improve business posts creation policy
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;

CREATE POLICY "Users can create posts" 
ON public.posts 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = user_id AND
  (
    -- Public users can create public brainstorms
    (type = 'brainstorm'::text AND mode = 'public'::text AND visibility = 'public'::text) OR
    -- Business members can create business posts
    (mode = 'business'::text AND (get_user_role(auth.uid()) = 'business_member'::app_role OR get_user_role(auth.uid()) = 'admin'::app_role))
  )
);