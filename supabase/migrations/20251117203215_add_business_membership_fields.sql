-- Add business membership fields to profiles table
-- MVP Business Membership System

-- Add columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS request_business_membership BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_business_member BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS business_profile_id UUID REFERENCES public.orgs(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_request_business_membership 
ON public.profiles(request_business_membership) 
WHERE request_business_membership = true;

CREATE INDEX IF NOT EXISTS idx_profiles_is_business_member 
ON public.profiles(is_business_member) 
WHERE is_business_member = true;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.request_business_membership IS 'Flag indicating user has requested business membership';
COMMENT ON COLUMN public.profiles.is_business_member IS 'Flag indicating user is an approved business member';
COMMENT ON COLUMN public.profiles.business_profile_id IS 'Reference to the organization (orgs table) for this business member';

