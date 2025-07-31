-- Create posts table for both brainstorms and business insights
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('brainstorm', 'insight', 'report', 'whitepaper', 'webinar', 'video')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'my_business', 'other_businesses', 'draft')),
  mode TEXT NOT NULL CHECK (mode IN ('public', 'business')),
  industry_id UUID,
  department_id UUID,
  metadata JSONB DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  t_score INTEGER, -- For public posts
  u_score INTEGER, -- For business posts  
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
CREATE POLICY "Posts are viewable by everyone for public visibility" 
ON public.posts 
FOR SELECT 
USING (visibility = 'public' OR auth.uid() = user_id);

CREATE POLICY "Business posts are viewable by business users" 
ON public.posts 
FOR SELECT 
USING (
  visibility = 'public' 
  OR auth.uid() = user_id 
  OR (mode = 'business' AND visibility IN ('other_businesses', 'my_business') AND auth.uid() IS NOT NULL)
);

CREATE POLICY "Users can create their own posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_posts_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_type ON public.posts(type);
CREATE INDEX idx_posts_visibility ON public.posts(visibility);
CREATE INDEX idx_posts_mode ON public.posts(mode);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_status ON public.posts(status);