-- Migration script to add performance indexes
-- Run this in Supabase SQL Editor

-- Add missing column to notifications table if it doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'notifications'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'read'
    ) THEN
        ALTER TABLE notifications ADD COLUMN "read" BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Profiles table indexes
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
        CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp);
        CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level);
        CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);
    END IF;
END $$;

-- Notifications table indexes
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications("read");
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
        CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, "read");
    END IF;
END $$;

-- User badges table indexes
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_badges') THEN
        CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
        CREATE INDEX IF NOT EXISTS idx_user_badges_user_badge ON user_badges(user_id, badge_id);
    END IF;
END $$;

-- Daily quests table indexes (definition table, no user_id)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_quests') THEN
        CREATE INDEX IF NOT EXISTS idx_daily_quests_quest_name ON daily_quests(quest_name);
    END IF;
END $$;

-- User daily progress table indexes
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_daily_progress') THEN
        CREATE INDEX IF NOT EXISTS idx_user_daily_progress_user_id ON user_daily_progress(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_daily_progress_quest_id ON user_daily_progress(quest_id);
        CREATE INDEX IF NOT EXISTS idx_user_daily_progress_user_quest ON user_daily_progress(user_id, quest_id);
    END IF;
END $$;

-- Weekly quests table indexes (definition table, no user_id)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weekly_quests') THEN
        CREATE INDEX IF NOT EXISTS idx_weekly_quests_quest_name ON weekly_quests(quest_name);
    END IF;
END $$;

-- User weekly progress table indexes
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_weekly_progress') THEN
        CREATE INDEX IF NOT EXISTS idx_user_weekly_progress_user_id ON user_weekly_progress(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_weekly_progress_quest_id ON user_weekly_progress(quest_id);
        CREATE INDEX IF NOT EXISTS idx_user_weekly_progress_user_quest ON user_weekly_progress(user_id, quest_id);
    END IF;
END $$;

-- Seasons table indexes
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seasons') THEN
        CREATE INDEX IF NOT EXISTS idx_seasons_active ON seasons(active);
    END IF;
END $$;

-- Season rankings table indexes
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'season_rankings') THEN
        CREATE INDEX IF NOT EXISTS idx_season_rankings_season_id ON season_rankings(season_id);
        CREATE INDEX IF NOT EXISTS idx_season_rankings_user_id ON season_rankings(user_id);
        CREATE INDEX IF NOT EXISTS idx_season_rankings_season_user ON season_rankings(season_id, user_id);
    END IF;
END $$;

-- Site sessions table indexes (for site stats)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_sessions') THEN
        CREATE INDEX IF NOT EXISTS idx_site_sessions_last_seen ON site_sessions(last_seen);
        CREATE INDEX IF NOT EXISTS idx_site_sessions_user_id ON site_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_site_sessions_last_seen_user ON site_sessions(last_seen, user_id);
    END IF;
END $$;

-- Dev projects table indexes
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dev_projects') THEN
        CREATE INDEX IF NOT EXISTS idx_dev_projects_owner_id ON dev_projects(owner_id);
        CREATE INDEX IF NOT EXISTS idx_dev_projects_status ON dev_projects(status);
        CREATE INDEX IF NOT EXISTS idx_dev_projects_created_at ON dev_projects(created_at);
    END IF;
END $$;

-- Dev project members table indexes
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dev_project_members') THEN
        CREATE INDEX IF NOT EXISTS idx_dev_project_members_user_id ON dev_project_members(user_id);
        CREATE INDEX IF NOT EXISTS idx_dev_project_members_project_id ON dev_project_members(project_id);
        CREATE INDEX IF NOT EXISTS idx_dev_project_members_user_project ON dev_project_members(user_id, project_id);
    END IF;
END $$;

-- Verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN (
    'profiles', 
    'notifications', 
    'user_badges', 
    'daily_quests', 
    'seasons', 
    'season_rankings',
    'site_sessions',
    'dev_projects',
    'dev_project_members'
)
ORDER BY tablename, indexname;
