-- Tabela projektów DEV (związana z userem via discord_id)
CREATE TABLE IF NOT EXISTS dev_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id TEXT REFERENCES profiles(discord_id),  -- Discord ID właściciela projektu
    name VARCHAR(255) NOT NULL,                       -- Nazwa projektu
    description TEXT,                                  -- Krótki opis/summary
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Daty i status
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    planned_end_date DATE,                             -- Planowana data zakończenia
    
    -- Status projektu
    is_active BOOLEAN DEFAULT TRUE,                    -- Czy projekt jest aktywny
    completed_at DATE                                  -- Data ukończenia (opcjonalne)
    
);

-- Tabela zadań DEV (Kanban board items)
CREATE TABLE IF NOT EXISTS dev_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES dev_projects(id),       -- Link do projektu
    
    -- Dane zadania
    title VARCHAR(255) NOT NULL,                       -- Nazwa zadania
    description TEXT,                                  -- Pełny opis
    priority SMALLINT CHECK (priority >= 0 AND priority <= 10) DEFAULT 5,  -- Priorytet (0-10)
    
    termin_execucia DATE,                              -- Termin wykonania
    
    assigned_to TEXT REFERENCES profiles(discord_id),   -- Osoba odpowiedzialna (opcjonalne)
    
    -- Status w kanbanie
    status VARCHAR(20) NOT NULL DEFAULT 'todo'         -- todo | in_progress | testing | done
        CHECK (status IN ('todo', 'in_progress', 'testing', 'done')),
    
    progress INTEGER DEFAULT 0,                        % wykonania
    is_completed BOOLEAN DEFAULT FALSE,               Czy zadanie jest zakończone
    
    labels JSONB DEFAULT '[]',                         -- Etykiety [] = ""["feature", "bug"]"
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at DATE                                   -- Data ukończenia (opcjonalne)
);

CREATE INDEX idx_dev_tasks_project ON dev_tasks(project_id);
CREATE INDEX idx_dev_tasks_status ON dev_tasks(status);
CREATE INDEX idx_dev_tasks_priority ON dev_tasks(priority DESC);


-- Tabela etapów roadmapy (milestones, timeline items)
CREATE TABLE IF NOT EXISTS dev_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES dev_projects(id),       -- Link do projektu
    
    title VARCHAR(255) NOT NULL,                       -- Nazwa etapu/milestone
    description TEXT,                                  -- Opis
    
    start_date DATE NOT NULL,                          -- Data rozpoczęcia
    planned_end_date DATE,                             -- Planowana data zakończenia
    actual_end_date DATE                               -- faktyczna (opcjonalne)
    
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

is_active BOOLEAN DEFAULT TRUE,                      Czy etap jest aktywny
    
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- Tabela plików DEV (files manager - dokumentacja, grafiki etc.)
CREATE TABLE IF NOT EXISTS dev_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES dev_projects(id),       -- Link do projektu
    
    name VARCHAR(500) NOT NULL,                        Nazwa pliku
    original_filename VARCHAR(500),                    Oryginalna nazwa
    file_path TEXT NOT NULL,                           Ścieżka do pliku (obrazek lub content:// path)
    
    category VARCHAR(50) DEFAULT 'Other',              Kategoria: Dokumentacja | Grafiki itd.
        CHECK (category IN ('Documentation', 'Images', 'Code', 'Audio', 
                            'Videos', 'Design', 'Archive', 'Other')),
    
    mime_type TEXT,                                    -- Content-Type z media
    
    file_size INTEGER DEFAULT 0,                       -- W bajtach
    
    is_public BOOLEAN DEFAULT FALSE,                    Czy publicznie dostępny (opcjonalne)
    
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATE                                     Czas usunięcia (soft delete - opcjonalne)
);

CREATE INDEX idx_dev_files_project ON dev_files(project_id);


-- Tabela dokumentacji DEV Editor.md editor content storage
CREATE TABLE IF NOT EXISTS dev_documentation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES dev_projects(id),       -- Link do projektu
    
    title VARCHAR(255) NOT NULL,                       Title of the documentation section.
    
    md_content TEXT NOT NULL,                          Markdown content for rendering in README view.
    
    is_published BOOLEAN DEFAULT FALSE                 Czy sekcja jest publikowana w readme.md?
);

CREATE INDEX idx_dev_doc_project ON dev_documentation(project_id);


-- Tabela technologii DEV (tech stack per project)  
CREATE TABLE IF NOT EXISTS dev_technologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES dev_projects(id),       -- Link do projektu
    
    name VARCHAR(100) NOT NULL,                        Technologie np. React Node.js etc..
    
 version TEXT DEFAULT 'latest',                       wersja technologicznej
   
 category VARCHAR(50) DEFAULT 'Frontend'              Kategoria: Frontend | Backend itd.

 icon_url TEXT,                                       URL ikony z CDN (np. uniswap logo)


    description TEXT,                                  Krótki opis użycia tej technologii w projekcie
    
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dev_tech_project ON dev_technologies(project_id);


-- Tabela komentarzy do zadań (task comments thread per task)  
COMMENT on table dev_tasks FOR COLUMN assigned_to is 'Discord ID użytkownika, który odpowiada za to zadanie';
COMMENT on table dev_tasks FOR COLUMN priority is 'Priorytet: 0=niskie | 5=domyślnie | 10=awaryjne/critical bug';

