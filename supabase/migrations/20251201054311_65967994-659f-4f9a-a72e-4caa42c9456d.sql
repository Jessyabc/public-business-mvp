
-- Ensure admin users can post any type of post without restrictions
-- Drop and recreate the admin policy to ensure it takes precedence

-- First, ensure the is_admin function exists and is correct
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Drop existing admin policy on posts
DROP POLICY IF EXISTS admin_all_posts ON public.posts;

-- Create a permissive admin policy that allows all operations
CREATE POLICY admin_all_posts
ON public.posts
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Also update the author_update_post policy to allow admins to bypass the business insight restriction
DROP POLICY IF EXISTS author_update_post ON public.posts;

CREATE POLICY author_update_post
ON public.posts
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() 
  OR is_admin()
)
WITH CHECK (
  -- Admins can update anything
  is_admin() 
  OR
  -- Regular users must follow type-specific rules
  CASE
    WHEN type = 'insight' THEN (
      visibility = 'my_business' 
      AND mode = 'business' 
      AND org_id IS NOT NULL 
      AND (is_org_member(org_id) OR is_admin())
    )
    ELSE true
  END
);

COMMENT ON POLICY admin_all_posts ON public.posts IS 
  'Admins have full access to all posts regardless of type, visibility, or org membership';
