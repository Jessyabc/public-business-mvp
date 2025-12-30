-- Create user_settings table for persistent preferences
CREATE TABLE public.user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- User can only access their own settings
CREATE POLICY "user_settings_owner_all"
  ON public.user_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Create org_requests table for business account requests
CREATE TABLE public.org_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_name text NOT NULL,
  org_description text,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.org_requests ENABLE ROW LEVEL SECURITY;

-- User can view their own requests
CREATE POLICY "org_requests_owner_read"
  ON public.org_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- User can insert their own requests
CREATE POLICY "org_requests_owner_insert"
  ON public.org_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can do everything
CREATE POLICY "org_requests_admin_all"
  ON public.org_requests
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Trigger to update updated_at
CREATE TRIGGER update_org_requests_updated_at
  BEFORE UPDATE ON public.org_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Create index for efficient lookups
CREATE INDEX idx_org_requests_user_id ON public.org_requests(user_id);
CREATE INDEX idx_org_requests_status ON public.org_requests(status);