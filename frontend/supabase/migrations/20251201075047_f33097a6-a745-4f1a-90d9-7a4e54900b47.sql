-- Fix increment_post_shares function (previous had wrong column)
CREATE OR REPLACE FUNCTION public.increment_post_shares(p_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  UPDATE public.posts
  SET shares_count = COALESCE(shares_count, 0) + 1
  WHERE id = p_post_id;
END;
$function$;