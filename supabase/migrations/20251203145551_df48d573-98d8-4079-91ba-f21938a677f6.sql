-- Admin function to list pending open ideas from both intake and user tables
CREATE OR REPLACE FUNCTION public.admin_list_pending(p_limit integer DEFAULT 200)
RETURNS TABLE(
  id uuid,
  text text,
  source text,
  status text,
  user_id uuid,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    text,
    'intake'::text as source,
    status::text,
    NULL::uuid as user_id,
    created_at
  FROM public.open_ideas_intake
  WHERE status = 'pending'
  
  UNION ALL
  
  SELECT 
    id,
    text,
    'user'::text as source,
    status::text,
    user_id,
    created_at
  FROM public.open_ideas_user
  WHERE status = 'pending'
  
  ORDER BY created_at DESC
  LIMIT COALESCE(p_limit, 200);
$$;

-- Admin function to approve intake ideas
CREATE OR REPLACE FUNCTION public.admin_approve_intake(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  UPDATE public.open_ideas_intake
  SET status = 'approved'
  WHERE id = p_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Idea not found or already processed');
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Idea approved');
END;
$$;

-- Admin function to approve user ideas
CREATE OR REPLACE FUNCTION public.admin_approve_user(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  UPDATE public.open_ideas_user
  SET status = 'approved'
  WHERE id = p_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Idea not found or already processed');
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Idea approved');
END;
$$;