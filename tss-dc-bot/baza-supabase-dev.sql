-- DEV Module — pełna migracja
-- Uruchom w Supabase SQL Editor

-- Rozszerzenie dev_projects
ALTER TABLE dev_projects
  ADD COLUMN IF NOT EXISTS planned_end_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS description_markdown TEXT;

-- Status zadań: dodaj 'testing' do enum (jeśli używasz task_status)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'testing';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Dodatkowe pola zadań
ALTER TABLE dev_tasks
  ADD COLUMN IF NOT EXISTS progress_percent INT DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  ADD COLUMN IF NOT EXISTS assignee_name VARCHAR(255);

-- Roadmapa
CREATE TABLE IF NOT EXISTS dev_roadmap_phases (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ,
  planned_end_date TIMESTAMPTZ,
  status VARCHAR(30) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'blocked')),
  completion_percentage INT DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dev_roadmap_phases_project_idx ON dev_roadmap_phases(project_id);

-- Komentarze do zadań
CREATE TABLE IF NOT EXISTS dev_task_comments (
  id SERIAL PRIMARY KEY,
  task_id INT NOT NULL REFERENCES dev_tasks(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dev_task_comments_task_idx ON dev_task_comments(task_id);

-- Pliki projektu
CREATE TABLE IF NOT EXISTS dev_project_files (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  storage_path TEXT,
  file_url TEXT,
  category VARCHAR(30) DEFAULT 'other' CHECK (category IN ('documentation', 'graphics', 'audio', 'source_code', 'other')),
  size_bytes BIGINT,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dev_project_files_project_idx ON dev_project_files(project_id);

-- Technologie
CREATE TABLE IF NOT EXISTS dev_project_technologies (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon_slug VARCHAR(50),
  version VARCHAR(50),
  category VARCHAR(30) DEFAULT 'other' CHECK (category IN ('frontend', 'backend', 'game_engine', 'database', 'ai', 'devops', 'other')),
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dev_project_technologies_project_idx ON dev_project_technologies(project_id);
