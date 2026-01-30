-- Enable password protection for leaked passwords
UPDATE auth.config 
SET password_min_length = 8;

-- This setting should be enabled via the Supabase dashboard
-- Go to Authentication > Settings > Password requirements
-- Enable "Check against common passwords" and "Minimum password length: 8"