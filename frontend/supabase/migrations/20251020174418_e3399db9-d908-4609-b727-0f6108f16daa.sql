-- Add theme_settings column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme_settings JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.theme_settings IS 'Custom theme configuration (colors, radii, elevation, glass effects)';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_theme_settings ON public.profiles USING GIN (theme_settings);