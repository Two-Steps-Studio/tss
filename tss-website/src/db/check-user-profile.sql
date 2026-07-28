-- Check if current user has a profile record
-- Replace 'YOUR_USER_ID' with your actual auth.uid()

-- First, get your user ID from auth
-- Then check if profile exists:
SELECT * FROM profiles WHERE id = 'YOUR_USER_ID';

-- Check all profiles to see structure
SELECT id, username, email, created_at FROM profiles LIMIT 10;

-- Check if there's a mismatch between auth.users and profiles
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  p.id as profile_id,
  p.username as profile_username
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LIMIT 10;
