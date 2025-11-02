-- 1. Organization Slug Auto-Generation
-- Make slug nullable to allow auto-generation
ALTER TABLE public.orgs
ALTER COLUMN slug DROP NOT NULL;

-- Function to generate slugs automatically from org name
CREATE OR REPLACE FUNCTION public.generate_org_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to ensure slug generation before insert or update
DROP TRIGGER IF EXISTS org_slug_trigger ON public.orgs;
CREATE TRIGGER org_slug_trigger
BEFORE INSERT OR UPDATE ON public.orgs
FOR EACH ROW
EXECUTE FUNCTION public.generate_org_slug();

-- 2. Posts Table: Make body nullable since content is the primary field
ALTER TABLE public.posts
ALTER COLUMN body DROP NOT NULL;

-- Sync existing data: copy body to content where content is missing
UPDATE public.posts
SET content = COALESCE(content, body, '')
WHERE content IS NULL OR content = '';

-- Sync existing data: copy content to body where body is missing
UPDATE public.posts
SET body = COALESCE(body, content, '')
WHERE body IS NULL OR body = '';