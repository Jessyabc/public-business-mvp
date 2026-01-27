-- Create open_ideas table for anonymous/attributed sparks
CREATE TABLE public.open_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL CHECK (length(content) >= 10 AND length(content) <= 280),
  email TEXT NULL,
  notify_on_interaction BOOLEAN NOT NULL DEFAULT false,
  subscribe_newsletter BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  represented_org_id UUID NULL,
  ip_hash TEXT NULL, -- For rate limiting
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create idea_interactions table for future notification triggers
CREATE TABLE public.idea_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.open_ideas(id) ON DELETE CASCADE,
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('reply', 'branch', 'like')),
  content TEXT NULL, -- For replies/branches
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_subscriptions table for newsletter management
CREATE TABLE public.email_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
  source TEXT DEFAULT 'open_idea_composer' -- Track where subscription came from
);

-- Create analytics_events table for tracking
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NULL,
  properties JSONB DEFAULT '{}',
  ip_hash TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.open_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for open_ideas
CREATE POLICY "Public can read approved open ideas" 
ON public.open_ideas 
FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Users can read their own open ideas" 
ON public.open_ideas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own open ideas" 
ON public.open_ideas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own open ideas" 
ON public.open_ideas 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for idea_interactions
CREATE POLICY "Users can read interactions on approved ideas" 
ON public.idea_interactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.open_ideas 
    WHERE id = idea_interactions.idea_id 
    AND status = 'approved'
  )
);

CREATE POLICY "Users can create interactions on approved ideas" 
ON public.idea_interactions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.open_ideas 
    WHERE id = idea_interactions.idea_id 
    AND status = 'approved'
  )
);

CREATE POLICY "Users can update their own interactions" 
ON public.idea_interactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for email_subscriptions
CREATE POLICY "Users can manage their own email subscriptions" 
ON public.email_subscriptions 
FOR ALL 
USING (true) -- Will be restricted by edge function validation
WITH CHECK (true);

-- RLS Policies for analytics_events
CREATE POLICY "Users can insert analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true); -- Anonymous analytics allowed

CREATE POLICY "Users can read their own analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for performance
CREATE INDEX idx_open_ideas_status_created ON public.open_ideas(status, created_at DESC);
CREATE INDEX idx_open_ideas_user_id ON public.open_ideas(user_id);
CREATE INDEX idx_open_ideas_ip_hash ON public.open_ideas(ip_hash);
CREATE INDEX idx_idea_interactions_idea_id ON public.idea_interactions(idea_id);
CREATE INDEX idx_analytics_events_name_created ON public.analytics_events(event_name, created_at DESC);

-- Create trigger for updating timestamps
CREATE TRIGGER update_open_ideas_updated_at
BEFORE UPDATE ON public.open_ideas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get client IP hash (for rate limiting)
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