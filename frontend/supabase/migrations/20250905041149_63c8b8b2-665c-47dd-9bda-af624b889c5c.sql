-- Create enum for post kinds
CREATE TYPE post_kind AS ENUM (
  'open_idea',
  'brainstorm', 
  'brainstorm_continue',
  'insight',
  'white_paper',
  'video_brainstorm',
  'video_insight'
);

-- Create enum for post status
CREATE TYPE post_status AS ENUM ('pending', 'approved', 'rejected', 'archived');

-- Create enum for post visibility
CREATE TYPE post_visibility AS ENUM ('public', 'unlisted', 'private');

-- Create enum for interaction types
CREATE TYPE interaction_type AS ENUM ('branch', 'reply', 'like', 'share', 'view');

-- Create the unified posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kind post_kind NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  author_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  represented_org_id UUID,
  parent_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  status post_status NOT NULL DEFAULT 'pending',
  visibility post_visibility NOT NULL DEFAULT 'public',
  tags TEXT[] DEFAULT '{}',
  media_url TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT posts_title_check CHECK (
    CASE 
      WHEN kind = 'open_idea' THEN title IS NULL
      WHEN kind IN ('insight', 'white_paper') THEN title IS NOT NULL AND length(title) BETWEEN 3 AND 120
      ELSE TRUE
    END
  ),
  CONSTRAINT posts_content_length_check CHECK (
    CASE 
      WHEN kind = 'open_idea' THEN length(content) BETWEEN 20 AND 600
      WHEN kind = 'brainstorm' THEN length(content) BETWEEN 80 AND 2500
      WHEN kind = 'brainstorm_continue' THEN length(content) BETWEEN 40 AND 1800
      WHEN kind = 'insight' THEN length(content) BETWEEN 300 AND 6000
      WHEN kind = 'white_paper' THEN length(content) BETWEEN 800 AND 15000
      ELSE TRUE
    END
  ),
  CONSTRAINT posts_parent_check CHECK (
    CASE 
      WHEN kind = 'brainstorm_continue' THEN parent_post_id IS NOT NULL
      WHEN kind IN ('video_brainstorm', 'video_insight') THEN media_url IS NOT NULL
      ELSE TRUE
    END
  ),
  CONSTRAINT posts_tags_limit CHECK (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 8)
);

-- Create post_interactions table
CREATE TABLE public.post_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  type interaction_type NOT NULL,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification_subscriptions table  
CREATE TABLE public.notification_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  notify_on_interaction BOOLEAN NOT NULL DEFAULT true,
  subscribe_newsletter BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(email, post_id)
);

-- Enable RLS on all tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger for posts
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for posts
CREATE POLICY "Posts are viewable by everyone if approved or by owner/moderator" 
  ON public.posts FOR SELECT 
  USING (
    status = 'approved' 
    OR author_user_id = auth.uid() 
    OR is_admin(auth.uid())
  );

CREATE POLICY "Users can insert their own posts" 
  ON public.posts FOR INSERT 
  WITH CHECK (author_user_id = auth.uid() OR author_user_id IS NULL);

CREATE POLICY "Users can update their own posts or admins can update any" 
  ON public.posts FOR UPDATE 
  USING (author_user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can delete their own posts or admins can delete any" 
  ON public.posts FOR DELETE 
  USING (author_user_id = auth.uid() OR is_admin(auth.uid()));

-- RLS Policies for post_interactions
CREATE POLICY "Post interactions are viewable for approved posts" 
  ON public.post_interactions FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.posts 
    WHERE id = post_interactions.post_id 
    AND (status = 'approved' OR author_user_id = auth.uid() OR is_admin(auth.uid()))
  ));

CREATE POLICY "Anyone can create interactions" 
  ON public.post_interactions FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for notification_subscriptions
CREATE POLICY "Users can view their own subscriptions or admins can view all" 
  ON public.notification_subscriptions FOR SELECT 
  USING (
    (auth.jwt() ->> 'email') = email 
    OR is_admin(auth.uid())
  );

CREATE POLICY "Anyone can create subscriptions" 
  ON public.notification_subscriptions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own subscriptions" 
  ON public.notification_subscriptions FOR UPDATE 
  USING ((auth.jwt() ->> 'email') = email OR is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_posts_status_created ON public.posts (status, created_at DESC);
CREATE INDEX idx_posts_kind_status ON public.posts (kind, status);
CREATE INDEX idx_posts_author ON public.posts (author_user_id);
CREATE INDEX idx_posts_parent ON public.posts (parent_post_id);
CREATE INDEX idx_post_interactions_post ON public.post_interactions (post_id);
CREATE INDEX idx_notification_subscriptions_post ON public.notification_subscriptions (post_id);
CREATE INDEX idx_notification_subscriptions_email ON public.notification_subscriptions (email);

-- Create function to validate post data
CREATE OR REPLACE FUNCTION public.validate_post_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate parent_post_id for continuations
  IF NEW.kind = 'brainstorm_continue' AND NEW.parent_post_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.posts 
      WHERE id = NEW.parent_post_id 
      AND kind IN ('brainstorm', 'brainstorm_continue')
    ) THEN
      RAISE EXCEPTION 'Invalid parent_post_id for brainstorm_continue';
    END IF;
  END IF;
  
  -- Sanitize tags array
  IF NEW.tags IS NOT NULL THEN
    NEW.tags := array(SELECT DISTINCT trim(unnest(NEW.tags)) WHERE trim(unnest(NEW.tags)) != '');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for post validation
CREATE TRIGGER validate_post_data_trigger
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_post_data();

-- Create function to handle post interactions
CREATE OR REPLACE FUNCTION public.handle_post_interaction(
  p_post_id UUID,
  p_type TEXT,
  p_actor_user_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  interaction_id UUID;
  post_exists BOOLEAN;
BEGIN
  -- Check if post exists and is approved
  SELECT EXISTS(
    SELECT 1 FROM public.posts 
    WHERE id = p_post_id AND status = 'approved'
  ) INTO post_exists;
  
  IF NOT post_exists THEN
    RAISE EXCEPTION 'Post not found or not approved';
  END IF;
  
  -- Insert interaction
  INSERT INTO public.post_interactions (post_id, type, actor_user_id)
  VALUES (p_post_id, p_type::interaction_type, p_actor_user_id)
  RETURNING id INTO interaction_id;
  
  -- TODO: Trigger notifications for subscribed users
  -- This can be implemented later with a notification queue
  
  RETURN interaction_id;
END;
$$;