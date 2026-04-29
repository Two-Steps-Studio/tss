-- Migration: dodaj brakujące elementy do istniejącej bazy DEV

-- 1. Dodaj typ statusów (jeśli nie istnieje)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
    RAISE NOTICE 'Dodano typ task_status';
  ELSE
    RAISE NOTICE 'Typ task_status już istnieje';
  END IF;
END $$;

-- 2. Dodaj tabele DEV (jeśli nie istnieją)
CREATE TABLE IF NOT EXISTS dev_projects (
    id SERIAL PRIMARY KEY,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#ffcb2f',
    status VARCHAR(20) DEFAULT 'active',
    columns JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dev_project_columns (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3b82f6',
    position INT DEFAULT 0,
    icon VARCHAR(50),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Dodaj nowe pola do istniejącej dev_tasks
ALTER TABLE dev_tasks
ADD COLUMN IF NOT EXISTS project_id INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS status task_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 4. Dodaj indeksy
CREATE INDEX IF NOT EXISTS dev_tasks_project_status_idx ON dev_tasks(project_id, status);
CREATE INDEX IF NOT EXISTS dev_tasks_priority_idx ON dev_tasks(priority);
CREATE INDEX IF NOT EXISTS dev_tasks_due_date_idx ON dev_tasks(due_date);

-- 5. Dodaj domyślne projekty i kolumny
INSERT INTO dev_projects (name, description, color, owner_id)
VALUES (
  'Two Steps Studio',
  'Główny projekt DEV',
  '#ffcb2f',
  (SELECT id FROM profiles WHERE username = 'Kenikusss' LIMIT 1)
)
ON CONFLICT DO NOTHING;

INSERT INTO dev_project_columns (project_id, name, color, position)
SELECT 1, 'Backlog', '#64748b', 0
WHERE NOT EXISTS (SELECT 1 FROM dev_project_columns WHERE project_id = 1)
ON CONFLICT DO NOTHING;

INSERT INTO dev_project_columns (project_id, name, color, position)
SELECT 1, 'To Do', '#3b82f6', 1
WHERE NOT EXISTS (SELECT 1 FROM dev_project_columns WHERE project_id = 1)
ON CONFLICT DO NOTHING;

INSERT INTO dev_project_columns (project_id, name, color, position)
SELECT 1, 'In Progress', '#f59e0b', 2
WHERE NOT EXISTS (SELECT 1 FROM dev_project_columns WHERE project_id = 1)
ON CONFLICT DO NOTHING;

INSERT INTO dev_project_columns (project_id, name, color, position)
SELECT 1, 'Done', '#10b981', 3
WHERE NOT EXISTS (SELECT 1 FROM dev_project_columns WHERE project_id = 1)
ON CONFLICT DO NOTHING;

-- 6. Dodaj przykładowe zadania
INSERT INTO dev_tasks (title, description, status, priority, tags) VALUES
  ('Przebuduj profil użytkownika', 'Dodaj edycję awatara, zmianę hasła i ustawień', 'pending', 'high', '{feature,design}'),
  ('Ulepsz gamification', 'Dodaj nową rangę i badge''y', 'in_progress', 'medium', '{feature}'),
  ('Fix: błędy w Discord botcie', 'Napraw wyłapywanie błędów', 'pending', 'critical', '{bug}'),
  ('Dodaj nowe badges', 'Rozbuduj system odznak', 'pending', 'low', '{feature}'),
  ('Optymalizacja bazy', 'Dodaj indeksy i optymalizacje', 'pending', 'medium', '{chore}'),
  ('Rewizja UI/UX', 'Przeanalizuj i ulepsz interfejs', 'pending', 'medium', '{design}');

-- 7. Usuń stary rekord w notifications (jeśli istnieje)
DELETE FROM notifications WHERE user_id IS NULL;
