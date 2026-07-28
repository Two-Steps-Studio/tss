-- ============================================
-- DEV Module Permissions & Subscription Schema
-- Complete SQL script for Supabase
-- ============================================

-- ============================================
-- 1. NEW ENUMS
-- ============================================

-- Project Member Roles
CREATE TYPE dev_project_role AS ENUM ('owner', 'admin', 'developer', 'tester', 'viewer');

-- Subscription Plans
CREATE TYPE subscription_plan AS ENUM ('free', 'basic', 'pro', 'enterprise');

-- ============================================
-- 2. EXTEND PROFILES TABLE FOR SUBSCRIPTIONS
-- ============================================

-- Add subscription-related fields to profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'project_limit') THEN
        ALTER TABLE profiles ADD COLUMN project_limit INTEGER DEFAULT 1;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_plan') THEN
        ALTER TABLE profiles ADD COLUMN subscription_plan subscription_plan DEFAULT 'free';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE profiles ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'active';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_expires_at') THEN
        ALTER TABLE profiles ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- ============================================
-- 3. PROJECT MEMBERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS dev_project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role dev_project_role NOT NULL DEFAULT 'viewer',
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- ============================================
-- 4. PERMISSIONS DEFINITION
-- ============================================

-- Define default permissions for each role
-- These will be stored as JSONB in the permissions column
-- Format: { "view_project": true, "edit_project": false, ... }

-- Owner: Full access
-- Admin: Can manage everything except delete project
-- Developer: Can manage tasks, files, technologies
-- Tester: Can view and comment on tasks
-- Viewer: Read-only access

-- ============================================
-- 5. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_dev_project_members_project_id ON dev_project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_dev_project_members_user_id ON dev_project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_dev_project_members_role ON dev_project_members(role);

-- ============================================
-- 6. RLS POLICIES FOR PROJECT MEMBERS
-- ============================================

ALTER TABLE dev_project_members ENABLE ROW LEVEL SECURITY;

-- Members can view their own memberships
CREATE POLICY "Users can view their own project memberships"
ON dev_project_members FOR SELECT
USING (auth.uid()::text = user_id);

-- Project owners can view all members of their projects
CREATE POLICY "Project owners can view all project members"
ON dev_project_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_project_members.project_id 
    AND dev_projects.owner_id = auth.uid()::text
  )
);

-- Only project owners can insert new members
CREATE POLICY "Project owners can add members"
ON dev_project_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_project_members.project_id 
    AND dev_projects.owner_id = auth.uid()::text
  )
);

-- Project owners can update member roles
CREATE POLICY "Project owners can update member roles"
ON dev_project_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_project_members.project_id 
    AND dev_projects.owner_id = auth.uid()::text
  )
);

-- Project owners can remove members
CREATE POLICY "Project owners can remove members"
ON dev_project_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_project_members.project_id 
    AND dev_projects.owner_id = auth.uid()::text
  )
);

-- ============================================
-- 7. UPDATE EXISTING RLS POLICIES FOR DEV PROJECTS
-- ============================================

-- Update dev_projects policies to respect membership
DROP POLICY IF EXISTS "Projects are viewable by authenticated users" ON dev_projects;
CREATE POLICY "Projects are viewable by project members or owners"
ON dev_projects FOR SELECT
USING (
  owner_id = auth.uid()::text
  OR EXISTS (
    SELECT 1 FROM dev_project_members 
    WHERE dev_project_members.project_id = dev_projects.id 
    AND dev_project_members.user_id = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "Users can create their own projects" ON dev_projects;
CREATE POLICY "Users can create projects within their limit"
ON dev_projects FOR INSERT
WITH CHECK (
  owner_id = auth.uid()::text
  AND (
    SELECT COALESCE(project_limit, 1) FROM profiles WHERE id = auth.uid()::text
  ) > (
    SELECT COUNT(*) FROM dev_projects WHERE owner_id = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "Users can update their own projects" ON dev_projects;
CREATE POLICY "Project owners and admins can update projects"
ON dev_projects FOR UPDATE
USING (
  owner_id = auth.uid()::text
  OR EXISTS (
    SELECT 1 FROM dev_project_members 
    WHERE dev_project_members.project_id = dev_projects.id 
    AND dev_project_members.user_id = auth.uid()::text
    AND dev_project_members.role IN ('admin', 'owner')
  )
);

DROP POLICY IF EXISTS "Users can delete their own projects" ON dev_projects;
CREATE POLICY "Only project owners can delete projects"
ON dev_projects FOR DELETE
USING (owner_id = auth.uid()::text);

-- ============================================
-- 8. UPDATE RLS POLICIES FOR DEV TASKS
-- ============================================

DROP POLICY IF EXISTS "Tasks are viewable by authenticated users" ON dev_tasks;
CREATE POLICY "Tasks are viewable by project members"
ON dev_tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_tasks.project_id 
    AND (
      dev_projects.owner_id = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM dev_project_members 
        WHERE dev_project_members.project_id = dev_projects.id 
        AND dev_project_members.user_id = auth.uid()::text
      )
    )
  )
);

DROP POLICY IF EXISTS "Project owners can create tasks" ON dev_tasks;
CREATE POLICY "Project members with task management can create tasks"
ON dev_tasks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_tasks.project_id 
    AND (
      dev_projects.owner_id = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM dev_project_members 
        WHERE dev_project_members.project_id = dev_projects.id 
        AND dev_project_members.user_id = auth.uid()::text
        AND dev_project_members.role IN ('owner', 'admin', 'developer')
      )
    )
  )
);

