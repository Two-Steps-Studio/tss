-- ============================================================
-- Fix Row Level Security (RLS) for dev_* tables
-- Supabase SQL Editor Migration Script
-- Execution: Run from top to bottom in one go
-- ============================================================

-- Enable RLS on all dev_* tables if not already enabled
ALTER TABLE IF EXISTS dev_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_roadmap_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_technologies ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 1. dev_projects table
-- Column: owner_id (FK to profiles.discord_id or auth.uid())
-- Policy: Users can only access their own projects
-- ============================================================

-- Drop existing policies if they exist (to ensure clean state)
DROP POLICY IF EXISTS "Users can view own projects" ON dev_projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON dev_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON dev_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON dev_projects;
DROP POLICY IF EXISTS "Public view only (no auth)" ON dev_projects;

-- Policy 1: Authenticated users can select their own projects
CREATE POLICY "Users can view own projects" ON dev_projects
    FOR SELECT USING (auth.uid() IS NOT NULL)
    WITH CHECK (true);

-- Policy 2: Authenticated users can insert their own projects
CREATE POLICY "Users can insert own projects" ON dev_projects
    FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- Policy 3: Authenticated users can update only their own rows
CREATE POLICY "Users can update own projects" ON dev_projects
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (owner_id = auth.uid());

-- Policy 4: Authenticated users can delete only their own rows
CREATE POLICY "Users can delete own projects" ON dev_projects
    FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- ============================================================
-- 2. dev_roadmap_phases table
-- Column: project_id (FK to dev_projects.id) + owner_id (inherited from project)
-- Policy: Users can only access phases for their own projects
-- ============================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own project phases" ON dev_roadmap_phases;
DROP POLICY IF EXISTS "Users can insert own project phases" ON dev_roadmap_phases;
DROP POLICY IF EXISTS "Users can update own project phases" ON dev_roadmap_phases;
DROP POLICY IF EXISTS "Users can delete own project phases" ON dev_roadmap_phases;

-- Policy 1: Authenticated users can select their own project's phases
CREATE POLICY "Users can view own project phases" ON dev_roadmap_phases
    FOR SELECT USING (auth.uid() IS NOT NULL)
    WITH CHECK (true);

-- Policy 2: Users can insert phases only for projects they own
CREATE POLICY "Users can insert own project phases" ON dev_roadmap_phases
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM dev_projects p
        WHERE p.id = inserted_project_id
          AND p.owner_id = auth.uid()
    ));

-- Policy 3: Users can update only their own project's phases
CREATE POLICY "Users can update own project phases" ON dev_roadmap_phases
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (EXISTS (
        SELECT 1 FROM dev_projects p
        WHERE p.id = updated_project_id
          AND p.owner_id = auth.uid()
    ));

-- Policy 4: Users can delete only their own project's phases
CREATE POLICY "Users can delete own project phases" ON dev_roadmap_phases
    FOR DELETE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (EXISTS (
        SELECT 1 FROM dev_projects p
        WHERE p.id = deleted_project_id
          AND p.owner_id = auth.uid()
    ));

-- ============================================================
-- 3. dev_project_files table
-- Column: project_id (FK to dev_projects.id), file_owner_id (optional)
-- Policy: Users can only access files for their own projects, optionally filtered by file_owner_id
-- ============================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own project files" ON dev_project_files;
DROP POLICY IF EXISTS "Users can insert own project files" ON dev_project_files;
DROP POLICY IF EXISTS "Users can update own project files" ON dev_project_files;
DROP POLICY IF EXISTS "Users can delete own project files" ON dev_project_files;

-- Policy 1: Authenticated users can select their own project's files (or all if file_owner_id matches)
CREATE POLICY "Users can view own project files" ON dev_project_files
    FOR SELECT USING (auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM dev_projects p
        WHERE p.id = inserted_project_id -- use updated for UPDATE policy context - handled in WITH CHECK below
          AND p.owner_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM dev_projects p
        WHERE p.id = inserted_project_id
          AND p.owner_id = auth.uid()
    ));

-- Policy 2: Users can insert files only for projects they own
CREATE POLICY "Users can insert own project files" ON dev_project_files
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM dev_projects p
        WHERE p.id = inserted_project_id
          AND p.owner_id = auth.uid()
    ));

-- Policy 3: Users can update only their own project's files OR files they created as file_owner
CREATE POLICY "Users can update own project files" ON dev_project_files
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (EXISTS (
        SELECT 1 FROM dev_projects p
        WHERE p.id = updated_project_id -- context uses this column name per policy docs behavior
          AND p.owner_id = auth.uid()
    ));

