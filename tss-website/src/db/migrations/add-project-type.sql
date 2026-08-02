-- Create enum for project types first
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_type') THEN
        CREATE TYPE project_type AS ENUM (
            'general',
            'web_application',
            'mobile_application',
            'desktop_application',
            'game',
            'api',
            'library',
            'plugin',
            'other'
        );
    END IF;
END $$;

-- Add project_type column to dev_projects table with proper enum type
ALTER TABLE dev_projects ADD COLUMN IF NOT EXISTS project_type project_type DEFAULT 'general';

-- Add constraint to ensure project_type is not null
ALTER TABLE dev_projects ALTER COLUMN project_type SET NOT NULL;
