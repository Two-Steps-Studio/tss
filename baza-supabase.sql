-- Tworzymy tabele dla Twojego projektu TSS (Two Steps Studio) - wersja poprawiona

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
    coin_amount BIGINT NOT NULL, -- Przeliczenie na coins (kurs: 0.01 PLN = 10000 coins)
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

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

);

-- 4. Sesje voice chat (śledzenie XP z Discord Voice Channels)
CREATE TABLE IF NOT EXISTS voice_sessions (
    user_id TEXT PRIMARY KEY REFERENCES profiles(discord_id),
    guild_id TEXT NOT NULL,             -- ID serweru Discord

    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_duration_seconds INTEGER DEFAULT 0,

    xp_earned INTEGER DEFAULT 0,        -- XP zarobione w sesji (3/min)

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

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
);


-- 6. Tablica zapisanych wydarzeń (rejestry uczestników)
CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES profiles(discord_id),
    event_id INTEGER REFERENCES events(id),

    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),

);


-- 7. Tablica osiągnięć/uników dla użytkowników
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,

    user_id TEXT REFERENCES profiles(discord_id),
    achievement_type VARCHAR(100) NOT NULL, -- np. "first_fish", "level_5"

    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

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


-- Dodajemy triggers na aktualizację updated_at w tabelach profiles i fishing_gear
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN New;
END;
$$ language plpgsql;

ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY; -- Opcjonalne: włącz RLS dla głosowych (domyślnie wyłączone)
-- Tworzymy widok do szybkiego pobierania danych użytkownika z profilem (wszystkim naraz)
DROP VIEW IF EXISTS user_profile_view CASCADE;

CREATE OR REPLACE VIEW user_profile_view AS
SELECT
    p.id,
    p.discord_id,
    p.username as discord_username,
    p.avatar_url as discord_avatar,

    -- Profilowanie i XP
    p.level as profile_level,

    (p.xp_current - COALESCE(p.xp_next_level * 0.95, 1))::numeric(8,2) /
        ((p.xp_next_level + p.xp_current) :: numeric(64,3))/2 as xp_progress_percentage,

    -- Gospodarka
    COALESCE(p.coin_balance, 0)::text || ' coins' as coin_display,

    -- Statusy VIP
    CASE
        WHEN svip_status THEN 'SVIP'
        WHEN vip_status THEN 'VIP'
        WHEN mvip_status THEN 'MVIP'
        ELSE '' END as status_vip_display

FROM profiles p;


-- Tworzymy indeks na poziom dla szybszych query (kolejność DESC)
CREATE INDEX idx_level ON user_profile_view(level); -- Zwiększa wydajności sortowania


