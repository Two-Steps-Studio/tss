-- =========================================
-- BAZA DANYCH TSS - Two Steps Studio
-- Wersja: 1.0
-- Kurs wymiany: 0,01 PLN = 10.000 coinów
-- =========================================

-- 1. Tablica profili użytkowników z Discordem
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discord_id TEXT UNIQUE NOT NULL,
    username VARCHAR(255),
    avatar_url TEXT,

    -- Poziomowanie i XP
    level INTEGER DEFAULT 1,
    xp_current INTEGER DEFAULT 0,
    xp_next_level INTEGER DEFAULT 100,

    -- Gospodarka (coins)
    coin_balance BIGINT DEFAULT 0,

    -- Waluta PLN - saldo produktów sklepu
    pln_balance DECIMAL(10,2) DEFAULT 0.00,

    -- Statusy VIP
    vip_status BOOLEAN DEFAULT FALSE,
    svip_status BOOLEAN DEFAULT FALSE,
    mvip_status BOOLEAN DEFAULT FALSE,

    -- Ustawienia i preferencje
    auto_roles_enabled BOOLEAN DEFAULT TRUE,
    notifications_enabled BOOLEAN DEFAULT TRUE,

    -- Dodał/a w systemie
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 2. Log transakcji PLN (historia salda walutowego)
CREATE TABLE IF NOT EXISTS pln_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    coin_amount BIGINT NOT NULL, -- Przeliczenie na coins (kurs: 0.01 PLN = 10.000 coins)
    type VARCHAR(50) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'shop_purchase', 'rewards', 'sale')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 3. Tablica fishing gear (postępy w rozwoju sprzętu wędkarskiego)
CREATE TABLE IF NOT EXISTS fishing_gear (
    user_id TEXT PRIMARY KEY REFERENCES profiles(discord_id),

    -- Podstawowy sprzęt
    zylka INTEGER DEFAULT 0,           -- Złota przynętą
    kolowrotek INTEGER DEFAULT 0,      -- Kołowrotek
    haczyk INTEGER DEFAULT 0,           -- Haczyk

    -- Zaawansowany sprzęt
    pryneta INTEGER DEFAULT 0,          -- Przynęta (premium)
    wedka INTEGER DEFAULT 0,            -- Wędka premium
    zaneta INTEGER DEFAULT 0,           -- Zanata

    -- Transport i przechowywanie
    lodz INTEGER DEFAULT 0,             -- Łódź rybacka
    skrzynka INTEGER DEFAULT 0,         -- Skrzynka na ryby

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 4. Sesje voice chat (śledzenie XP z Discord Voice Channels)
CREATE TABLE IF NOT EXISTS voice_sessions (
    user_id TEXT PRIMARY KEY REFERENCES profiles(discord_id),
    guild_id TEXT NOT NULL,             -- ID serweru Discord

    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_duration_seconds INTEGER DEFAULT 0,

    xp_earned INTEGER DEFAULT 0         -- XP zarobione w sesji (3/min)
);


-- 5. Tablica wydarzeń community (eventy organizowane na Discordzie)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,

    event_type VARCHAR(100) DEFAULT 'general',

    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,

    max_participants INTEGER,
    current_registrations INTEGER DEFAULT 0,

    created_by TEXT REFERENCES profiles(discord_id),

    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),

    image_url TEXT,                      -- Miniatura wydarzenia

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 6. Tablica zapisanych wydarzeń (rejestry uczestników)
CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES profiles(discord_id),
    event_id INTEGER REFERENCES events(id),

    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled'))
);


-- 7. Tablica osiągnięć/uników dla użytkowników
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,

    user_id TEXT REFERENCES profiles(discord_id),
    achievement_type VARCHAR(100) NOT NULL, -- np. "first_fish", "level_5"

    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 8. Tablica historii poziomuowania (logs dla debuggingu/analityki)
CREATE TABLE IF NOT EXISTS level_logs (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES profiles(discord_id),

    old_level INTEGER,
    new_level INTEGER NOT NULL,

    xp_gained INTEGER,
    source VARCHAR(100) DEFAULT 'unknown', -- 'message', 'voice' etc.

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- TRIGGERY NA AUTOMATYCZNE AKTUALIZACJE
-- =========================================

-- Trigger na aktualizację updated_at w tabeli profiles
CREATE OR REPLACE FUNCTION update_profiles_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN New;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS trigger_profile_updated ON profiles;
CREATE TRIGGER trigger_profile_updated BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_profiles_timestamps();


-- Trigger na aktualizację updated_at w tabeli fishing_gear
CREATE OR REPLACE FUNCTION fishing_gear_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN New;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_fishing_updated ON fishing_gear;
CREATE TRIGGER trigger_fishing_updated BEFORE UPDATE ON fishing_gear
FOR EACH ROW EXECUTE FUNCTION fishing_gear_updated_at();
