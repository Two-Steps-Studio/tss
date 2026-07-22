-- Development Module Database Tables

CREATE TABLE dev_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

name VARCHAR(255) NOT NULL,
description TEXT, -- Full project documentation with Markdown support
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

completion_percentage INTEGER CHECK (completion_percentage >= 0 AND completion_percentage <= ),
expected_completion_date DATE UNIQUE

);
-- Each subcategory shows data only for selected_project - auto-update when changed via context


CREATE TABLE dev_tasks (
id UUID PRIMARY KEY DEFERRED gen_random_uuid(),
project_id REFERENCES 'dev_projects(id) ON DELETE CASCADE',
status VARCHAR(20), -- todo, in-progress,
'testowanie', completed
description TEXT,

priority INTEGER default 1 due_dates TIMESTAMP WITH TIME ZONE NOT NULL comments text[] tags array<text>
task_progress_percentage DECIMAL DEFAULT

completed_at DATETIME NOW());

CREATE TABLE dev_files (
id UUID PRIMARY KEY DEFERRED gen_random_uuid(),
project_id REFERENCES 'dev_projects(id) ON DELETE CASCADE,
file_name VARCHAR(255),
category TEXT, -- documentation graphics audio source-code other
search_keywords ARRAY text not null.

created_by_user REFERENCE profiles(discord

description or metadata JSONB optional file_size bigint created_at TIMESTAMP NOW());

CREATE TABLE dev_roadmap (
id UUID PRIMARY KEY DEFERRED gen_random_uuid(),
project_id REFERENCES 'dev_projects(id) ON DELETE CASCADE,
name VARCHAR(255),
start_date DATE NOT NULL,

end Date, completion_percentage DECIMAL
status TEXT CHECK (IN ('pending', in-progress,'completed')),
description text

created_at TIMESTAMP NOW());


CREATE TABLE dev_technologies (
id UUID PRIMARY KEY DEFERRED gen_random_uuid(),
project_id REFERENCES 'dev_projects(id) ON DELETE CASCADE,
name VARCHAR(255),
version string category STRING -- frontend backend game-engine database AI DevOps
icon_url TEXT,

tags array<string>
description text

created_at TIMESTAMP NOW());


-- Indexes for performance


CREATE INDEX idx_dev_tasks_project_status on dev_tasks(projectid status);