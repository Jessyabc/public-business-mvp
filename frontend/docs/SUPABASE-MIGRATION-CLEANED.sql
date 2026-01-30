-- =====================================================
-- Account Types & Membership Flow - Cleaned Migration
-- Idempotent and safe to run
-- =====================================================

-- PART 1: Add status column to orgs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orgs' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.orgs
    ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'
    CHECK (status IN ('pending', 'approved', 'rejected'));

    UPDATE public.orgs SET status = 'approved' WHERE status IS NULL;
  END IF;
END $$;

-- Add website column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orgs' AND column_name = 'website'
  ) THEN
    ALTER TABLE public.orgs ADD COLUMN website TEXT;
  END IF;
END $$;

-- Add industry_id column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orgs' AND column_name = 'industry_id'
  ) THEN
    ALTER TABLE public.orgs
    ADD COLUMN industry_id UUID REFERENCES public.industries(id);
  END IF;
END $$;

-- Add company_size column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orgs' AND column_name = 'company_size'
  ) THEN
    ALTER TABLE public.orgs
    ADD COLUMN company_size TEXT
    CHECK (company_size IN ('1-10','11-50','51-200','201-1000','1000+') OR company_size IS NULL);
  END IF;
END $$;

-- PART 2: Ensure unique constraint on org_members(org_id, user_id) exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.org_members'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) LIKE '%(org_id, user_id)%'
  ) THEN
    ALTER TABLE public.org_members
      ADD CONSTRAINT org_members_org_user_unique UNIQUE (org_id, user_id);
  END IF;
END $$;

-- PART 3: Add FK from org_members.user_id to auth.users(id) if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.org_members'::regclass
      AND contype = 'f'
      AND pg_get_constraintdef(oid) LIKE '%FOREIGN KEY (user_id) REFERENCES auth.users(id)%'
  ) THEN
    ALTER TABLE public.org_members
      ADD CONSTRAINT fk_org_members_user
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- PART 4: Create org_member_applications table (if not exists)
CREATE TABLE IF NOT EXISTS public.org_member_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (safe if already enabled)
ALTER TABLE public.org_member_applications ENABLE ROW LEVEL SECURITY;

-- PART 4a: RLS policies (create only if not exists)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'org_member_applications_owner_read' AND tablename = 'org_member_applications'
  ) THEN
    EXECUTE $$
      CREATE POLICY org_member_applications_owner_read
      ON public.org_member_applications
      FOR SELECT
      USING (auth.uid() = user_id);
    $$;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'org_member_applications_owner_insert' AND tablename = 'org_member_applications'
  ) THEN
    EXECUTE $$
      CREATE POLICY org_member_applications_owner_insert
      ON public.org_member_applications
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    $$;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'org_member_applications_org_owner_read' AND tablename = 'org_member_applications'
  ) THEN
    EXECUTE $$
      CREATE POLICY org_member_applications_org_owner_read
      ON public.org_member_applications
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.org_members om
          WHERE om.org_id = org_member_applications.org_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner','business_admin')
        )
      );
    $$;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'org_member_applications_org_owner_update' AND tablename = 'org_member_applications'
  ) THEN
    EXECUTE $$
      CREATE POLICY org_member_applications_org_owner_update
      ON public.org_member_applications
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.org_members om
          WHERE om.org_id = org_member_applications.org_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner','business_admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.org_members om
          WHERE om.org_id = org_member_applications.org_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner','business_admin')
        )
      );
    $$;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'org_member_applications_admin_all' AND tablename = 'org_member_applications'
  ) THEN
    EXECUTE $$
      CREATE POLICY org_member_applications_admin_all
      ON public.org_member_applications
      FOR ALL
      USING (is_admin())
      WITH CHECK (is_admin());
    $$;
  END IF;
END$$;

-- PART 4b: Trigger for updated_at (create if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_org_member_applications_updated_at'
  ) THEN
    CREATE TRIGGER update_org_member_applications_updated_at
      BEFORE UPDATE ON public.org_member_applications
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- PART 4c: Indexes and partial unique index
CREATE INDEX IF NOT EXISTS idx_org_member_applications_org_id
  ON public.org_member_applications(org_id);
