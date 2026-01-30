-- Add ip_hash column to post_interactions for proper rate limiting
ALTER TABLE public.post_interactions 
ADD COLUMN IF NOT EXISTS ip_hash text;

-- Create index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_post_interactions_rate_limit 
ON public.post_interactions (ip_hash, created_at) 
WHERE user_id IS NULL;

-- Add comment explaining the column
COMMENT ON COLUMN public.post_interactions.ip_hash IS 'Hashed IP address for anonymous interaction rate limiting';