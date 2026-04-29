-- Migration dla istniejącej bazy Two Steps Studio
-- Uruchom w Supabase SQL Editor lub psql

-- ========================================
-- KROK 1: Dodaj typ task_status
-- ========================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
    RAISE NOTICE 'Dodano typ task_status';
  END IF;
END $$;

-- ========================================
-- KROK 2: Dodaj tablice DEV (jeśli nie istnieją)
-- ========================================

-- Projects table (bez owner_id dla teraz - można dodać później)
CREATE TABLE IF NOT EXISTS dev_projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#ffcb2f',
    status VARCHAR(20) DEFAULT 'active',
    columns JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project columns (kanban columns per project)
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

-- ========================================
-- KROK 3: Dodaj pola do istniejącej dev_tasks
-- ========================================

-- Usuń starszą tabelę (opcjonalnie - jeśli chcesz clean slate)
-- DROP TABLE IF EXISTS dev_tasks CASCADE;

-- Jeśli chcesz rozszerzyć istniejącą tabelę:
ALTER TABLE IF EXISTS dev_tasks
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

-- ========================================
-- KROK 4: Dodaj indeksy
-- ========================================
CREATE INDEX IF NOT EXISTS dev_tasks_project_status_idx ON dev_tasks(project_id, status);
CREATE INDEX IF NOT EXISTS dev_tasks_priority_idx ON dev_tasks(priority);
CREATE INDEX IF NOT EXISTS dev_tasks_due_date_idx ON dev_tasks(due_date);

-- ========================================
-- KROK 5: Dodaj domyślne projekty i kolumny
-- ========================================

-- Dodaj domyślny projekt (jeśli nie istnieje)
INSERT INTO dev_projects (name, description, color, created_at)
VALUES ('Two Steps Studio', 'Główny projekt DEV', '#ffcb2f', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Dodaj domyślne kolumny (jeśli nie istnieją)
INSERT INTO dev_project_columns (project_id, name, color, position, created_at)
SELECT 1, 'Backlog', '#64748b', 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM dev_project_columns WHERE project_id = 1 AND name = 'Backlog')
ON CONFLICT (id) DO NOTHING;

INSERT INTO dev_project_columns (project_id, name, color, position, created_at)
SELECT 1, 'To Do', '#3b82f6', 1, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM dev_project_columns WHERE project_id = 1 AND name = 'To Do')
ON CONFLICT (id) DO NOTHING;

INSERT INTO dev_project_columns (project_id, name, color, position, created_at)
SELECT 1, 'In Progress', '#f59e0b', 2, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM dev_project_columns WHERE project_id = 1 AND name = 'In Progress')
ON CONFLICT (id) DO NOTHING;

INSERT INTO dev_project_columns (project_id, name, color, position, created_at)
SELECT 1, 'Done', '#10b981', 3, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM dev_project_columns WHERE project_id = 1 AND name = 'Done')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- KROK 6: Dodaj przykładowe zadania (opcjonalnie)
-- ========================================

INSERT INTO dev_tasks (title, description, status, priority, tags, created_at) VALUES
  ('Przebuduj profil użytkownika', 'Dodaj edycję awatara, zmianę hasła i ustawień', 'pending', 'high', '{feature,design}', CURRENT_TIMESTAMP),
  ('Ulepsz gamification', 'Dodaj nową rangę i badge''y za aktywność', 'in_progress', 'medium', '{feature}', CURRENT_TIMESTAMP),
  ('Fix: błędy w Discord botcie', 'Napraw wyłapywanie błędów w Discord botcie', 'pending', 'critical', '{bug}', CURRENT_TIMESTAMP),
  ('Dodaj nowe badges', 'Rozbuduj system odznak dla użytkowników', 'pending', 'low', '{feature}', CURRENT_TIMESTAMP),
  ('Optymalizacja bazy', 'Dodaj indeksy i optymalizacje SQL', 'pending', 'medium', '{chore}', CURRENT_TIMESTAMP),
  ('Rewizja UI/UX', 'Przeanalizuj i ulepsz interfejs', 'pending', 'medium', '{design}', CURRENT_TIMESTAMP),
  ('Implementacja Discord API', 'Dokończ integrację Discord', 'pending', 'high', '{feature}', CURRENT_TIMESTAMP),
  ('Testy wydajnościowe', 'Przeprowadź pełny test wydajności', 'pending', 'medium', '{testing}', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Usuń stare rekordy w notifications bez użytkownika
DELETE FROM notifications WHERE user_id IS NULL;

-- ========================================
-- KONIEC MIGRACJI
-- ========================================
