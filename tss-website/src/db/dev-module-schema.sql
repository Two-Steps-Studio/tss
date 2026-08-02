-- ============================================
-- DEV Module Database Schema for TSS Website
-- Complete SQL script for Supabase
-- ============================================

-- Enable RLS on all tables
ALTER TABLE dev_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_project_columns ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 1. NEW ENUMS
-- ============================================

-- Task Status (more detailed)
CREATE TYPE dev_task_status AS ENUM ('todo', 'in_progress', 'testing', 'completed');

-- Task Priority
CREATE TYPE dev_task_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- File Category
CREATE TYPE dev_file_category AS ENUM ('documentation', 'graphics', 'audio', 'source_code', 'other');

-- Technology Category
CREATE TYPE dev_tech_category AS ENUM ('frontend', 'backend', 'game_engine', 'database', 'ai', 'devops', 'other');

-- Roadmap Phase Status
CREATE TYPE dev_phase_status AS ENUM ('planned', 'in_progress', 'completed', 'blocked');

-- ============================================
-- 2. EXTEND EXISTING TABLES
-- ============================================

-- Extend dev_projects table
-- First, add owner_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dev_projects' AND column_name = 'owner_id') THEN
        ALTER TABLE dev_projects ADD COLUMN owner_id TEXT;
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'dev_projects_owner_id_fkey'
    ) THEN
        ALTER TABLE dev_projects 
        ADD CONSTRAINT dev_projects_owner_id_fkey 
        FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE dev_projects 
ADD COLUMN IF NOT EXISTS description_markdown TEXT,
ADD COLUMN IF NOT EXISTS planned_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Extend dev_tasks table
-- First, create a backup of the old status column data
ALTER TABLE dev_tasks ADD COLUMN IF NOT EXISTS old_status VARCHAR(20);
UPDATE dev_tasks SET old_status = status::text WHERE status IS NOT NULL;

-- Drop the old status column constraint and type
ALTER TABLE dev_tasks ALTER COLUMN status DROP DEFAULT;
ALTER TABLE dev_tasks ALTER COLUMN status TYPE dev_task_status USING 
  CASE 
    WHEN old_status = 'pending' THEN 'todo'::dev_task_status
    WHEN old_status = 'in_progress' THEN 'in_progress'::dev_task_status
    WHEN old_status = 'completed' THEN 'completed'::dev_task_status
    ELSE 'todo'::dev_task_status
  END;

-- Drop the old status column
ALTER TABLE dev_tasks DROP COLUMN IF EXISTS old_status;

-- Add new columns to dev_tasks
ALTER TABLE dev_tasks 
ADD COLUMN IF NOT EXISTS priority dev_task_priority DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
ADD COLUMN IF NOT EXISTS assignee_name TEXT,
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- ============================================
-- 3. NEW TABLES
-- ============================================

