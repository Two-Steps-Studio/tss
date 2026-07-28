-- Drop and recreate UPDATE policy with correct role (authenticated instead of public)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (
  (id = ((auth.jwt() -> 'user_metadata'::text) ->> 'provider_id'::text)) 
  OR (id = (auth.uid())::text)
)
WITH CHECK (
  (id = ((auth.jwt() -> 'user_metadata'::text) ->> 'provider_id'::text)) 
  OR (id = (auth.uid())::text)
);

-- Verify the policy was created with correct role
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'profiles' AND policyname = 'Users can update own profile';
