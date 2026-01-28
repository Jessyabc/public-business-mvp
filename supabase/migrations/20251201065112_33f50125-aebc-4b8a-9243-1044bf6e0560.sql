-- Migration: Enforce immutable post fields and canonical model
-- This migration adds safeguards to prevent mutation of type, kind, mode, and org_id after post creation.
-- Only content and title can be updated after creation.

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS enforce_immutable_post_fields ON public.posts;
DROP FUNCTION IF EXISTS public.enforce_immutable_post_fields();

-- Create trigger function to enforce immutable fields
CREATE OR REPLACE FUNCTION public.enforce_immutable_post_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Prevent changes to immutable fields
  IF OLD.type IS DISTINCT FROM NEW.type THEN
    RAISE EXCEPTION 'Cannot change post type after creation';
  END IF;
  
  IF OLD.kind IS DISTINCT FROM NEW.kind THEN
    RAISE EXCEPTION 'Cannot change post kind after creation';
  END IF;
  
  IF OLD.mode IS DISTINCT FROM NEW.mode THEN
    RAISE EXCEPTION 'Cannot change post mode after creation';
  END IF;
  
  IF OLD.org_id IS DISTINCT FROM NEW.org_id THEN
    RAISE EXCEPTION 'Cannot change post org_id after creation';
  END IF;
  
  IF OLD.user_id IS DISTINCT FROM NEW.user_id THEN
    RAISE EXCEPTION 'Cannot change post owner after creation';
  END IF;
  
  -- Allow changes to mutable fields
  -- content, title, body, status, visibility, metadata, counts, scores can be updated
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce immutable fields on update
CREATE TRIGGER enforce_immutable_post_fields
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_immutable_post_fields();

-- Update RLS policies for stricter enforcement

-- Drop old update policies that might allow field mutation
DROP POLICY IF EXISTS "update_own_posts" ON public.posts;
DROP POLICY IF EXISTS "author_update_post" ON public.posts;

-- Create new update policy that only allows mutable field changes
CREATE POLICY "update_own_posts_content_only" ON public.posts
  FOR UPDATE
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (
    user_id = auth.uid() OR is_admin()
  );

-- Ensure business insights have proper constraints
CREATE POLICY "update_business_insights_org_members" ON public.posts
  FOR UPDATE
  USING (
    type = 'insight' 
    AND mode = 'business' 
    AND user_id = auth.uid()
    AND org_id IS NOT NULL
    AND is_org_member(org_id)
  )
  WITH CHECK (
    type = 'insight' 
    AND mode = 'business' 
    AND user_id = auth.uid()
    AND org_id IS NOT NULL
    AND is_org_member(org_id)
  );

-- Add comment to document the canonical model
COMMENT ON TABLE public.posts IS 'Canonical post table. Immutable fields: type, kind, mode, org_id, user_id. Mutable fields: content, title, body, status, visibility, metadata, counts, scores.';

COMMENT ON COLUMN public.posts.type IS 'IMMUTABLE. Post type: brainstorm or insight';
COMMENT ON COLUMN public.posts.kind IS 'IMMUTABLE. Post kind: Spark, BusinessInsight, etc.';
COMMENT ON COLUMN public.posts.mode IS 'IMMUTABLE. Post mode: public or business';
COMMENT ON COLUMN public.posts.org_id IS 'IMMUTABLE. Organization ID for business posts. Must be null for public posts.';
COMMENT ON COLUMN public.posts.user_id IS 'IMMUTABLE. Post owner ID';
COMMENT ON COLUMN public.posts.content IS 'MUTABLE. Post content text';
COMMENT ON COLUMN public.posts.title IS 'MUTABLE. Post title';
