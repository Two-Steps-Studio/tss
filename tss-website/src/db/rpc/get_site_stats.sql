-- RPC function to get site statistics
-- Optimized to run aggregations in PostgreSQL instead of multiple queries

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
