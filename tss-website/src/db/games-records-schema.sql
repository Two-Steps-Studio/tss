-- Games & Records Database Schema for Two Steps Studio
-- This schema adds games, music tracks, and podcasts to the existing TSS database

-- ============================================
-- 1. ENUMS
-- ============================================

-- Game Status
DO $$ BEGIN
  CREATE TYPE game_status AS ENUM ('draft', 'published', 'archived', 'coming_soon');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Game Category
DO $$ BEGIN
  CREATE TYPE game_category AS ENUM ('action', 'adventure', 'rpg', 'strategy', 'simulation', 'sports', 'racing', 'puzzle', 'horror', 'indie', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Music Genre
DO $$ BEGIN
  CREATE TYPE music_genre AS ENUM ('pop', 'rock', 'hip_hop', 'electronic', 'classical', 'jazz', 'blues', 'country', 'reggae', 'metal', 'indie', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Visibility
DO $$ BEGIN
  CREATE TYPE visibility AS ENUM ('public', 'private', 'unlisted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. GAMES TABLES
-- ============================================

-- Main games table
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    short_description TEXT,
    full_description TEXT,
    version VARCHAR(50),
    developer VARCHAR(255),
    publisher VARCHAR(255),
    release_date DATE,
    category game_category DEFAULT 'indie',
    genres TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    banner_url TEXT,
    download_url TEXT,
    changelog TEXT,
    status game_status DEFAULT 'draft',
    visibility visibility DEFAULT 'private',
    featured BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Game screenshots
CREATE TABLE IF NOT EXISTS game_screenshots (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add position column if it doesn't exist (for existing tables)
DO $$ BEGIN
  ALTER TABLE game_screenshots ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
EXCEPTION
  WHEN others THEN null;
END $$; 

-- Game system requirements
CREATE TABLE IF NOT EXISTS game_requirements (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    requirement_type VARCHAR(50) DEFAULT 'minimum', -- minimum, recommended
    os VARCHAR(255),
    processor VARCHAR(255),
    memory VARCHAR(255),
    graphics VARCHAR(255),
    storage VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. MUSIC TABLES
-- ============================================

-- Music tracks table
CREATE TABLE IF NOT EXISTS music_tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album VARCHAR(255),
    genre music_genre DEFAULT 'indie',
    release_date DATE,
    duration_seconds INTEGER,
    cover_image_url TEXT,
    audio_file_url TEXT,
    description TEXT,
    lyrics TEXT,
    spotify_url TEXT,
    youtube_url TEXT,
    soundcloud_url TEXT,
    tags TEXT[] DEFAULT '{}',
    visibility visibility DEFAULT 'private',
    featured BOOLEAN DEFAULT FALSE,
    plays INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. PODCASTS TABLES
-- ============================================

-- Podcast series (optional, for organizing episodes)
CREATE TABLE IF NOT EXISTS podcast_series (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    host VARCHAR(255),
    visibility visibility DEFAULT 'private',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Podcast episodes
CREATE TABLE IF NOT EXISTS podcasts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    episode_number INTEGER,
    season INTEGER DEFAULT 1,
    host VARCHAR(255),
    guests TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    audio_file_url TEXT,
    published_date DATE,
    duration_seconds INTEGER,
    tags TEXT[] DEFAULT '{}',
    visibility visibility DEFAULT 'private',
    featured BOOLEAN DEFAULT FALSE,
    plays INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add series_id column if it doesn't exist (for existing tables)
DO $$ BEGIN
  ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS series_id INTEGER REFERENCES podcast_series(id) ON DELETE SET NULL;
EXCEPTION
  WHEN others THEN null;
END $$;

-- ============================================
-- 5. INDEXES
-- ============================================

-- Games indexes
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_games_visibility ON games(visibility);
CREATE INDEX IF NOT EXISTS idx_games_featured ON games(featured);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);

-- Game screenshots indexes
CREATE INDEX IF NOT EXISTS idx_game_screenshots_game_id ON game_screenshots(game_id);
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_game_screenshots_position ON game_screenshots(position);
EXCEPTION
  WHEN others THEN null;
END $$;

-- Game requirements indexes
CREATE INDEX IF NOT EXISTS idx_game_requirements_game_id ON game_requirements(game_id);

-- Music indexes
CREATE INDEX IF NOT EXISTS idx_music_genre ON music_tracks(genre);
CREATE INDEX IF NOT EXISTS idx_music_visibility ON music_tracks(visibility);
CREATE INDEX IF NOT EXISTS idx_music_featured ON music_tracks(featured);
CREATE INDEX IF NOT EXISTS idx_music_created_at ON music_tracks(created_at DESC);

-- Podcast series indexes
CREATE INDEX IF NOT EXISTS idx_podcast_series_visibility ON podcast_series(visibility);

-- Podcasts indexes
CREATE INDEX IF NOT EXISTS idx_podcasts_series_id ON podcasts(series_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_visibility ON podcasts(visibility);
CREATE INDEX IF NOT EXISTS idx_podcasts_featured ON podcasts(featured);
CREATE INDEX IF NOT EXISTS idx_podcasts_season ON podcasts(season);
CREATE INDEX IF NOT EXISTS idx_podcasts_created_at ON podcasts(created_at DESC);

-- ============================================
-- 6. TRIGGERS
-- ============================================

-- Update updated_at timestamp for games
CREATE OR REPLACE FUNCTION update_games_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_games_updated_at();

-- Update updated_at timestamp for music tracks
CREATE TRIGGER trigger_update_music_updated_at
    BEFORE UPDATE ON music_tracks
    FOR EACH ROW
    EXECUTE FUNCTION update_games_updated_at();

-- Update updated_at timestamp for podcast series
CREATE TRIGGER trigger_update_podcast_series_updated_at
    BEFORE UPDATE ON podcast_series
    FOR EACH ROW
    EXECUTE FUNCTION update_games_updated_at();

-- Update updated_at timestamp for podcasts
CREATE TRIGGER trigger_update_podcasts_updated_at
    BEFORE UPDATE ON podcasts
    FOR EACH ROW
    EXECUTE FUNCTION update_games_updated_at();

-- Increment views when game is viewed (call this manually via API)
CREATE OR REPLACE FUNCTION increment_game_views(game_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE games SET views = views + 1 WHERE id = game_id;
END;
$$ language 'plpgsql';

-- Increment downloads when game is downloaded (call this manually via API)
CREATE OR REPLACE FUNCTION increment_game_downloads(game_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE games SET downloads = downloads + 1 WHERE id = game_id;
END;
$$ language 'plpgsql';

-- Increment plays when music track is played (call this manually via API)
CREATE OR REPLACE FUNCTION increment_music_plays(track_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE music_tracks SET plays = plays + 1 WHERE id = track_id;
END;
$$ language 'plpgsql';

-- Increment plays when podcast is played (call this manually via API)
CREATE OR REPLACE FUNCTION increment_podcast_plays(podcast_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE podcasts SET plays = plays + 1 WHERE id = podcast_id;
END;
$$ language 'plpgsql';

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
DO $$ BEGIN
  ALTER TABLE games ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE game_screenshots ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE game_requirements ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE podcast_series ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN null;
END $$;

-- Games RLS Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can read published games" ON games;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE POLICY "Public can read published games" ON games
    FOR SELECT USING (visibility = 'public' AND status = 'published');

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can read all games" ON games;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE POLICY "Authenticated users can read all games" ON games
    FOR SELECT USING (auth.role() = 'authenticated');

DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role can manage games" ON games;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE POLICY "Service role can manage games" ON games
    FOR ALL USING (auth.role() = 'service_role');

-- Game screenshots RLS Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can read screenshots" ON game_screenshots;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE POLICY "Public can read screenshots" ON game_screenshots
    FOR SELECT USING (true);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role can manage screenshots" ON game_screenshots;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE POLICY "Service role can manage screenshots" ON game_screenshots
    FOR ALL USING (auth.role() = 'service_role');

-- Game requirements RLS Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can read requirements" ON game_requirements;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE POLICY "Public can read requirements" ON game_requirements
    FOR SELECT USING (true);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role can manage requirements" ON game_requirements;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE POLICY "Service role can manage requirements" ON game_requirements
    FOR ALL USING (auth.role() = 'service_role');

-- Music tracks RLS Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can read published music" ON music_tracks;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE POLICY "Public can read published music" ON music_tracks
    FOR SELECT USING (visibility = 'public');

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can read all music" ON music_tracks;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE POLICY "Authenticated users can read all music" ON music_tracks
    FOR SELECT USING (auth.role() = 'authenticated');

DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role can manage music" ON music_tracks;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE POLICY "Service role can manage music" ON music_tracks
    FOR ALL USING (auth.role() = 'service_role');

-- Podcast series RLS Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can read published series" ON podcast_series;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE POLICY "Public can read published series" ON podcast_series
    FOR SELECT USING (visibility = 'public');

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can read all series" ON podcast_series;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE POLICY "Authenticated users can read all series" ON podcast_series
    FOR SELECT USING (auth.role() = 'authenticated');

DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role can manage series" ON podcast_series;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE POLICY "Service role can manage series" ON podcast_series
    FOR ALL USING (auth.role() = 'service_role');

-- Podcasts RLS Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can read published podcasts" ON podcasts;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE POLICY "Public can read published podcasts" ON podcasts
    FOR SELECT USING (visibility = 'public');

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can read all podcasts" ON podcasts;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE POLICY "Authenticated users can read all podcasts" ON podcasts
    FOR SELECT USING (auth.role() = 'authenticated');

DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role can manage podcasts" ON podcasts;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE POLICY "Service role can manage podcasts" ON podcasts
    FOR ALL USING (auth.role() = 'service_role');
