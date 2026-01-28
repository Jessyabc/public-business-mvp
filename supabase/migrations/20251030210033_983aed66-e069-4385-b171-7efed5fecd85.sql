-- 1️⃣ Create ENUM post_kind for the canonical post system
DO $$ BEGIN
  CREATE TYPE public.post_kind AS ENUM ('Spark', 'BusinessInsight', 'Insight');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2️⃣ Add kind column to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS kind public.post_kind NOT NULL DEFAULT 'Spark';

-- 3️⃣ org_id already exists, ensure it references orgs table
-- (already present in schema, no action needed)

-- 4️⃣ Add body column as alias to content for new system
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS body text;

-- Update body from content where body is null
UPDATE public.posts SET body = content WHERE body IS NULL;

-- Make body NOT NULL after backfill
ALTER TABLE public.posts ALTER COLUMN body SET NOT NULL;

-- 5️⃣ RLS already enabled on public.posts

-- 6️⃣ Create comprehensive RLS policies for canonical post system
DROP POLICY IF EXISTS "read_published_posts" ON public.posts;
CREATE POLICY "read_published_posts"
ON public.posts
FOR SELECT
TO authenticated
USING (status = 'active');

DROP POLICY IF EXISTS "insert_own_posts" ON public.posts;
CREATE POLICY "insert_own_posts"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "update_own_posts" ON public.posts;
CREATE POLICY "update_own_posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_all_posts" ON public.posts;
CREATE POLICY "admin_all_posts"
ON public.posts
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 7️⃣ Create function to create posts in the canonical system
CREATE OR REPLACE FUNCTION public.create_post(
  p_kind text,
  p_title text,
  p_body text,
  p_org_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.posts (
    id, 
    user_id, 
    kind, 
    title, 
    body, 
    content,
    type,
    mode,
    status, 
    org_id,
    visibility
  )
  VALUES (
    gen_random_uuid(), 
    auth.uid(), 
    p_kind::public.post_kind, 
    p_title, 
    p_body,
    p_body,
    CASE 
      WHEN p_kind = 'Spark' THEN 'brainstorm'
      WHEN p_kind IN ('BusinessInsight', 'Insight') THEN 'insight'
      ELSE 'brainstorm'
    END,
    CASE 
      WHEN p_kind IN ('BusinessInsight', 'Insight') THEN 'business'
      ELSE 'public'
    END,
    'active',
    p_org_id,
    CASE 
      WHEN p_kind = 'Spark' THEN 'public'
      WHEN p_kind IN ('BusinessInsight', 'Insight') THEN 'my_business'
      ELSE 'public'
    END
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

-- 8️⃣ Create views for different post types
CREATE OR REPLACE VIEW public.public_posts_view AS
SELECT * FROM public.posts 
WHERE status = 'active' AND kind = 'Spark';

CREATE OR REPLACE VIEW public.business_posts_view AS
SELECT * FROM public.posts 
WHERE kind = 'BusinessInsight';

-- my_posts_view already exists, update it to include kind
CREATE OR REPLACE VIEW public.my_posts_view AS
SELECT * FROM public.posts 
WHERE user_id = auth.uid();

-- 9️⃣ Grant SELECT permissions on views
GRANT SELECT ON public.public_posts_view TO authenticated, anon;
GRANT SELECT ON public.business_posts_view TO authenticated, anon;
GRANT SELECT ON public.my_posts_view TO authenticated;