-- Add missing columns and policies for existing tables

-- Check if analytics_events table exists, if not create it
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NULL,
  properties JSONB DEFAULT '{}',
  ip_hash TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on analytics_events if not already enabled
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics_events if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Users can insert analytics events') THEN
    CREATE POLICY "Users can insert analytics events" 
    ON public.analytics_events 
    FOR INSERT 
    WITH CHECK (true); -- Anonymous analytics allowed
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Users can read their own analytics events') THEN
    CREATE POLICY "Users can read their own analytics events" 
    ON public.analytics_events 
    FOR SELECT 
    USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

-- Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created ON public.analytics_events(event_name, created_at DESC);

-- Create function to get client IP hash (for rate limiting) if it doesn't exist
CREATE OR REPLACE FUNCTION public.hash_ip(ip_address TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(digest(ip_address || current_date::text, 'sha256'), 'hex');
END;
$$;