-- Roadmap Phases table
CREATE TABLE IF NOT EXISTS dev_roadmap_phases (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    planned_end_date TIMESTAMP WITH TIME ZONE,
    status dev_phase_status DEFAULT 'planned',
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project Files table
CREATE TABLE IF NOT EXISTS dev_project_files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    storage_path TEXT,
    file_url TEXT,
    category dev_file_category DEFAULT 'other',
    size_bytes BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Technologies table
CREATE TABLE IF NOT EXISTS dev_technologies (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon_slug VARCHAR(100),
    version VARCHAR(50),
    category dev_tech_category DEFAULT 'other',
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Task Comments table
CREATE TABLE IF NOT EXISTS dev_task_comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES dev_tasks(id) ON DELETE CASCADE,
    author_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    author_name TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. INDEXES
-- ============================================

-- Roadmap phases indexes
CREATE INDEX IF NOT EXISTS idx_dev_roadmap_phases_project_id ON dev_roadmap_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_dev_roadmap_phases_status ON dev_roadmap_phases(status);
CREATE INDEX IF NOT EXISTS idx_dev_roadmap_phases_sort_order ON dev_roadmap_phases(project_id, sort_order);

-- Project files indexes
CREATE INDEX IF NOT EXISTS idx_dev_project_files_project_id ON dev_project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_dev_project_files_category ON dev_project_files(category);

-- Technologies indexes
CREATE INDEX IF NOT EXISTS idx_dev_technologies_project_id ON dev_technologies(project_id);
CREATE INDEX IF NOT EXISTS idx_dev_technologies_category ON dev_technologies(category);

-- Task comments indexes
CREATE INDEX IF NOT EXISTS idx_dev_task_comments_task_id ON dev_task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_dev_task_comments_author_id ON dev_task_comments(author_id);

-- Additional dev_tasks indexes for new columns
CREATE INDEX IF NOT EXISTS idx_dev_tasks_priority ON dev_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_dev_tasks_tags ON dev_tasks USING GIN(tags);

-- ============================================
-- 5. RLS POLICIES
-- ============================================

-- dev_projects policies
DROP POLICY IF EXISTS "Projects are viewable by authenticated users" ON dev_projects;
CREATE POLICY "Projects are viewable by authenticated users" 
ON dev_projects FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create their own projects" ON dev_projects;
CREATE POLICY "Users can create their own projects" 
ON dev_projects FOR INSERT WITH CHECK (owner_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own projects" ON dev_projects;
CREATE POLICY "Users can update their own projects" 
ON dev_projects FOR UPDATE USING (owner_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own projects" ON dev_projects;
CREATE POLICY "Users can delete their own projects" 
ON dev_projects FOR DELETE USING (owner_id = auth.uid()::text);

-- dev_tasks policies
DROP POLICY IF EXISTS "Tasks are viewable by authenticated users" ON dev_tasks;
CREATE POLICY "Tasks are viewable by authenticated users" 
ON dev_tasks FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Project owners can create tasks" ON dev_tasks;
CREATE POLICY "Project owners can create tasks" 
ON dev_tasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM dev_projects WHERE id = dev_tasks.project_id AND owner_id = auth.uid()::text)
);

DROP POLICY IF EXISTS "Project owners can update tasks" ON dev_tasks;
CREATE POLICY "Project owners can update tasks" 
ON dev_tasks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM dev_projects WHERE id = dev_tasks.project_id AND owner_id = auth.uid()::text)
);

DROP POLICY IF EXISTS "Project owners can delete tasks" ON dev_tasks;
CREATE POLICY "Project owners can delete tasks" 
ON dev_tasks FOR DELETE USING (
  EXISTS (SELECT 1 FROM dev_projects WHERE id = dev_tasks.project_id AND owner_id = auth.uid()::text)
);

-- dev_roadmap_phases policies
ALTER TABLE dev_roadmap_phases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Phases are viewable by authenticated users" ON dev_roadmap_phases;
CREATE POLICY "Phases are viewable by authenticated users" 
ON dev_roadmap_phases FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Project owners can manage phases" ON dev_roadmap_phases;
CREATE POLICY "Project owners can manage phases" 
ON dev_roadmap_phases FOR ALL USING (
  EXISTS (SELECT 1 FROM dev_projects WHERE id = dev_roadmap_phases.project_id AND owner_id = auth.uid()::text)
);

-- dev_project_files policies
ALTER TABLE dev_project_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Files are viewable by authenticated users" ON dev_project_files;
CREATE POLICY "Files are viewable by authenticated users" 
ON dev_project_files FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Project owners can manage files" ON dev_project_files;
CREATE POLICY "Project owners can manage files" 
ON dev_project_files FOR ALL USING (
  EXISTS (SELECT 1 FROM dev_projects WHERE id = dev_project_files.project_id AND owner_id = auth.uid()::text)
);

-- dev_technologies policies
ALTER TABLE dev_technologies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Technologies are viewable by authenticated users" ON dev_technologies;
CREATE POLICY "Technologies are viewable by authenticated users" 
ON dev_technologies FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Project owners can manage technologies" ON dev_technologies;
CREATE POLICY "Project owners can manage technologies" 
ON dev_technologies FOR ALL USING (
  EXISTS (SELECT 1 FROM dev_projects WHERE id = dev_technologies.project_id AND owner_id = auth.uid()::text)
);

-- dev_task_comments policies
ALTER TABLE dev_task_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are viewable by authenticated users" ON dev_task_comments;
CREATE POLICY "Comments are viewable by authenticated users" 
ON dev_task_comments FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create comments" ON dev_task_comments;
CREATE POLICY "Authenticated users can create comments" 
ON dev_task_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authors can update their comments" ON dev_task_comments;
CREATE POLICY "Authors can update their comments" 
ON dev_task_comments FOR UPDATE USING (author_id = auth.uid()::text);

