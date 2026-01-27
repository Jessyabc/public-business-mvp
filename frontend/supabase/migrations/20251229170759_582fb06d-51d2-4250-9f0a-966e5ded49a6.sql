-- Add missing columns for daily thought threading
ALTER TABLE public.workspace_thoughts 
  ADD COLUMN IF NOT EXISTS day_key text,
  ADD COLUMN IF NOT EXISTS display_label text,
  ADD COLUMN IF NOT EXISTS anchored_at timestamp with time zone;

-- Backfill day_key from created_at for existing rows
UPDATE public.workspace_thoughts 
SET day_key = to_char(created_at, 'YYYY-MM-DD')
WHERE day_key IS NULL;

-- Make day_key NOT NULL with a default after backfill
ALTER TABLE public.workspace_thoughts 
  ALTER COLUMN day_key SET DEFAULT to_char(now(), 'YYYY-MM-DD'),
  ALTER COLUMN day_key SET NOT NULL;

-- Create index for efficient day-based queries
CREATE INDEX IF NOT EXISTS idx_workspace_thoughts_user_day 
ON public.workspace_thoughts(user_id, day_key DESC);

-- Create index for anchored_at ordering
CREATE INDEX IF NOT EXISTS idx_workspace_thoughts_anchored 
ON public.workspace_thoughts(user_id, anchored_at DESC NULLS LAST);