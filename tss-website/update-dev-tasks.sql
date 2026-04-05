-- Update dev_tasks table to match API expectations

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add priority column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dev_tasks' AND column_name = 'priority'
    ) THEN
        ALTER TABLE dev_tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'medium';
    END IF;
    
    -- Add estimated_hours column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dev_tasks' AND column_name = 'estimated_hours'
    ) THEN
        ALTER TABLE dev_tasks ADD COLUMN estimated_hours INTEGER DEFAULT 0;
    END IF;
    
    -- Add created_by column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dev_tasks' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE dev_tasks ADD COLUMN created_by VARCHAR(50);
    END IF;
    
    -- Update status column to include 'todo' enum value if not exists
    -- This is handled automatically by PostgreSQL when using ALTER TYPE
END $$;

-- Add index for priority column if it doesn't exist
CREATE INDEX IF NOT EXISTS dev_tasks_priority_idx ON dev_tasks(priority);