DROP POLICY IF EXISTS "Project owners can update tasks" ON dev_tasks;
CREATE POLICY "Project members with task management can update tasks"
ON dev_tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_tasks.project_id 
    AND (
      dev_projects.owner_id = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM dev_project_members 
        WHERE dev_project_members.project_id = dev_projects.id 
        AND dev_project_members.user_id = auth.uid()::text
        AND dev_project_members.role IN ('owner', 'admin', 'developer')
      )
    )
  )
);

DROP POLICY IF EXISTS "Project owners can delete tasks" ON dev_tasks;
CREATE POLICY "Project members with task management can delete tasks"
ON dev_tasks FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_tasks.project_id 
    AND (
      dev_projects.owner_id = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM dev_project_members 
        WHERE dev_project_members.project_id = dev_projects.id 
        AND dev_project_members.user_id = auth.uid()::text
        AND dev_project_members.role IN ('owner', 'admin', 'developer')
      )
    )
  )
);

-- ============================================
-- 9. UPDATE RLS POLICIES FOR OTHER DEV TABLES
-- ============================================

-- Roadmap phases
DROP POLICY IF EXISTS "Phases are viewable by authenticated users" ON dev_roadmap_phases;
CREATE POLICY "Phases are viewable by project members"
ON dev_roadmap_phases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_roadmap_phases.project_id 
    AND (
      dev_projects.owner_id = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM dev_project_members 
        WHERE dev_project_members.project_id = dev_projects.id 
        AND dev_project_members.user_id = auth.uid()::text
      )
    )
  )
);

DROP POLICY IF EXISTS "Project owners can manage phases" ON dev_roadmap_phases;
CREATE POLICY "Project members with roadmap management can manage phases"
ON dev_roadmap_phases FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_roadmap_phases.project_id 
    AND (
      dev_projects.owner_id = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM dev_project_members 
        WHERE dev_project_members.project_id = dev_projects.id 
        AND dev_project_members.user_id = auth.uid()::text
        AND dev_project_members.role IN ('owner', 'admin', 'developer')
      )
    )
  )
);

-- Project files
DROP POLICY IF EXISTS "Files are viewable by authenticated users" ON dev_project_files;
CREATE POLICY "Files are viewable by project members"
ON dev_project_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_project_files.project_id 
    AND (
      dev_projects.owner_id = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM dev_project_members 
        WHERE dev_project_members.project_id = dev_projects.id 
        AND dev_project_members.user_id = auth.uid()::text
      )
    )
  )
);

DROP POLICY IF EXISTS "Project owners can manage files" ON dev_project_files;
CREATE POLICY "Project members with file management can manage files"
ON dev_project_files FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_project_files.project_id 
    AND (
      dev_projects.owner_id = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM dev_project_members 
        WHERE dev_project_members.project_id = dev_projects.id 
        AND dev_project_members.user_id = auth.uid()::text
        AND dev_project_members.role IN ('owner', 'admin', 'developer')
      )
    )
  )
);

