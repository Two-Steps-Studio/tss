# Konfiguracja Stripe - Sklep z Beatami

## 1. Migracja bazy danych

Uruchom plik `SQL_BEATS_MIGRATION.sql` w Supabase SQL Editor:

```sql
-- Skopiuj całą zawartość pliku SQL_BEATS_MIGRATION.sql i uruchom w Supabase
```

## 2. Konfiguracja Stripe

### Krok 1: Załóż konto Stripe
1. Wejdź na https://stripe.com
2. Zaloguj się lub załóż konto testowe

### Krok 2: Pobierz klucze API
1. W dashboardzie Stripe przejdź do **Developers → API keys**
2. Skopiuj:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

### Krok 3: Skonfiguruj zmienne środowiskowe

Dodaj do `.env.local` w `tss-website/`:

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Krok 4: Skonfiguruj webhook (opcjonalnie, dla produkcji)

1. W Stripe Dashboard: **Developers → Webhooks**
2. Kliknij **Add endpoint**
3. Endpoint URL: `https://twoja-domena.com/api/stripe/webhook`
4. Events to listen to: `checkout.session.completed`

## 3. Dodawanie beatów do bazy

### Przykładowe zapytanie SQL:

```sql
-- Dodaj nowy beat
INSERT INTO beats (id, title, description, bpm, key, status) VALUES
  (gen_random_uuid(), 'Nazwa Beatu', 'Opis beatu', 140, 'Cm', 'available');

-- Dodaj pakiety dla beatu (podmień UUID na ID beatu)
INSERT INTO beat_packages (beat_id, tier, price, description, features) VALUES
  ('UUID_BEATU', 'free', 0.00, 'Darmowy beat do użytku niekomercyjnego',
   '["Użycie niekomercyjne", "Tylko streaming", "Bez dystrybucji"]'),
  ('UUID_BEATU', 'basic', 29.99, 'Podstawowa licencja',
   '["Użycie komercyjne", "Do 100k streamów", "1 projekt"]'),
  ('UUID_BEATU', 'premium', 59.99, 'Rozszerzona licencja',
   '["Użycie komercyjne", "Do 500k streamów", "3 projekty", "Wersja WAV"]'),
  ('UUID_BEATU', 'unlimited', 99.99, 'Nieograniczona licencja',
   '["Użycie komercyjne", "Nielimitowane streamy", "Nielimitowane projekty", "Wersja WAV + stems"]'),
  ('UUID_BEATU', 'exclusive', 199.99, 'Ekskluzywne prawa',
   '["Pełne prawa autorskie", "Beat usuwany ze sklepu", "Wszystkie formaty", "Priorytetowe wsparcie"]');
```

## 4. Rodzaje licencji (Tier)

| Tier | Opis | Przykładowa cena |
|------|------|-----------------|
| `free` | Darmowy beat do użytku niekomercyjnego | 0 PLN |
| `basic` | Podstawowa licencja (do 100k streamów, 1 projekt) | 29.99 PLN |
| `premium` | Rozszerzona licencja (do 500k streamów, 3 projekty, WAV) | 59.99 PLN |
| `unlimited` | Nieograniczona licencja (WAV + stems) | 99.99 PLN |
| `exclusive` | Ekskluzywne prawa (beat usuwany ze sklepu) | 199.99 PLN |

## 5. Dostosowanie cen

Aby zmienić ceny, edytuj wartości w `beat_packages` table:

```sql
-- Aktualizacja ceny dla konkretnego pakietu
UPDATE beat_packages 
SET price = 49.99 
WHERE beat_id = 'UUID_BEATU' AND tier = 'basic';
```

## 6. Testowanie

1. Uruchom dev server: `npm run dev`
2. Wejdź na `/records/beaty`
3. Filtruj beaty po kategoriach
4. Kliknij "Kup teraz" przy wybranym pakiecie - przekierowanie do Stripe Checkout
5. Użyj testowych kart Stripe: https://stripe.com/docs/testing#cards

## 7. Struktura plików

```
tss-website/
├── src/app/records/beaty/page.tsx        # Strona sklepu z beatami (z pakietami)
├── src/app/api/beaty/route.ts            # API do pobierania beatów z pakietami
├── src/app/api/stripe/
│   ├── create-checkout-session/route.ts  # Tworzenie sesji płatności
│   └── webhook/route.ts                  # Obsługa webhooków Stripe
├── SQL_BEATS_MIGRATION.sql               # Migracja bazy danych
├── STRIPE_SETUP.md                       # Ten plik
└── .env.example                          # Przykładowe zmienne środowiskowe
```