CREATE INDEX IF NOT EXISTS idx_org_member_applications_user_id
  ON public.org_member_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_org_member_applications_status
  ON public.org_member_applications(status);
CREATE INDEX IF NOT EXISTS idx_org_member_applications_org_status
  ON public.org_member_applications(org_id, status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'ux_org_member_applications_pending'
  ) THEN
    EXECUTE $$
      CREATE UNIQUE INDEX ux_org_member_applications_pending
      ON public.org_member_applications (org_id, user_id) WHERE status = 'pending';
    $$;
  END IF;
END $$;

-- PART 5: Add fields to org_requests if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'org_requests' AND column_name = 'website'
  ) THEN
    ALTER TABLE public.org_requests ADD COLUMN website TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'org_requests' AND column_name = 'industry_id'
  ) THEN
    ALTER TABLE public.org_requests ADD COLUMN industry_id UUID REFERENCES public.industries(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'org_requests' AND column_name = 'company_size'
  ) THEN
    ALTER TABLE public.org_requests
      ADD COLUMN company_size TEXT
      CHECK (company_size IN ('1-10','11-50','51-200','201-1000','1000+') OR company_size IS NULL);
  END IF;
END $$;

-- PART 6: create_org_and_owner function (replace)
CREATE OR REPLACE FUNCTION public.create_org_and_owner(
  p_name text,
  p_description text DEFAULT NULL,
  p_website text DEFAULT NULL,
  p_industry_id uuid DEFAULT NULL,
  p_company_size text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org uuid;
  v_request_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_company_size IS NOT NULL AND p_company_size NOT IN ('1-10','11-50','51-200','201-1000','1000+') THEN
    RAISE EXCEPTION 'Invalid company_size.';
  END IF;

  INSERT INTO public.orgs (
    name, description, website, industry_id, company_size, created_by, status
  ) VALUES (
    p_name, p_description, p_website, p_industry_id, p_company_size, auth.uid(), 'pending'
  )
  RETURNING id INTO v_org;

  INSERT INTO public.org_members (org_id, user_id, role)
    VALUES (v_org, auth.uid(), 'owner')
    ON CONFLICT (org_id, user_id) DO NOTHING;

  INSERT INTO public.org_requests (
    user_id, org_name, org_description, website, industry_id, company_size, reason, status
  ) VALUES (
    auth.uid(), p_name, p_description, p_website, p_industry_id, p_company_size, 'Organization creation request', 'pending'
  )
  RETURNING id INTO v_request_id;

  INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), 'business_user'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

  RETURN v_org;
END;
$$;

-- PART 7: RPC functions for application management

