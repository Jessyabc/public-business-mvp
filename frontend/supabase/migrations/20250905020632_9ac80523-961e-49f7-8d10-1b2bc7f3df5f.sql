-- Update open_ideas table to support the new landing page features
ALTER TABLE public.open_ideas ADD COLUMN IF NOT EXISTS notify_on_interaction boolean DEFAULT false;
ALTER TABLE public.open_ideas ADD COLUMN IF NOT EXISTS subscribe_newsletter boolean DEFAULT false;
ALTER TABLE public.open_ideas ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.open_ideas ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.open_ideas ADD COLUMN IF NOT EXISTS represented_org_id uuid;
ALTER TABLE public.open_ideas ADD COLUMN IF NOT EXISTS ip_hash text;

-- Create idea_interactions table for tracking engagement
CREATE TABLE IF NOT EXISTS public.idea_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid REFERENCES public.open_ideas(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on idea_interactions
ALTER TABLE public.idea_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for idea_interactions
CREATE POLICY "Allow reading interactions for approved ideas" ON public.idea_interactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.open_ideas 
    WHERE id = idea_interactions.idea_id 
    AND status = 'approved'
  )
);

CREATE POLICY "Allow inserting interactions" ON public.idea_interactions
FOR INSERT WITH CHECK (true);

-- Create email_subscriptions table
CREATE TABLE IF NOT EXISTS public.email_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_to_news boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on email_subscriptions  
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for email_subscriptions (admin only)
CREATE POLICY "Admin can manage email subscriptions" ON public.email_subscriptions
FOR ALL USING (is_admin(auth.uid()));

-- Update open_ideas policies to support status filtering
DROP POLICY IF EXISTS "read_open_ideas" ON public.open_ideas;
CREATE POLICY "read_open_ideas_approved" ON public.open_ideas
FOR SELECT USING (status = 'approved' OR auth.uid() IS NOT NULL);

-- Create trigger for updating timestamps
CREATE OR REPLACE TRIGGER update_email_subscriptions_updated_at
BEFORE UPDATE ON public.email_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();