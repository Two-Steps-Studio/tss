-- ============================================
-- DEV Module Enhanced Permissions Schema
-- Invitations, Activity Logs, Archiving
-- ============================================

-- ============================================
-- 1. NEW ENUMS
-- ============================================

-- Project Status (extended for archiving)
CREATE TYPE dev_project_status AS ENUM ('active', 'archived', 'deleted');

-- Invite Status
CREATE TYPE dev_invite_status AS ENUM ('pending', 'accepted', 'rejected', 'expired', 'cancelled');

-- Activity Action Types
CREATE TYPE dev_activity_action AS ENUM (
  'project_created',
  'project_updated',
  'project_archived',
  'project_restored',
  'project_deleted',
  'member_added',
  'member_removed',
  'member_role_changed',
  'member_permissions_changed',
  'invite_sent',
  'invite_accepted',
  'invite_rejected',
  'invite_cancelled',
  'task_created',
  'task_updated',
  'task_deleted',
  'task_status_changed',
  'phase_created',
  'phase_updated',
  'phase_deleted',
  'file_uploaded',
  'file_deleted',
  'technology_added',
  'technology_updated',
  'technology_deleted',
  'description_updated',
  'settings_updated'
);

-- ============================================
-- 2. UPDATE EXISTING TABLES
-- ============================================

-- Update dev_projects status column type
DO $$
BEGIN
    -- First, update existing values to match new enum
    UPDATE dev_projects 
    SET status = 'active' 
    WHERE status NOT IN ('active', 'archived', 'deleted');
    
    -- Alter column type
    ALTER TABLE dev_projects 
    ALTER COLUMN status TYPE dev_project_status 
    USING status::dev_project_status;
EXCEPTION
    WHEN others THEN
        -- If column doesn't exist or other error, create it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dev_projects' AND column_name = 'status') THEN
            ALTER TABLE dev_projects ADD COLUMN status dev_project_status DEFAULT 'active';
        END IF;
END $$;

-- Add archived_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dev_projects' AND column_name = 'archived_at') THEN
        ALTER TABLE dev_projects ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add deleted_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dev_projects' AND column_name = 'deleted_at') THEN
        ALTER TABLE dev_projects ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- ============================================
-- 3. NEW TABLE: PROJECT INVITATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS dev_project_invites (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    username TEXT,
    invited_by TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role dev_project_role NOT NULL DEFAULT 'viewer',
    permissions JSONB DEFAULT '{}',
    status dev_invite_status DEFAULT 'pending',
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. NEW TABLE: ACTIVITY LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS dev_activity_logs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    action dev_activity_action NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. INDEXES
-- ============================================

-- Invites indexes
CREATE INDEX IF NOT EXISTS idx_dev_project_invites_project_id ON dev_project_invites(project_id);
CREATE INDEX IF NOT EXISTS idx_dev_project_invites_email ON dev_project_invites(email);
CREATE INDEX IF NOT EXISTS idx_dev_project_invites_token ON dev_project_invites(token);
CREATE INDEX IF NOT EXISTS idx_dev_project_invites_status ON dev_project_invites(status);
CREATE INDEX IF NOT EXISTS idx_dev_project_invites_expires_at ON dev_project_invites(expires_at);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_dev_activity_logs_project_id ON dev_activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_dev_activity_logs_user_id ON dev_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_dev_activity_logs_action ON dev_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_dev_activity_logs_created_at ON dev_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dev_activity_logs_entity ON dev_activity_logs(entity_type, entity_id);

-- ============================================
-- 6. RLS POLICIES FOR INVITATIONS
-- ============================================

ALTER TABLE dev_project_invites ENABLE ROW LEVEL SECURITY;

-- Users can view invites for their projects
CREATE POLICY "Users can view invites for their projects"
ON dev_project_invites FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_project_invites.project_id 
    AND dev_projects.owner_id = auth.uid()::text
  )
  OR EXISTS (
    SELECT 1 FROM dev_project_members 
    WHERE dev_project_members.project_id = dev_project_invites.project_id 
    AND dev_project_members.user_id = auth.uid()::text
    AND dev_project_members.role IN ('admin', 'owner')
  )
);

-- Users can view invites sent to them
CREATE POLICY "Users can view invites sent to them"
ON dev_project_invites FOR SELECT
USING (
  email = (
    SELECT email FROM profiles WHERE id = auth.uid()::text
  )
  OR username = (
    SELECT username FROM profiles WHERE id = auth.uid()::text
  )
);

-- Only project owners/admins can create invites
CREATE POLICY "Project owners and admins can create invites"
ON dev_project_invites FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_project_invites.project_id 
    AND (
      dev_projects.owner_id = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM dev_project_members 
        WHERE dev_project_members.project_id = dev_project_invites.project_id 
        AND dev_project_members.user_id = auth.uid()::text
        AND dev_project_members.role = 'admin'
      )
    )
  )
);