-- Technologies
DROP POLICY IF EXISTS "Technologies are viewable by authenticated users" ON dev_technologies;
CREATE POLICY "Technologies are viewable by project members"
ON dev_technologies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_technologies.project_id 
    AND (
      dev_projects.owner_id = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM dev_project_members 
        WHERE dev_project_members.project_id = dev_projects.id 
        AND dev_project_members.user_id = auth.uid()::text
      )
    )
  )
);

DROP POLICY IF EXISTS "Project owners can manage technologies" ON dev_technologies;
CREATE POLICY "Project members with technology management can manage technologies"
ON dev_technologies FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_technologies.project_id 
    AND (
      dev_projects.owner_id = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM dev_project_members 
        WHERE dev_project_members.project_id = dev_projects.id 
        AND dev_project_members.user_id = auth.uid()::text
        AND dev_project_members.role IN ('owner', 'admin', 'developer')
      )
    )
  )
);

-- ============================================
-- 10. HELPER FUNCTIONS
-- ============================================

-- Function to get user's project limit
CREATE OR REPLACE FUNCTION get_user_project_limit(user_uuid TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT project_limit FROM profiles WHERE id = user_uuid),
    1
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's current project count
CREATE OR REPLACE FUNCTION get_user_project_count(user_uuid TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM dev_projects WHERE owner_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can create more projects
CREATE OR REPLACE FUNCTION can_user_create_project(user_uuid TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_limit INTEGER;
  current_count INTEGER;
BEGIN
  user_limit := get_user_project_limit(user_uuid);
  current_count := get_user_project_count(user_uuid);
  RETURN current_count < user_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's role in a project
CREATE OR REPLACE FUNCTION get_user_project_role(user_uuid TEXT, project_id INTEGER)
RETURNS dev_project_role AS $$
BEGIN
  RETURN (
    SELECT role FROM dev_project_members
    WHERE user_id = user_uuid AND project_id = project_id
  );
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is project owner
CREATE OR REPLACE FUNCTION is_project_owner(user_uuid TEXT, project_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM dev_projects
    WHERE id = project_id AND owner_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION has_project_permission(
  user_uuid TEXT,
  project_id INTEGER,
  permission_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  member_role dev_project_role;
  member_permissions JSONB;
BEGIN
  -- Check if user is owner (full access)
  IF is_project_owner(user_uuid, project_id) THEN
    RETURN TRUE;
  END IF;
  
  -- Get member role and permissions
  SELECT role, permissions INTO member_role, member_permissions
  FROM dev_project_members
  WHERE user_id = user_uuid AND project_id = project_id;
  
  -- If not a member, no access
  IF member_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check role-based permissions
  IF member_role = 'admin' THEN
    -- Admins have most permissions except delete
    IF permission_name = 'delete_project' THEN
      RETURN FALSE;
    END IF;
    RETURN TRUE;
  END IF;
  
  IF member_role = 'developer' THEN
    -- Developers can manage tasks, files, technologies
    RETURN permission_name IN (
      'view_project',
      'edit_project',
      'manage_tasks',
      'manage_files',
      'manage_technologies',
      'manage_description'
    );
  END IF;
  
  IF member_role = 'tester' THEN
    -- Testers can view and comment
    RETURN permission_name IN (
      'view_project',
      'view_tasks',
      'view_roadmap',
      'view_files',
      'view_technologies'
    );
  END IF;
  
  IF member_role = 'viewer' THEN
    -- Viewers have read-only access
    RETURN permission_name LIKE 'view_%';
  END IF;
  
  -- Check custom permissions if defined
  IF member_permissions IS NOT NULL THEN
    RETURN COALESCE((member_permissions->>permission_name)::BOOLEAN, FALSE);
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. TRIGGER TO AUTO-ADD OWNER AS MEMBER
-- ============================================

CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  -- When a project is created, automatically add the owner as a member with owner role
  INSERT INTO dev_project_members (project_id, user_id, role, permissions)
  VALUES (
    NEW.id,
    NEW.owner_id,
    'owner',
    '{"view_project": true, "edit_project": true, "manage_tasks": true, "manage_roadmap": true, "manage_files": true, "manage_description": true, "manage_technologies": true, "manage_members": true, "delete_project": true}'::JSONB
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_project_created_add_owner_member ON dev_projects;
CREATE TRIGGER on_project_created_add_owner_member
AFTER INSERT ON dev_projects
FOR EACH ROW
EXECUTE FUNCTION add_owner_as_member();

-- ============================================
-- END OF SCHEMA
-- ============================================
