-- 1) Prevent duplicate likes by same user on same idea/brainstorm
CREATE UNIQUE INDEX IF NOT EXISTS idx_idea_likes_unique
ON public.idea_interactions(idea_id, user_id)
WHERE type = 'like';

-- (Optional perf) make sure we can join fast by idea_id
CREATE INDEX IF NOT EXISTS idx_idea_interactions_idea_id
ON public.idea_interactions(idea_id);

-- 2) Public-safe stats view (respects RLS via security_invoker)
-- Counts comments/likes per brainstorm. We support both link styles:
--   a) interactions.idea_id = idea_brainstorms.id
--   b) interactions.idea_id = idea_brainstorms.idea_id (the underlying open_ideas row)
CREATE OR REPLACE VIEW public.brainstorm_stats
WITH (security_invoker = on) AS
SELECT
  ib.id AS brainstorm_id,
  COUNT(*) FILTER (
    WHERE ii.type = 'comment'
      AND (ii.idea_id = ib.id OR ii.idea_id = ib.idea_id)
  ) AS comments_count,
  COUNT(*) FILTER (
    WHERE ii.type = 'like'
      AND (ii.idea_id = ib.id OR ii.idea_id = ib.idea_id)
  ) AS likes_count
FROM public.idea_brainstorms ib
LEFT JOIN public.idea_interactions ii
  ON (ii.idea_id = ib.id OR ii.idea_id = ib.idea_id)
GROUP BY ib.id;

-- Make the stats view readable (RLS on idea_brainstorms still applies)
GRANT SELECT ON public.brainstorm_stats TO anon, authenticated;

-- 3) RLS: read comments on PUBLIC brainstorms, or own items, or admin
-- We check both mapping styles (ib.id or ib.idea_id) so it works today and tomorrow.
DROP POLICY IF EXISTS idea_interactions_public_read ON public.idea_interactions;
CREATE POLICY idea_interactions_public_read
ON public.idea_interactions
FOR SELECT
TO anon, authenticated
USING (
  -- Public can read comments attached to public brainstorms
  (
    type = 'comment'
    AND EXISTS (
      SELECT 1
      FROM public.idea_brainstorms ib
      WHERE ib.is_public = true
        AND (ib.id = idea_interactions.idea_id OR ib.idea_id = idea_interactions.idea_id)
    )
  )
  -- Owners can read their own interactions
  OR (user_id = auth.uid())
  -- Admins see all
  OR public.is_admin()
);

-- 4) RLS: allow authenticated users to create their own interactions
DROP POLICY IF EXISTS idea_interactions_auth_write ON public.idea_interactions;
CREATE POLICY idea_interactions_auth_write
ON public.idea_interactions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());