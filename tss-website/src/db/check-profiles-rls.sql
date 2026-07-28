-- Check if RLS is enabled on profiles table
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Check existing policies on profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Check if user can update their own profile (test query - replace with actual user ID)
-- SELECT * FROM profiles WHERE id = 'your-user-id-here';