-- Only project owners/admins can update invites
CREATE POLICY "Project owners and admins can update invites"
ON dev_project_invites FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_project_invites.project_id 
    AND (
      dev_projects.owner_id = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM dev_project_members 
        WHERE dev_project_members.project_id = dev_project_invites.project_id 
        AND dev_project_members.user_id = auth.uid()::text
        AND dev_project_members.role = 'admin'
      )
    )
  )
);

-- Users can accept/reject invites sent to them
CREATE POLICY "Users can accept their own invites"
ON dev_project_invites FOR UPDATE
USING (
  (email = (SELECT email FROM profiles WHERE id = auth.uid()::text)
   OR username = (SELECT username FROM profiles WHERE id = auth.uid()::text))
  AND status = 'pending'
)
WITH CHECK (
  (email = (SELECT email FROM profiles WHERE id = auth.uid()::text)
   OR username = (SELECT username FROM profiles WHERE id = auth.uid()::text))
  AND (status = 'accepted' OR status = 'rejected')
);

-- Only project owners/admins can delete invites
CREATE POLICY "Project owners and admins can delete invites"
ON dev_project_invites FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_project_invites.project_id 
    AND (
      dev_projects.owner_id = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM dev_project_members 
        WHERE dev_project_members.project_id = dev_project_invites.project_id 
        AND dev_project_members.user_id = auth.uid()::text
        AND dev_project_members.role = 'admin'
      )
    )
  )
);

-- ============================================
-- 7. RLS POLICIES FOR ACTIVITY LOGS
-- ============================================

ALTER TABLE dev_activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view logs for their projects
CREATE POLICY "Users can view logs for their projects"
ON dev_activity_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE dev_projects.id = dev_activity_logs.project_id 
    AND (
      dev_projects.owner_id = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM dev_project_members 
        WHERE dev_project_members.project_id = dev_activity_logs.project_id 
        AND dev_project_members.user_id = auth.uid()::text
      )
    )
  )
);

-- System can insert logs (triggered by application)
CREATE POLICY "System can insert logs"
ON dev_activity_logs FOR INSERT
WITH CHECK (true);

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to generate invite token
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_dev_activity(
  p_project_id INTEGER,
  p_user_id TEXT,
  p_action dev_activity_action,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id INTEGER DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  log_id INTEGER;
BEGIN
  INSERT INTO dev_activity_logs (
    project_id, user_id, action, entity_type, entity_id, 
    details, ip_address, user_agent
  )
  VALUES (
    p_project_id, p_user_id, p_action, p_entity_type, p_entity_id,
    p_details, p_ip_address, p_user_agent
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can manage project
CREATE OR REPLACE FUNCTION can_manage_project(p_user_id TEXT, p_project_id INTEGER, p_permission TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  is_owner BOOLEAN;
  member_role dev_project_role;
  member_permissions JSONB;
BEGIN
  -- Check if owner
  SELECT EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE id = p_project_id AND owner_id = p_user_id
  ) INTO is_owner;
  
  IF is_owner THEN
    RETURN TRUE;
  END IF;
  
  -- Check member role and permissions
  SELECT role, permissions INTO member_role, member_permissions
  FROM dev_project_members
  WHERE project_id = p_project_id AND user_id = p_user_id;
  
  IF member_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Admin has most permissions except delete
  IF member_role = 'admin' THEN
    RETURN p_permission IS NULL OR p_permission != 'delete_project';
  END IF;
  
  -- Check specific permission
  IF p_permission IS NOT NULL AND member_permissions IS NOT NULL THEN
    RETURN COALESCE((member_permissions->>p_permission)::BOOLEAN, FALSE);
  END IF;
  
  -- Developer permissions
  IF member_role = 'developer' THEN
    RETURN p_permission IN (
      'view_project', 'edit_project', 'manage_tasks', 'manage_kanban',
      'manage_files', 'manage_description', 'manage_technologies'
    );
  END IF;
  
  -- Tester permissions
  IF member_role = 'tester' THEN
    RETURN p_permission LIKE 'view_%';
  END IF;
  
  -- Viewer permissions
  IF member_role = 'viewer' THEN
    RETURN p_permission LIKE 'view_%';
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get default permissions for role
CREATE OR REPLACE FUNCTION get_default_permissions(p_role dev_project_role)
RETURNS JSONB AS $$
BEGIN
  CASE p_role
    WHEN 'owner' THEN
      RETURN '{
        "view_project": true,
        "edit_project": true,
        "manage_tasks": true,
        "manage_kanban": true,
        "manage_files": true,
        "manage_description": true,
        "manage_roadmap": true,
        "manage_technologies": true,
        "manage_members": true,
        "manage_settings": true,
        "delete_project": true
      }'::JSONB;
    WHEN 'admin' THEN
      RETURN '{
        "view_project": true,
        "edit_project": true,
        "manage_tasks": true,
        "manage_kanban": true,
        "manage_files": true,
        "manage_description": true,
        "manage_roadmap": true,
        "manage_technologies": true,
        "manage_members": true,
        "manage_settings": true,
        "delete_project": false
      }'::JSONB;
    WHEN 'developer' THEN
      RETURN '{
        "view_project": true,
        "edit_project": true,
        "manage_tasks": true,
        "manage_kanban": true,
        "manage_files": true,
        "manage_description": true,
        "manage_roadmap": false,
        "manage_technologies": true,
        "manage_members": false,
        "manage_settings": false,
        "delete_project": false
      }'::JSONB;
    WHEN 'tester' THEN
      RETURN '{
        "view_project": true,
        "edit_project": false,
        "manage_tasks": false,
        "manage_kanban": false,
        "manage_files": true,
        "manage_description": false,
        "manage_roadmap": true,
        "manage_technologies": true,
        "manage_members": false,
        "manage_settings": false,
        "delete_project": false
      }'::JSONB;
    WHEN 'viewer' THEN
      RETURN '{
        "view_project": true,
        "edit_project": false,
        "manage_tasks": false,
        "manage_kanban": false,
        "manage_files": true,
        "manage_description": false,
        "manage_roadmap": true,
        "manage_technologies": true,
        "manage_members": false,
        "manage_settings": false,
        "delete_project": false
      }'::JSONB;
    ELSE
      RETURN '{}'::JSONB;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. TRIGGERS
