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

-- Gamification profiles (core table with PLN balance)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    money INTEGER DEFAULT 0,              -- Discord bot coins
    pln_balance DECIMAL(10,2) DEFAULT 0.00, -- Polity walutowy balans w PLN
    bank INTEGER DEFAULT 0,
    vip_status BOOLEAN DEFAULT FALSE,
    svip_status BOOLEAN DEFAULT FALSE,
    mvip_status BOOLEAN DEFAULT FALSE,
    rank TEXT DEFAULT 'Novice',
    weekly_xp INTEGER DEFAULT 0,
    badges_unlocked INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    discord_id TEXT UNIQUE,
    discord_roles TEXT[] DEFAULT '{}'::text[],
    fishing_gear JSONB DEFAULT '{}'::jsonb,
    background TEXT DEFAULT 'default'::text,
    last_work TIMESTAMP WITH TIME ZONE
);

-- Fishing catches
CREATE TABLE IF NOT EXISTS fishing_catches (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(discord_id) ON DELETE SET NULL,
    fish_name TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common',
    weight NUMERIC NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    caught_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fishing gear progress
CREATE TABLE IF NOT EXISTS fishing_gear (
    user_id TEXT PRIMARY KEY REFERENCES profiles(discord_id) ON DELETE CASCADE,
    zylka INTEGER DEFAULT 0,
    kolowrotek INTEGER DEFAULT 0,
    haczyk INTEGER DEFAULT 0,
    przynet INTEGER DEFAULT 0,
    wedka INTEGER DEFAULT 0,
    zaneta INTEGER DEFAULT 0,
    lodz INTEGER DEFAULT 0,
    skrzynka INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Voice chat sessions
CREATE TABLE IF NOT EXISTS voice_sessions (
    user_id TEXT PRIMARY KEY REFERENCES profiles(discord_id) ON DELETE CASCADE,
    guild_id TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    xp_earned INTEGER DEFAULT 0
);

-- E-Sport events
CREATE TABLE IF NOT EXISTS e_sport_events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    max_participants INT
);

-- Event participants
CREATE TABLE IF NOT EXISTS event_participants (
    id BIGSERIAL PRIMARY KEY,
    event_id INT NOT NULL REFERENCES e_sport_events(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DEV tasks
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TABLE IF NOT EXISTS dev_tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    status task_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Site sessions (presence tracking)
CREATE TABLE IF NOT EXISTS site_sessions (
    session_id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Presence events (for time series)
CREATE TABLE IF NOT EXISTS site_presence (
    session_id UUID NOT NULL REFERENCES site_sessions(session_id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- Games
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    release_date DATE,
    category VARCHAR(50)
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

-- News
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    category VARCHAR(50),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Temporary roles (for events)
CREATE TABLE IF NOT EXISTS temp_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- PLN Transactions log
CREATE TABLE IF NOT EXISTS pln_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    coin_amount BIGINT NOT NULL,        -- odpowiadające coinow (0,01 PLN = 10000 coinów)
    type VARCHAR(20) NOT NULL,          -- 'credit', 'debit'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shop products
CREATE TABLE IF NOT EXISTS shop_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    coin_price INTEGER NOT NULL,         -- w coinach
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    stock INTEGER DEFAULT 999,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS profiles_xp_idx ON profiles(xp);
CREATE INDEX IF NOT EXISTS profiles_level_idx ON profiles(level);
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS fishing_catches_user_id_idx ON fishing_catches(user_id);
CREATE INDEX IF NOT EXISTS dev_tasks_status_idx ON dev_tasks(status);
