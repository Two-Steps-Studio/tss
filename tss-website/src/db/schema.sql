-- Database schema for Two Steps Studio website (PostgreSQL/Supabase version)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    release_date DATE,
    category VARCHAR(50)
);

-- E-Sport events
CREATE TABLE IF NOT EXISTS e_sport_events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    max_participants INT
);

-- Records (podcasts, beats)
CREATE TYPE record_type AS ENUM ('podcast', 'beat');
CREATE TABLE IF NOT EXISTS records (
    id SERIAL PRIMARY KEY,
    type record_type NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    file_path VARCHAR(255),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DEV tasks
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TABLE IF NOT EXISTS dev_tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    assigned_to INT REFERENCES users(id),
    status task_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Discord stats (for logging)
CREATE TABLE IF NOT EXISTS discord_stats (
    id SERIAL PRIMARY KEY,
    online_users INT,
    member_count INT,
    active_channels INT,
    messages_today INT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- News table
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    category VARCHAR(50),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Site sessions (presence tracking)
CREATE TABLE IF NOT EXISTS site_sessions (
    session_id UUID PRIMARY KEY,
    user_id UUID,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Presence events (for time series)
CREATE TABLE IF NOT EXISTS site_presence (
    session_id UUID NOT NULL,
    user_id UUID,
    seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add created_at to profiles (for signup stats)
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Gamification metrics on profiles
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS rank TEXT DEFAULT 'Novice';

ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS weekly_xp INTEGER DEFAULT 0;

ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS badges_unlocked INTEGER DEFAULT 0;

-- Synchronization settings for users
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