DROP POLICY IF EXISTS "Authors can delete their comments" ON dev_task_comments;
CREATE POLICY "Authors can delete their comments" 
ON dev_task_comments FOR DELETE USING (author_id = auth.uid()::text);

-- dev_project_columns policies
DROP POLICY IF EXISTS "Columns are viewable by authenticated users" ON dev_project_columns;
CREATE POLICY "Columns are viewable by authenticated users" 
ON dev_project_columns FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Project owners can manage columns" ON dev_project_columns;
CREATE POLICY "Project owners can manage columns" 
ON dev_project_columns FOR ALL USING (
  EXISTS (SELECT 1 FROM dev_projects WHERE id = dev_project_columns.project_id AND owner_id = auth.uid()::text)
);

-- ============================================
-- 6. TRIGGERS
-- ============================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for tables with updated_at
DROP TRIGGER IF EXISTS update_dev_projects_updated_at ON dev_projects;
CREATE TRIGGER update_dev_projects_updated_at BEFORE UPDATE ON dev_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dev_tasks_updated_at ON dev_tasks;
CREATE TRIGGER update_dev_tasks_updated_at BEFORE UPDATE ON dev_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dev_roadmap_phases_updated_at ON dev_roadmap_phases;
CREATE TRIGGER update_dev_roadmap_phases_updated_at BEFORE UPDATE ON dev_roadmap_phases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. STORAGE BUCKET
-- ============================================

-- Note: Storage buckets need to be created via Supabase Dashboard or API
-- Bucket name: dev-files
-- Public: false
-- File size limit: 52428800 (50MB)
-- Allowed MIME types: *

-- SQL to create bucket (run in Supabase SQL Editor):
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('dev-files', 'dev-files', false, 52428800, '*');

-- RLS policies for storage bucket
-- CREATE POLICY "Authenticated users can upload files" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'dev-files' AND auth.role() = 'authenticated');

-- CREATE POLICY "Project owners can view files" ON storage.objects
-- FOR SELECT USING (bucket_id = 'dev-files' AND auth.role() = 'authenticated');

-- CREATE POLICY "Project owners can delete files" ON storage.objects
-- FOR DELETE USING (bucket_id = 'dev-files' AND auth.role() = 'authenticated');

-- ============================================
-- 8. SAMPLE DATA (OPTIONAL)
-- ============================================

-- Uncomment to insert sample data

-- -- Sample project
-- INSERT INTO dev_projects (owner_id, name, description, description_markdown, color, status, planned_end_date)
-- VALUES (
--   (SELECT id FROM profiles LIMIT 1),
--   'TSS Website Redesign',
--   'Redesign of the main website',
--   '# TSS Website Redesign\n\nComplete overhaul of the website with new design system.',
--   '#ffcb2f',
--   'active',
--   '2026-12-31'
-- );

-- -- Sample technologies
-- INSERT INTO dev_technologies (project_id, name, version, category, description, sort_order)
-- VALUES 
-- (1, 'Next.js', '15.5', 'frontend', 'React framework', 1),
-- (1, 'TypeScript', '5.9', 'frontend', 'Type-safe JavaScript', 2),
-- (1, 'Supabase', 'latest', 'database', 'PostgreSQL backend', 3),
-- (1, 'Tailwind CSS', '4', 'frontend', 'CSS framework', 4);

-- -- Sample roadmap phases
-- INSERT INTO dev_roadmap_phases (project_id, name, description, status, completion_percentage, sort_order)
-- VALUES 
-- (1, 'Planning', 'Initial planning phase', 'completed', 100, 1),
-- (1, 'Design', 'UI/UX design', 'in_progress', 60, 2),
-- (1, 'Development', 'Frontend and backend', 'planned', 0, 3),
-- (1, 'Testing', 'QA and testing', 'planned', 0, 4);

-- -- Sample tasks
-- INSERT INTO dev_tasks (project_id, title, description, status, priority, progress_percent, tags)
-- VALUES 
-- (1, 'Setup project structure', 'Initialize Next.js project with TypeScript', 'completed', 'high', 100, ARRAY['setup']),
-- (1, 'Design system components', 'Create reusable UI components', 'in_progress', 'medium', 45, ARRAY['design', 'frontend']),
-- (1, 'Database schema design', 'Design and implement database schema', 'todo', 'high', 0, ARRAY['backend', 'database']);

-- ============================================
-- END OF SCHEMA
-- ============================================
