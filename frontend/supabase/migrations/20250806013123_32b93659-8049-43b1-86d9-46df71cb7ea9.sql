-- Step 1: Add the new enum value in a separate transaction
DO $$
BEGIN
  -- Add the new enum value
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'public_member';
  
  -- Commit this transaction before using the new enum value
  COMMIT;
END $$;