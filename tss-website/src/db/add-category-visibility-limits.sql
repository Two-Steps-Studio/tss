-- Migration script to add category visibility and project limits to existing profiles table
-- Run this in Supabase SQL Editor

-- Add project_limit column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'project_limit') THEN
        ALTER TABLE profiles ADD COLUMN project_limit INTEGER DEFAULT 1;
    END IF;
END $$;

-- Add joined_projects_limit column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'joined_projects_limit') THEN
        ALTER TABLE profiles ADD COLUMN joined_projects_limit INTEGER DEFAULT 3;
    END IF;
END $$;

-- Add subscription_plan column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_plan') THEN
        ALTER TABLE profiles ADD COLUMN subscription_plan TEXT DEFAULT 'free';
    END IF;
END $$;

-- Add games_visible column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'games_visible') THEN
        ALTER TABLE profiles ADD COLUMN games_visible BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Add records_visible column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'records_visible') THEN
        ALTER TABLE profiles ADD COLUMN records_visible BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Add dev_visible column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'dev_visible') THEN
        ALTER TABLE profiles ADD COLUMN dev_visible BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Set remaining NULL values to defaults
UPDATE profiles 
SET 
    project_limit = COALESCE(project_limit, 1),
    joined_projects_limit = COALESCE(joined_projects_limit, 3),
    subscription_plan = COALESCE(subscription_plan, 'free'),
    games_visible = COALESCE(games_visible, TRUE),
    records_visible = COALESCE(records_visible, TRUE),
    dev_visible = COALESCE(dev_visible, TRUE)
WHERE 
    project_limit IS NULL 
    OR joined_projects_limit IS NULL 
    OR subscription_plan IS NULL
    OR games_visible IS NULL 
    OR records_visible IS NULL 
    OR dev_visible IS NULL;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN (
    'project_limit', 
    'joined_projects_limit', 
    'subscription_plan',
    'games_visible', 
    'records_visible', 
    'dev_visible'
)
ORDER BY column_name;