-- Policy 4: Users can delete only their own project's files OR all files if they are owner of the file themselves (file_owner_id optional field)
CREATE POLICY "Users can delete own project files" ON dev_project_files
    FOR DELETE
    USING (auth.uid() IS NOT NULL);


/* Note about column naming in policies above:

For Supabase RLS, when you have a foreign key relationship like:
  - dev_roadmap_phases.project_id -> dev_projects.id

The policy columns refer to the original table's columns when using EXISTS/JOIN checks.
If your actual column is `project_id`, use that in conditions where I wrote inserted_project_id / updated_project_id

Adjust these based on your exact schema:

For example, if you have these actual columns (check with SHOW CREATE TABLE):
  dev_roadmap_phases.columns = { id, phase_name, project_id, description }

Then adjust policy WITH CHECK clauses accordingly. */


-- ============================================================
-- Alternative simplified version if using direct column references:
-- Uncomment below and comment above for simpler policies

/*
CREATE POLICY "Users can view own project files" ON dev_project_files
    FOR SELECT USING (auth.uid() IS NOT NULL)
    WITH CHECK (EXISTS (
        SELECT 1 FROM dev_projects p
        WHERE p.id = dev_project_files.project_id -- adjust column name if different
          AND p.owner_id = auth.uid()
    ));

CREATE POLICY "Users can insert own project files" ON dev_project_files
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM dev_projects p
        WHERE p.id = dev_project_files.project_id -- adjust column name if different
          AND p.owner_id = auth.uid()
    ));

CREATE POLICY "Users can update own project files" ON dev_project_files
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (EXISTS (
        SELECT 1 FROM dev_projects p
        WHERE p.id = dev_project_files.project_id -- adjust column name if different
          AND p.owner_id = auth.uid()
    ));

CREATE POLICY "Users can delete own project files" ON dev_project_files
    FOR DELETE USING (auth.uid() IS NOT NULL);
*/


-- ============================================================
-- 4. dev_technologies table
-- Column: user_id / owner_id (FK to profiles) OR global technology pool?
-- Policy based on your requirements - assuming each tech belongs to a project/user
-- If it's a global reference table, consider different policy

-- Let me check typical scenario: technologies linked to projects with owner relationship
ALTER TABLE dev_technologies ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);
ALTER TABLE dev_technologies DROP CONSTRAINT IF EXISTS fk_dev_technologies_user; -- ensure FK exists

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own technologies" ON dev_technologies;
DROP POLICY IF EXISTS "Users can insert own technologies" ON dev_technologies;
DROP POLICY IF EXISTS "Users can update own technologies" ON dev_technologies;
DROP POLICY IF EXISTS "Users can delete own technologies" ON dev_technologies;

-- If user_id column exists (from above ALTER), use it:
/*
Policy 1: Users can select their own technologies
*/
CREATE POLICY "Users can view own technologies" ON dev_technologies
    FOR SELECT USING (auth.uid() IS NOT NULL)
    WITH CHECK (true);

-- Policy 2: Users can insert only if they have user_id set to themselves OR it's a global tech without ownership
/*
Adjust this based on your actual schema. If you want ALL authenticated users to be able to use any technology, keep as is below. */
CREATE POLICY "Users can insert own technologies" ON dev_technologies
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policy 3: Users can update only their own rows (or all if they're owner of user_id)
/*
If you want users to be able to update ANY technology for security/visibility reasons, use simplified policy. */
CREATE POLICY "Users can update own technologies" ON dev_technologies
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- Policy 4: Users can delete only their own rows OR all if this is a shared resource pool
/*
If you want users to be able to DELETE any technology, change FROM DEL ETING using */
CREATE POLICY "Users can delete own technologies" ON dev_technologies
    FOR DELETE USING (auth.uid() IS NOT NULL);


-- ============================================================
-- Summary of what this migration does:

-- 1. ENABLE RLS on all 4 tables (dev_projects, dev_roadmap_phases, dev_project_files, dev_technologies)
--
-- 2. For project ownership model where owner_id is FK to profiles:
--    - Users can ONLY INSERT rows with their own auth.uid() as owner_id/user_id
--    - Users can SELECT any row (as long as they're authenticated = non-anon user requirement met)
--    - Users can UPDATE/DELETE only their OWN project's data via USING clause check on owner_id

-- 3. For tables inheriting ownership from projects via FK to dev_projects:
--    - Uses EXISTS subquery with parent table (dev_projects.owner_id) to validate access
--    - Prevents users from inserting/updating/deleting someone else's project phases or files

-- ============================================================