CREATE OR REPLACE FUNCTION public.apply_to_org(
  p_org_id uuid,
  p_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_application_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.orgs WHERE id = p_org_id AND status = 'approved') THEN
    RAISE EXCEPTION 'Organization not found or not approved';
  END IF;

  IF EXISTS (SELECT 1 FROM public.org_members WHERE org_id = p_org_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'You are already a member';
  END IF;

  IF EXISTS (SELECT 1 FROM public.org_member_applications WHERE org_id = p_org_id AND user_id = auth.uid() AND status = 'pending') THEN
    RAISE EXCEPTION 'You already have a pending application';
  END IF;

  INSERT INTO public.org_member_applications (org_id, user_id, message, status)
  VALUES (p_org_id, auth.uid(), p_message, 'pending')
  RETURNING id INTO v_application_id;

  RETURN v_application_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_org_member_application(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_org_id uuid; v_user_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT org_id, user_id INTO v_org_id, v_user_id FROM public.org_member_applications WHERE id = p_application_id;
  IF v_org_id IS NULL THEN RAISE EXCEPTION 'Application not found'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.org_members WHERE org_id = v_org_id AND user_id = auth.uid() AND role IN ('owner','business_admin')
  ) AND NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.org_member_applications
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = p_application_id;

  INSERT INTO public.org_members (org_id, user_id, role)
    VALUES (v_org_id, v_user_id, 'member')
    ON CONFLICT (org_id, user_id) DO UPDATE SET role = 'member';

  INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'business_user'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_org_member_application(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_org_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT org_id INTO v_org_id FROM public.org_member_applications WHERE id = p_application_id;
  IF v_org_id IS NULL THEN RAISE EXCEPTION 'Application not found'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.org_members WHERE org_id = v_org_id AND user_id = auth.uid() AND role IN ('owner','business_admin')
  ) AND NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.org_member_applications
  SET status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = p_application_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_org_request(p_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_org_id uuid; v_user_id uuid; v_org_name text;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Only admins'; END IF;

  SELECT user_id, org_name INTO v_user_id, v_org_name FROM public.org_requests WHERE id = p_request_id AND status = 'pending';
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Org request not found'; END IF;

  SELECT o.id INTO v_org_id FROM public.orgs o
  WHERE o.created_by = v_user_id AND o.name = v_org_name AND o.status = 'pending'
  ORDER BY o.created_at DESC LIMIT 1;

  IF v_org_id IS NULL THEN RAISE EXCEPTION 'Associated org not found'; END IF;

  UPDATE public.orgs SET status = 'approved' WHERE id = v_org_id;
  UPDATE public.org_requests SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now() WHERE id = p_request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_org_request(p_request_id uuid, p_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_org_id uuid; v_user_id uuid; v_org_name text;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Only admins'; END IF;

  SELECT user_id, org_name INTO v_user_id, v_org_name FROM public.org_requests WHERE id = p_request_id AND status = 'pending';
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Org request not found'; END IF;

  SELECT o.id INTO v_org_id FROM public.orgs o
  WHERE o.created_by = v_user_id AND o.name = v_org_name AND o.status = 'pending'
  ORDER BY o.created_at DESC LIMIT 1;

  IF v_org_id IS NOT NULL THEN
    UPDATE public.orgs SET status = 'rejected' WHERE id = v_org_id;
  END IF;

  UPDATE public.org_requests
  SET status = 'rejected', reason = COALESCE(p_reason, reason), reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = p_request_id;
END;
$$;

-- PART 8: Admin view for org approval requests (create or replace)
CREATE OR REPLACE VIEW public.org_approval_requests
WITH (security_invoker = true)
AS
SELECT
  r.id AS request_id,
  r.user_id,
  r.org_name,
  r.org_description,
  r.website,
  r.industry_id,
  r.company_size,
  r.reason,
  r.status AS request_status,
  r.created_at AS request_created_at,
  o.id AS org_id,
  o.status AS org_status,
  o.created_at AS org_created_at,
  p.display_name AS creator_name,
  u.email AS creator_email
FROM public.org_requests r
LEFT JOIN public.orgs o ON (
  o.created_by = r.user_id
  AND o.name = r.org_name
  AND o.created_at >= r.created_at - INTERVAL '1 minute'
  AND o.created_at <= r.created_at + INTERVAL '1 minute'
)
LEFT JOIN public.profiles p ON p.id = r.user_id
LEFT JOIN auth.users u ON u.id = r.user_id
WHERE r.status = 'pending'
ORDER BY r.created_at DESC;

-- Grant select to authenticated (view uses security_invoker; rely on is_admin() check in UI or wrapper)
GRANT SELECT ON public.org_approval_requests TO authenticated;

-- PART 9: Ensure "Public Business" org exists
DO $$
DECLARE v_public_business_org_id uuid; v_admin_user_id uuid;
BEGIN
  SELECT id INTO v_public_business_org_id FROM public.orgs WHERE LOWER(name) = 'public business' LIMIT 1;

  IF v_public_business_org_id IS NULL THEN
    SELECT user_id INTO v_admin_user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1;
    IF v_admin_user_id IS NULL THEN
      SELECT id INTO v_admin_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    END IF;

    INSERT INTO public.orgs (name, description, created_by, status)
    VALUES ('Public Business', 'The main Public Business organization', v_admin_user_id, 'approved')
    RETURNING id INTO v_public_business_org_id;

    INSERT INTO public.org_members (org_id, user_id, role)
      VALUES (v_public_business_org_id, v_admin_user_id, 'owner')
      ON CONFLICT (org_id, user_id) DO NOTHING;
  ELSE
    UPDATE public.orgs SET status = 'approved' WHERE id = v_public_business_org_id AND status != 'approved';
  END IF;
END;
$$;

