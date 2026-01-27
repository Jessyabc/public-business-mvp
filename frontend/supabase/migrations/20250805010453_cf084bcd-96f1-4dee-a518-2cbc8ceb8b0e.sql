-- Drop and recreate policies that might be missing or different
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles" ON public.user_roles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ensure proper indexing
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_mode_status ON public.posts(mode, status);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);