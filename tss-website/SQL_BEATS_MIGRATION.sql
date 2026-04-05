-- Tabela dla beatów
CREATE TABLE IF NOT EXISTS beats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    bpm INTEGER,
    key TEXT,
    duration INTEGER, -- w sekundach
    audio_url TEXT,
    preview_url TEXT,
    cover_image TEXT,
    status TEXT DEFAULT 'available', -- available, sold, reserved
    producer_id TEXT, -- Discord ID użytkownika (text, nie UUID)
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sold_at TIMESTAMP WITH TIME ZONE
);

-- Tabela pakietów dla beatów
CREATE TABLE IF NOT EXISTS beat_packages (
    id SERIAL PRIMARY KEY,
    beat_id UUID REFERENCES beats(id) ON DELETE CASCADE,
    tier TEXT NOT NULL, -- free, basic, premium, unlimited, exclusive
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    stripe_price_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(beat_id, tier)
);

-- Tabela sprzedaży beatów
CREATE TABLE IF NOT EXISTS beat_sales (
    id SERIAL PRIMARY KEY,
    beat_id UUID REFERENCES beats(id),
    package_id INTEGER REFERENCES beat_packages(id),
    stripe_session_id TEXT UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    tier TEXT NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_beats_status ON beats(status);
CREATE INDEX IF NOT EXISTS idx_beat_packages_beat_id ON beat_packages(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_packages_tier ON beat_packages(tier);
CREATE INDEX IF NOT EXISTS idx_beat_sales_beat_id ON beat_sales(beat_id);

-- ============================================
-- PRZYKŁADOWE DANE - możesz je zmienić lub usunąć
-- ============================================

-- Beat 1: Night Drive
INSERT INTO beats (id, title, description, bpm, key, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Night Drive', 'Mroczny beat w stylu trap', 140, 'Cm', 'available');

INSERT INTO beat_packages (beat_id, tier, price, description, features) VALUES
  ('00000000-0000-0000-0000-000000000001', 'free', 0.00, 'Darmowy beat do użytku niekomercyjnego',
   '["Użycie niekomercyjne", "Tylko streaming", "Bez dystrybucji"]'),
  ('00000000-0000-0000-0000-000000000001', 'basic', 29.99, 'Podstawowa licencja',
   '["Użycie komercyjne", "Do 100k streamów", "1 projekt"]'),
  ('00000000-0000-0000-0000-000000000001', 'premium', 59.99, 'Rozszerzona licencja',
   '["Użycie komercyjne", "Do 500k streamów", "3 projekty", "Wersja WAV"]'),
  ('00000000-0000-0000-0000-000000000001', 'unlimited', 99.99, 'Nieograniczona licencja',
   '["Użycie komercyjne", "Nielimitowane streamy", "Nielimitowane projekty", "Wersja WAV + stems"]'),
  ('00000000-0000-0000-0000-000000000001', 'exclusive', 199.99, 'Ekskluzywne prawa',
   '["Pełne prawa autorskie", "Beat usuwany ze sklepu", "Wszystkie formaty", "Priorytetowe wsparcie"]');

-- Beat 2: Summer Vibes
INSERT INTO beats (id, title, description, bpm, key, status) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Summer Vibes', 'Letni beat popowy', 120, 'Gm', 'available');

INSERT INTO beat_packages (beat_id, tier, price, description, features) VALUES
  ('00000000-0000-0000-0000-000000000002', 'free', 0.00, 'Darmowy beat do użytku niekomercyjnego',
   '["Użycie niekomercyjne", "Tylko streaming", "Bez dystrybucji"]'),
  ('00000000-0000-0000-0000-000000000002', 'basic', 39.99, 'Podstawowa licencja',
   '["Użycie komercyjne", "Do 100k streamów", "1 projekt"]'),
  ('00000000-0000-0000-0000-000000000002', 'premium', 69.99, 'Rozszerzona licencja',
   '["Użycie komercyjne", "Do 500k streamów", "3 projekty", "Wersja WAV"]'),
  ('00000000-0000-0000-0000-000000000002', 'unlimited', 119.99, 'Nieograniczona licencja',
   '["Użycie komercyjne", "Nielimitowane streamy", "Nielimitowane projekty", "Wersja WAV + stems"]'),
  ('00000000-0000-0000-0000-000000000002', 'exclusive', 249.99, 'Ekskluzywne prawa',
   '["Pełne prawa autorskie", "Beat usuwany ze sklepu", "Wszystkie formaty", "Priorytetowe wsparcie"]');

-- Beat 3: Dark Energy
INSERT INTO beats (id, title, description, bpm, key, status) VALUES
  ('00000000-0000-0000-0000-000000000003', 'Dark Energy', 'Energetyczny beat drill', 144, 'Am', 'available');

INSERT INTO beat_packages (beat_id, tier, price, description, features) VALUES
  ('00000000-0000-0000-0000-000000000003', 'free', 0.00, 'Darmowy beat do użytku niekomercyjnego',
   '["Użycie niekomercyjne", "Tylko streaming", "Bez dystrybucji"]'),
  ('00000000-0000-0000-0000-000000000003', 'basic', 19.99, 'Podstawowa licencja',
   '["Użycie komercyjne", "Do 100k streamów", "1 projekt"]'),
  ('00000000-0000-0000-0000-000000000003', 'premium', 79.99, 'Rozszerzona licencja',
   '["Użycie komercyjne", "Do 500k streamów", "3 projekty", "Wersja WAV"]'),
  ('00000000-0000-0000-0000-000000000003', 'unlimited', 249.99, 'Nieograniczona licencja',
   '["Użycie komercyjne", "Nielimitowane streamy", "Nielimitowane projekty", "Wersja WAV + stems"]'),
  ('00000000-0000-0000-0000-000000000003', 'exclusive', 499.99, 'Ekskluzywne prawa',
   '["Pełne prawa autorskie", "Beat usuwany ze sklepu", "Wszystkie formaty", "Priorytetowe wsparcie"]');