-- ============================================

-- Update updated_at timestamp for invites
DROP TRIGGER IF EXISTS update_dev_project_invites_updated_at ON dev_project_invites;
CREATE TRIGGER update_dev_project_invites_updated_at
BEFORE UPDATE ON dev_project_invites
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-add member when invite is accepted
CREATE OR REPLACE FUNCTION add_member_on_invite_accept()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id TEXT;
BEGIN
  -- Only proceed if status changed to accepted
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    -- Find user by email or username
    SELECT id INTO target_user_id
    FROM profiles
    WHERE email = NEW.email OR username = NEW.username;
    
    -- If user found, add them to project
    IF target_user_id IS NOT NULL THEN
      INSERT INTO dev_project_members (project_id, user_id, role, permissions)
      VALUES (
        NEW.project_id,
        target_user_id,
        NEW.role,
        COALESCE(NEW.permissions, get_default_permissions(NEW.role))
      );
      
      -- Log the activity
      PERFORM log_dev_activity(
        NEW.project_id,
        target_user_id,
        'invite_accepted',
        'project_member',
        NULL,
        jsonb_build_object(
          'invite_id', NEW.id,
          'role', NEW.role
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_invite_accepted_add_member ON dev_project_invites;
CREATE TRIGGER on_invite_accepted_add_member
AFTER UPDATE ON dev_project_invites
FOR EACH ROW
EXECUTE FUNCTION add_member_on_invite_accept();

-- Function to automatically expire old invites
CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS VOID AS $$
BEGIN
  UPDATE dev_project_invites
  SET status = 'expired',
      updated_at = CURRENT_TIMESTAMP
  WHERE status = 'pending'
    AND expires_at < CURRENT_TIMESTAMP;
  -- Log expired invites
  INSERT INTO dev_activity_logs (project_id, action, entity_type, entity_id, details)
  SELECT 
    project_id, 
    'invite_expired'::dev_activity_action, 
    'project_invite', 
    id, 
    jsonb_build_object('email', email)
  FROM dev_project_invites
  WHERE status = 'expired'
    AND updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. CLEANUP FUNCTION FOR DELETED PROJECTS
-- ============================================

-- Function to soft delete a project
CREATE OR REPLACE FUNCTION soft_delete_project(p_project_id INTEGER, p_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_owner BOOLEAN;
BEGIN
  -- Check if user is owner
  SELECT EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE id = p_project_id AND owner_id = p_user_id
  ) INTO is_owner;
  
  IF NOT is_owner THEN
    RETURN FALSE;
  END IF;
  
  -- Soft delete the project
  UPDATE dev_projects
  SET status = 'deleted',
      deleted_at = CURRENT_TIMESTAMP
  WHERE id = p_project_id;
  
  -- Log the activity
  PERFORM log_dev_activity(
    p_project_id,
    p_user_id,
    'project_deleted',
    'project',
    p_project_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to restore a deleted project
CREATE OR REPLACE FUNCTION restore_project(p_project_id INTEGER, p_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_owner BOOLEAN;
BEGIN
  -- Check if user is owner
  SELECT EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE id = p_project_id AND owner_id = p_user_id
  ) INTO is_owner;
  
  IF NOT is_owner THEN
    RETURN FALSE;
  END IF;
  
  -- Restore the project
  UPDATE dev_projects
  SET status = 'active',
      deleted_at = NULL
  WHERE id = p_project_id AND status = 'deleted';
  
  -- Log the activity
  PERFORM log_dev_activity(
    p_project_id,
    p_user_id,
    'project_restored',
    'project',
    p_project_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- END OF SCHEMA
-- ============================================
