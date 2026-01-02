-- =====================================================
-- Quick Fix: Create "Public Business" Org and Set Owner
-- =====================================================
-- This creates the "Public Business" organization and sets
-- monojessy25@gmail.com as the owner/admin
-- =====================================================

DO $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
  v_org_exists boolean;
BEGIN
  -- Step 1: Get the user ID for monojessy25@gmail.com
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'monojessy25@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email monojessy25@gmail.com not found. Please ensure the user exists in auth.users.';
  END IF;

  RAISE NOTICE 'Found user: %', v_user_id;

  -- Step 2: Check if "Public Business" org already exists
  SELECT EXISTS(
    SELECT 1 FROM public.orgs WHERE name = 'Public Business'
  ) INTO v_org_exists;

  IF v_org_exists THEN
    -- Get existing org ID
    SELECT id INTO v_org_id
    FROM public.orgs
    WHERE name = 'Public Business'
    LIMIT 1;
    
    RAISE NOTICE 'Organization "Public Business" already exists (ID: %). Updating ownership...', v_org_id;
  ELSE
    -- Step 3: Create "Public Business" organization
    INSERT INTO public.orgs (
      name,
      description,
      status,
      created_by,
      website,
      industry_id,
      company_size
    ) VALUES (
      'Public Business',
      'The main Public Business organization',
      'approved',
      v_user_id,
      NULL,
      NULL,
      NULL
    )
    RETURNING id INTO v_org_id;

    RAISE NOTICE 'Created "Public Business" organization (ID: %)', v_org_id;
  END IF;

  -- Step 4: Create or update org_members record with owner role
  INSERT INTO public.org_members (
    org_id,
    user_id,
    role
  ) VALUES (
    v_org_id,
    v_user_id,
    'owner'
  )
  ON CONFLICT (org_id, user_id) 
  DO UPDATE SET
    role = 'owner',
    updated_at = NOW();

  RAISE NOTICE 'Set user as owner of "Public Business"';

  -- Step 5: Ensure user has business_user role
  INSERT INTO public.user_roles (
    user_id,
    role
  ) VALUES (
    v_user_id,
    'business_user'
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    role = 'business_user',
    updated_at = NOW();

  RAISE NOTICE 'Set user role to business_user';

  RAISE NOTICE '=== SUCCESS ===';
  RAISE NOTICE 'Organization: Public Business (ID: %)', v_org_id;
  RAISE NOTICE 'Owner: monojessy25@gmail.com (User ID: %)', v_user_id;
  RAISE NOTICE 'Role: owner';
  RAISE NOTICE 'User Role: business_user';
  RAISE NOTICE '=== END ===';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating organization: %', SQLERRM;
END $$;

-- Verification query (run separately to check results)
-- SELECT 
--   o.id as org_id,
--   o.name as org_name,
--   o.status,
--   om.role as membership_role,
--   u.email,
--   ur.role as user_role
-- FROM public.orgs o
-- JOIN public.org_members om ON om.org_id = o.id
-- JOIN auth.users u ON u.id = om.user_id
-- LEFT JOIN public.user_roles ur ON ur.user_id = u.id
-- WHERE o.name = 'Public Business';

