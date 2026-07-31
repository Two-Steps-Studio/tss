-- Phase 2 Performance Migration
-- Combines RPC function and performance indexes for TSS project

-- =====================================================
-- RPC FUNCTION: get_site_stats
-- Optimized single-query statistics for site stats API
-- =====================================================

CREATE OR REPLACE FUNCTION get_site_stats()
RETURNS TABLE (
  online_site BIGINT,
  online_logged_in BIGINT,
  online_anonymous BIGINT,
  total_profiles BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  threshold TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate threshold for online users (5 minutes ago)
  threshold := NOW() - INTERVAL '5 minutes';
  
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM site_sessions WHERE last_seen >= threshold) AS online_site,
    (SELECT COUNT(*) FROM site_sessions WHERE last_seen >= threshold AND user_id IS NOT NULL) AS online_logged_in,
    (SELECT COUNT(*) FROM site_sessions WHERE last_seen >= threshold AND user_id IS NULL) AS online_anonymous,
    (SELECT COUNT(*) FROM profiles) AS total_profiles;
END;
$$;

-- Grant execute permission to authenticated users
-- Note: Adjust role name based on your Supabase setup
-- GRANT EXECUTE ON FUNCTION get_site_stats() TO authenticated;

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications("read");
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, "read");

-- User badges table indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_badge ON user_badges(user_id, badge_id);

-- Daily quests table indexes
CREATE INDEX IF NOT EXISTS idx_daily_quests_user_id ON daily_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_quests_quest_id ON daily_quests(quest_id);
CREATE INDEX IF NOT EXISTS idx_daily_quests_user_quest ON daily_quests(user_id, quest_id);

-- Seasons table indexes
CREATE INDEX IF NOT EXISTS idx_seasons_active ON seasons(active);

-- Season rankings table indexes
CREATE INDEX IF NOT EXISTS idx_season_rankings_season_id ON season_rankings(season_id);
CREATE INDEX IF NOT EXISTS idx_season_rankings_user_id ON season_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_season_rankings_season_user ON season_rankings(season_id, user_id);

-- Site sessions table indexes (for site stats)
CREATE INDEX IF NOT EXISTS idx_site_sessions_last_seen ON site_sessions(last_seen);
CREATE INDEX IF NOT EXISTS idx_site_sessions_user_id ON site_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_site_sessions_last_seen_user ON site_sessions(last_seen, user_id);

-- Dev projects table indexes
CREATE INDEX IF NOT EXISTS idx_dev_projects_owner_id ON dev_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_dev_projects_status ON dev_projects(status);
CREATE INDEX IF NOT EXISTS idx_dev_projects_created_at ON dev_projects(created_at);

-- Dev project members table indexes
CREATE INDEX IF NOT EXISTS idx_dev_project_members_user_id ON dev_project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_dev_project_members_project_id ON dev_project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_dev_project_members_user_project ON dev_project_members(user_id, project_id);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

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

-- Verify RPC function was created
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_site_stats';
