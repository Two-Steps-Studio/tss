-- Add missing UPDATE policy for profiles table
-- This allows users to update their own profile settings

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (
  (id = ((auth.jwt() -> 'user_metadata'::text) ->> 'provider_id'::text)) 
  OR (id = (auth.uid())::text)
)
WITH CHECK (
  (id = ((auth.jwt() -> 'user_metadata'::text) ->> 'provider_id'::text)) 
  OR (id = (auth.uid())::text)
);

-- Verify the policy was created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;
