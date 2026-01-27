-- Admin RPCs for open ideas moderation with rate limiting and telemetry

-- Log table for admin open idea actions
CREATE TABLE IF NOT EXISTS public.admin_open_idea_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL,
  target_id uuid,
  source text,
  duration_ms integer,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_open_idea_actions_actor_created_idx
  ON public.admin_open_idea_actions (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_open_idea_actions_action_created_idx
  ON public.admin_open_idea_actions (action_type, created_at DESC);

-- Helper to enforce per-admin rate limits
CREATE OR REPLACE FUNCTION public.enforce_admin_open_idea_rate_limit(
  p_actor uuid,
  p_action text,
  p_max_actions int DEFAULT 60
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_recent_count int;
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Forbidden - admin role required';
  END IF;

  SELECT COUNT(*) INTO v_recent_count
  FROM public.admin_open_idea_actions
  WHERE actor_id = p_actor
    AND action_type = p_action
    AND created_at > now() - interval '1 minute';

  IF v_recent_count >= p_max_actions THEN
    RAISE EXCEPTION 'Rate limit exceeded for %', p_action;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.enforce_admin_open_idea_rate_limit(uuid, text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enforce_admin_open_idea_rate_limit(uuid, text, int) TO authenticated;

-- Combined pending list across intake + user tables
CREATE OR REPLACE FUNCTION public.admin_list_pending(p_limit integer DEFAULT 200)
RETURNS TABLE(
  id uuid,
  source text,
  text text,
  status text,
  created_at timestamptz,
  user_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_started_at timestamptz := clock_timestamp();
  v_effective_limit integer := LEAST(GREATEST(COALESCE(p_limit, 200), 1), 500);
BEGIN
  PERFORM public.enforce_admin_open_idea_rate_limit(v_actor, 'list_pending', 30);

  RETURN QUERY
    SELECT * FROM (
      SELECT id, 'intake'::text AS source, text, status::text, created_at, NULL::uuid AS user_id
      FROM public.open_ideas_intake
      WHERE status = 'pending'
      UNION ALL
      SELECT id, 'user'::text AS source, text, status::text, created_at, user_id
      FROM public.open_ideas_user
      WHERE status = 'pending'
    ) pending
    ORDER BY created_at DESC
    LIMIT v_effective_limit;

  INSERT INTO public.admin_open_idea_actions(actor_id, action_type, duration_ms, success)
  VALUES (
    v_actor,
    'list_pending',
    CEIL(EXTRACT(EPOCH FROM (clock_timestamp() - v_started_at)) * 1000)::int,
    true
  );
END;
$$;
REVOKE ALL ON FUNCTION public.admin_list_pending(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_pending(integer) TO authenticated;

-- Approve an intake submission
CREATE OR REPLACE FUNCTION public.admin_approve_intake(p_id uuid)
RETURNS public.open_ideas_intake
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_started_at timestamptz := clock_timestamp();
  v_result public.open_ideas_intake%rowtype;
BEGIN
  PERFORM public.enforce_admin_open_idea_rate_limit(v_actor, 'approve_intake', 60);

  UPDATE public.open_ideas_intake
  SET status = 'approved'
  WHERE id = p_id
  RETURNING * INTO v_result;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  INSERT INTO public.admin_open_idea_actions(actor_id, action_type, target_id, source, duration_ms, success)
  VALUES (
    v_actor,
    'approve_intake',
    p_id,
    'intake',
    CEIL(EXTRACT(EPOCH FROM (clock_timestamp() - v_started_at)) * 1000)::int,
    true
  );

  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.admin_open_idea_actions(actor_id, action_type, target_id, source, duration_ms, success, error_message)
  VALUES (
    v_actor,
    'approve_intake',
    p_id,
    'intake',
    CEIL(EXTRACT(EPOCH FROM (clock_timestamp() - v_started_at)) * 1000)::int,
    false,
    SQLERRM
  );
  RAISE;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_approve_intake(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_approve_intake(uuid) TO authenticated;

-- Approve an authenticated submission
CREATE OR REPLACE FUNCTION public.admin_approve_user(p_id uuid)
RETURNS public.open_ideas_user
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_started_at timestamptz := clock_timestamp();
  v_result public.open_ideas_user%rowtype;
BEGIN
  PERFORM public.enforce_admin_open_idea_rate_limit(v_actor, 'approve_user', 60);

  UPDATE public.open_ideas_user
  SET status = 'approved'
  WHERE id = p_id
  RETURNING * INTO v_result;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  INSERT INTO public.admin_open_idea_actions(actor_id, action_type, target_id, source, duration_ms, success)
  VALUES (
    v_actor,
    'approve_user',
    p_id,
    'user',
    CEIL(EXTRACT(EPOCH FROM (clock_timestamp() - v_started_at)) * 1000)::int,
    true
  );

  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.admin_open_idea_actions(actor_id, action_type, target_id, source, duration_ms, success, error_message)
  VALUES (
    v_actor,
    'approve_user',
    p_id,
    'user',
    CEIL(EXTRACT(EPOCH FROM (clock_timestamp() - v_started_at)) * 1000)::int,
    false,
    SQLERRM
  );
  RAISE;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_approve_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_approve_user(uuid) TO authenticated;
