# TSS Beta - Kompleksowy Audyt Architektury Bezpieczeństwa i Uprawnień

**Data audytu:** 2026-07-28  
**Status projektu:** BETA (niepubliczny)  
**Cel:** Przebudowa fundamentów bezpieczeństwa pod platformę dla twórców

---
x
## WYKONANY AUDYT

### 1. STRUKTURA BAZY DANYCH

#### Obecne tabele:

**Tabela `profiles` (główna tabela użytkowników):**
```sql
profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  money INTEGER DEFAULT 0,              -- Discord bot coins
  pln_balance DECIMAL(10,2) DEFAULT 0.00, -- PLN balance
  bank INTEGER DEFAULT 0,
  is_bot_active BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  last_activity TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}',         -- Zawiera isAdmin
  project_limit INTEGER DEFAULT 1,
  joined_projects_limit INTEGER DEFAULT 3,
  subscription_plan TEXT DEFAULT 'free',
  games_visible BOOLEAN DEFAULT TRUE,
  records_visible BOOLEAN DEFAULT TRUE,
  dev_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
```

**Problem:** Wszystkie dane (publiczne, prywatne, waluta) w jednej tabeli.

**Ryzyko:** KRYTYCZNE
- Brak separacji danych publicznych od prywatnych
- Możliwość wycieku prywatnych danych przez API
- Waluta nie jest oddzielona i zabezpieczona
- Trudne zarządzanie widocznością danych

**Co trzeba zmienić:**
1. Rozdzielić `profiles` na 3 tabele: `public_profiles`, `private_profiles`, `user_wallets`
2. Migrować istniejące dane
3. Zaimplementować RLS policies dla każdej tabeli
4. Zaktualizować wszystkie API endpoints

---

**Tabela `users` (stara tabela):**
```sql
users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
)
```

**Problem:** Tabela nie jest używana (Supabase Auth zarządza użytkownikami).

**Ryzyko:** NISKIE
- Zanieczyszczenie bazy danych
- Potencjalne pomyłki przy development

**Co trzeba zmienić:**
1. Usunąć tabelę `users` (jeśli nie jest używana)
2. Zweryfikować czy nie ma zależności

---

**Tabele DEV (system projektów):**
```sql
dev_projects (
  id SERIAL PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#ffcb2f',
  status VARCHAR(20) DEFAULT 'active',
  columns JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)

dev_project_members (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role dev_project_role NOT NULL DEFAULT 'viewer',
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_id)
)

dev_tasks (
  id SERIAL PRIMARY KEY,
  project_id INT DEFAULT 1 REFERENCES dev_projects(id) ON DELETE SET DEFAULT,
  title VARCHAR(200),
  description TEXT,
  assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
  status task_status DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  completed_at TIMESTAMP WITH TIME ZONE,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
```

**Problem:** System DEV ma dobre RLS policies, ale brak globalnego systemu ról.

**Ryzyko:** ŚREDNIE
- Role projektowe są oddzielone od globalnych
- Brak spójnego systemu uprawnień
- Możliwość konfliktów między systemami

**Co trzeba zmienić:**
1. Zintegrować system ról projektowych z globalnym systemem ról
2. Dodać RLS policies na `dev_projects` i `dev_tasks`
3. Zaktualizować helper functions

---

**Tabele Content (Games, Music, Podcasts):**
```sql
games (
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
)

music_tracks (
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
)

podcasts (
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
)
```

**Problem:** Brak `owner_id` w tabelach content, brak RLS policies.

**Ryzyko:** KRYTYCZNE
- Każdy z anon key może dodawać/usuwać treści
- Brak możliwości przypisania treści do użytkownika
- Brak kontroli kto co stworzył

**Co trzeba zmienić:**
1. Dodać `owner_id` do wszystkich tabel content
2. Włączyć RLS policies
3. Zaimplementować autoryzację w API endpoints
4. Migrować istniejące dane

---

**Tabela `user_integrations` (Discord):**
```sql
user_integrations (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255),
  username VARCHAR(255),
  avatar TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, provider)
)
```

**Problem:** Tokeny przechowywane w plain text.

**Ryzyko:** WYSOKIE
- Wyciek tokenów przy naruszeniu bazy danych
- Możliwość przejęcia kont Discord

**Co trzeba zmienić:**
1. Szyfrować tokeny przed zapisem (pgcrypto)
2. Dodać RLS policies (tylko właściciel może widzieć)
3. Zaktualizować API endpoints

---

### 2. SYSTEM RÓL

#### Obecny system:

**Globalne role (niespójne):**
- `settings.isAdmin` w tabeli `profiles` - dla adminów
- `rank` w tabeli `profiles` - dla admin console (OWNER, ADMIN, MOD, VIP, DEV, PROD, MKT, LD)

**Role projektowe (DEV module):**
- `owner`, `admin`, `developer`, `tester`, `viewer` (enum `dev_project_role`)

**Problem:** Niespójny system ról, brak centralnego zarządzania.

**Ryzyko:** WYSOKIE
- Możliwość eskalacji uprawnień
- Trudne audytowanie
- Brak spójności w kodzie

**Co trzeba zmienić:**
1. Stworzyć nowy enum `global_role` (OWNER, ADMIN, MODERATOR, USER)
2. Stworzyć tabelę `user_roles` z historią nadawania ról
3. Stworzyć tabelę `role_permissions` z definicją uprawnień
4. Migrować istniejące role
5. Zaktualizować wszystkie checki w kodzie
6. Usunąć `settings.isAdmin` i `rank`

---

### 3. SYSTEM WALUTY

#### Obecny system:

**Pola w tabeli `profiles`:**
```sql
money INTEGER DEFAULT 0,              -- Discord bot coins
pln_balance DECIMAL(10,2) DEFAULT 0.00, -- PLN balance
bank INTEGER DEFAULT 0
```

**Problem:** Waluta nie jest zabezpieczona, można zmienić przez API.

**Ryzyko:** KRYTYCZNE
- Użytkownik może zmienić swoje saldo przez API
- Brak historii transakcji
- Brak możliwości freeze konta

**Co trzeba zmienić:**
1. Utworzyć oddzielną tabelę `user_wallets`
2. Stworzyć database functions z `SECURITY DEFINER`
3. Tylko service role może wykonywać funkcje
4. Dodać historię transakcji
5. Dodać możliwość freeze konta

---

### 4. API ROUTES

#### Krytyczne problemy:

**1. `src/app/api/games/post/route.ts` - Brak autoryzacji**
```typescript
export async function POST(request: Request) {
  const supabase = createServerClient(...);
  // Brak sprawdzenia autoryzacji!
  const body = await request.json();
  // Bezpośrednie INSERT do bazy
}
```

**Ryzyko:** KRYTYCZNE - każdy może dodawać/usuwać gry

**Co trzeba zmienić:**
1. Dodać `requireAuth()` na początku
2. Dodać `requireRole('CREATOR')`
3. Dodać walidację danych
4. Dodać `owner_id` do insert

---

**2. `src/app/api/music/route.ts` - Brak autoryzacji**
**Problem:** Identyczny jak games

**Ryzyko:** KRYTYCZNE - każdy może dodawać/usuwać muzykę

**Co trzeba zmienić:** Identyczne jak games

---

**3. `src/app/api/podcasts/route.ts` - Brak autoryzacji**
**Problem:** Identyczny jak games

**Ryzyko:** KRYTYCZNE - każdy może dodawać/usuwać podcasty

**Co trzeba zmienić:** Identyczne jak games

---

**4. `src/app/api/admin/exec/route.ts` - Słaba walidacja**
```typescript
const VALID_ROLES = ["OWNER", "ADMIN", "MOD", "VIP", "DEV", "PROD", "MKT", "LD"];
if (cmd === "set-role" && parts.length >= 3) {
  if (!VALID_ROLES.includes(parts[1].toUpperCase())) {
    return NextResponse.json({ error: "Nieprawidlowa nazwa roli" }, { status: 400 });
  }
  const { error } = await supabaseAdmin.from("profiles").update({ rank: parts[1] }).eq("id", parts[2]);
}
```

**Ryzyko:** WYSOKIE - możliwa eskalacja uprawnień, brak logowania

**Co trzeba zmienić:**
1. Użyć nowego systemu ról
2. Dodać logowanie kto nadał rolę
3. Dodać walidację czy użytkownik istnieje
4. Użyć tabeli `user_roles` zamiast `rank`

---

**5. `src/app/api/user/settings/route.ts` - Możliwość zmiany waluty**
```typescript
const body = await request.json();
const { games_visible, records_visible, dev_visible, username } = body;
const updateData: any = {};
if (typeof games_visible === "boolean") updateData.games_visible = games_visible;
// ... brak walidacji czy użytkownik nie próbuje zmienić money/pln_balance
const { data, error } = await supabase.from("profiles").update(updateData).eq("id", user.id);
```

**Ryzyko:** KRYTYCZNE - użytkownik może wysłać `money: 999999` w body

**Co trzeba zmienić:**
1. Dodać walidację pól które można zmienić
2. Użyć whitelist zamiast dynamicznego buildowania
3. Przenieść walutę do walleta z RLS

---

### 5. SYSTEM LOGOWANIA

#### Obecny stan:

**Middleware logging:**
```typescript
const securityLog = (endpoint: string, action: string, user?: string, ip?: string, details?: string) => {
  const logEntry = `[${new Date().toISOString()}] [SECURITY] ${action} - ${endpoint} | User: ${user || 'N/A'} | IP: ${ip || 'N/A'}${details ? ` | ${details}` : ''}`;
  console.log(logEntry);
};
```

**Admin console logging:**
```typescript
const adminSecurityLog = (action: string, ip: string, endpoint: string) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [SECURITY] Admin API ${action} - ${endpoint} | IP: ${ip}`);
};
```

**Problem:** Logowanie tylko do console, brak trwałego przechowywania.

**Ryzyko:** ŚREDNIE
- Brak audytu działań
- Trudne śledzenie nadużyć
- Logi tracone przy restarcie

**Co trzeba zmienić:**
1. Stworzyć tabelę `audit_logs`
2. Logować wszystkie敏感操作
3. Dodać structured logging
4. Dodać retention policy

---

### 6. INTEGRACJE

#### Discord:

**Obecny stan:**
- Tabela `user_integrations` z tokenami w plain text
- OAuth flow z state verification
- API endpoints dla connect/disconnect/sync

**Problem:** Tokeny nie są szyfrowane.

**Ryzyko:** WYSOKIE - wyciek tokenów przy naruszeniu bazy

**Co trzeba zmienić:**
1. Szyfrować tokeny (pgcrypto)
2. Dodać RLS policies
3. Zaktualizować API endpoints

---

#### Stripe:

**Obecny stan:**
- Webhook endpoint z signature verification
- Create checkout session endpoint
- Brak zapisu transakcji w bazie

**Problem:** Brak historii transakcji.

**Ryzyko:** ŚREDNIE - trudne rozwiązywanie problemów

**Co trzeba zmienić:**
1. Stworzyć tabelę `stripe_transactions`
2. Logować wszystkie transakcje
3. Dodać webhook handlers dla wszystkich eventów

---

## PODSUMOWANIE PROBLEMÓW

### Krytyczne (5):
1. Brak autoryzacji w endpointach content (games, music, podcasts)
2. Brak RLS na tabelach content
3. Możliwość zmiany waluty przez API
4. Wszystkie dane w jednej tabeli profiles
5. Tokeny Discord w plain text

### Wysokie (4):
1. Niespójny system ról
2. Brak globalnego systemu uprawnień
3. Słaba walidacja w admin console
4. Brak trwałego logowania

### Średnie (3):
1. Stara tabela users
2. Brak historii transakcji Stripe
3. Brak owner_id w content tables

---

## PLAN MIGRACJI

### ETAP 1: Nowy system profili (3-4 dni)

**1.1 Utworzenie nowych tabel:**
```sql
-- public_profiles
CREATE TABLE public_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  public_stats JSONB DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  portfolio_url TEXT,
  social_links JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- private_profiles
CREATE TABLE private_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  settings JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  security_settings JSONB DEFAULT '{}',
  billing_info JSONB DEFAULT '{}',
  last_login_ip TEXT,
  last_login_device TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- user_wallets
CREATE TABLE user_wallets (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  money INTEGER DEFAULT 0,
  pln_balance DECIMAL(10,2) DEFAULT 0.00,
  bank INTEGER DEFAULT 0,
  transaction_history JSONB DEFAULT '[]',
  frozen BOOLEAN DEFAULT FALSE,
  freeze_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**1.2 Migracja danych:**
```sql
INSERT INTO public_profiles (id, username, avatar_url, level, xp, created_at, updated_at)
SELECT id, username, avatar_url, level, xp, created_at, updated_at
FROM profiles
ON CONFLICT (id) DO NOTHING;

INSERT INTO private_profiles (id, settings, created_at, updated_at)
SELECT id, settings, created_at, updated_at
FROM profiles
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_wallets (id, money, pln_balance, bank, created_at, updated_at)
SELECT id, money, pln_balance, bank, created_at, updated_at
FROM profiles
ON CONFLICT (id) DO NOTHING;
```

**1.3 RLS policies:**
- Public profiles: publiczny odczyt, owner write
- Private profiles: tylko owner + admin
- Wallets: tylko owner read, tylko system write

**1.4 Aktualizacja API:**
- Zaktualizować wszystkie endpointy które używają profiles
- Użyć nowych tabel zamiast profiles

---

### ETAP 2: Nowy system ról (2-3 dni)

**2.1 Utworzenie enum i tabel:**
```sql
CREATE TYPE global_role AS ENUM ('OWNER', 'ADMIN', 'MODERATOR', 'USER');

CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role global_role NOT NULL DEFAULT 'USER',
  granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, role)
);

CREATE TABLE role_permissions (
  id SERIAL PRIMARY KEY,
  role global_role NOT NULL,
  permission TEXT NOT NULL,
  resource_type TEXT,
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role, permission, resource_type)
);
```

**2.2 Migracja ról:**
```sql
INSERT INTO user_roles (user_id, role, granted_by, granted_at)
SELECT id, 'ADMIN', id, created_at
FROM profiles
WHERE settings->>'isAdmin' = 'true'
ON CONFLICT (user_id, role) DO NOTHING;
```

**2.3 RLS policies:**
- user_roles: users read own, admins read all
- role_permissions: public read, admins write

**2.4 Aktualizacja kodu:**
- Zastąpić `settings.isAdmin` checki z `requireRole('ADMIN')`
- Zastąpić `rank` checki z systemem ról
- Zaktualizować admin console

---

### ETAP 3: System wallet (2 dni)

**3.1 Database functions:**
```sql
CREATE OR REPLACE FUNCTION add_money(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_transaction_type TEXT DEFAULT 'system'
)
RETURNS BOOLEAN AS $$
-- Implementation with SECURITY DEFINER
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_pln(
  p_user_id UUID,
  p_amount DECIMAL(10,2),
  p_reason TEXT,
  p_transaction_type TEXT DEFAULT 'payment'
)
RETURNS BOOLEAN AS $$
-- Implementation with SECURITY DEFINER
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION transfer_money(
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT
)
RETURNS BOOLEAN AS $$
-- Implementation with SECURITY DEFINER
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**3.2 Permissions:**
```sql
GRANT EXECUTE ON FUNCTION add_money TO service_role;
GRANT EXECUTE ON FUNCTION add_pln TO service_role;
GRANT EXECUTE ON FUNCTION transfer_money TO service_role;

REVOKE EXECUTE ON FUNCTION add_money FROM authenticated;
REVOKE EXECUTE ON FUNCTION add_pln FROM authenticated;
REVOKE EXECUTE ON FUNCTION transfer_money FROM authenticated;
```

**3.3 Aktualizacja API:**
- Usunąć bezpośrednie UPDATE na wallet
- Użyć database functions

---

### ETAP 4: API Security Helpers (1-2 dni)

**4.1 Utworzenie helper functions:**
```typescript
// src/lib/auth-helpers.ts
export async function requireAuth(): Promise<AuthContext>,
export function requireRole(authContext: AuthContext, requiredRole: string),
export function requireAdmin(authContext: AuthContext),
export async function requireOwnership(authContext: AuthContext, resourceType, resourceId),
export async function requireProjectAccess(authContext: AuthContext, projectId, requiredPermission),
export function validateInput<T>(schema: any, data: any),
```

**4.2 Integracja:**
- Dodać do wszystkich API routes
- Zastąpić ręczne checki

---

### ETAP 5: Aktualizacja API Routes (3-4 dni)

**5.1 Content endpoints:**
- games/post: dodać auth + role + validation
- music: dodać auth + role + validation
- podcasts: dodać auth + role + validation
- Dodać owner_id do tabel

**5.2 Admin endpoints:**
- admin/exec: użyć nowego systemu ról
- admin/users: użyć nowego systemu ról

**5.3 User endpoints:**
- user/settings: walidacja pól, nie pozwolić na zmianę waluty

**5.4 DEV endpoints:**
- Zaktualizować żeby używały helper functions
- Zintegrować z globalnym systemem ról

---

### ETAP 6: Content Tables Migration (1-2 dni)

**6.1 Dodać owner_id:**
```sql
ALTER TABLE games ADD COLUMN owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE music_tracks ADD COLUMN owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE podcasts ADD COLUMN owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
```

**6.2 RLS policies:**
- Publiczny odczyt dla visibility='public'
- Owner read/write dla własnych
- Authenticated read dla wszystkich

**6.3 Migracja danych:**
- Ustawić owner_id dla istniejących rekordów (jeśli możliwe)

---

### ETAP 7: Discord Integration Security (1 dzień)

**7.1 Szyfrowanie tokenów:**
```sql
-- Użyć pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Zaktualizować user_integrations
ALTER TABLE user_integrations ADD COLUMN access_token_encrypted TEXT;
ALTER TABLE user_integrations ADD COLUMN refresh_token_encrypted TEXT;

-- Migrować i szyfrować istniejące tokeny
```

**7.2 RLS policies:**
- Tylko owner może widzieć swoje integracje

**7.3 Aktualizacja API:**
- Szyfrować tokeny przed zapisem
- Deszyfrować przy odczycie

---

### ETAP 8: Audit Logging (1-2 dni)

**8.1 Utworzenie tabeli:**
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id INTEGER,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**8.2 Integracja:**
- Logować wszystkie敏感操作
- Logować zmiany ról
- Logować zmiany waluty
- Logować admin actions

---

### ETAP 9: Frontend Updates (2-3 dni)

**9.1 Aktualizacja typów:**
- Zaktualizować TypeScript types dla nowych tabel
- Zaktualizować interfaces

**9.2 Aktualizacja komponentów:**
- Używać nowych API endpoints
- Obsługiwać nowe struktury danych

**9.3 Testy:**
- Przetestować wszystkie funkcje
- Sprawdzić czy nic nie jest zepsute

---

### ETAP 10: Finalizacja (1-2 dni)

**10.1 Testy:**
- Testy integracyjne
- Testy bezpieczeństwa
- Testy wydajności

**10.2 Dokumentacja:**
- Zaktualizować dokumentację API
- Zaktualizować dokumentację bazy danych
- Zaktualizować README

**10.3 Cleanup:**
- Usunąć stare pola z profiles (po migracji)
- Usunąć starą tabelę users (jeśli nie używana)
- Usunąć settings.isAdmin i rank

---

## SZACOWANY CZAS

- ETAP 1: 3-4 dni
- ETAP 2: 2-3 dni
- ETAP 3: 2 dni
- ETAP 4: 1-2 dni
- ETAP 5: 3-4 dni
- ETAP 6: 1-2 dni
- ETAP 7: 1 dzień
- ETAP 8: 1-2 dni
- ETAP 9: 2-3 dni
- ETAP 10: 1-2 dni

**Całkowity czas: 17-23 dni (3-4 tygodnie)**

---

## RYZYKA MIGRACJI

### Wysokie:
- Przerwa w działaniu aplikacji podczas migracji
- Możliwe utraty danych jeśli migracja się nie powiedzie
- Problemy z kompatybilnością frontendu

### Średnie:
- Problemy z wydajnością po migracji
- Błędy w API po zmianach
- Problemy z RLS policies

### Niskie:
- Problemy z rollbackiem
- Problemy z testami

---

## ZALECENIA

1. **Backup przed migracją** - pełny backup bazy danych
2. **Testy na staging** - najpierw przetestować na środowisku testowym
3. **Stopniowa migracja** - nie robić wszystkiego naraz
4. **Monitorowanie** - śledzić błędy i wydajność
5. **Rollback plan** - mieć plan cofnięcia zmian

---

## KOLEJNOŚĆ IMPLEMENTACJI

1. **KRYTYCZNE:** ETAP 1 (profile separation) + ETAP 3 (wallet security)
2. **WYSOKIE:** ETAP 2 (role system) + ETAP 4 (API helpers) + ETAP 5 (API routes)
3. **ŚREDNIE:** ETAP 6 (content migration) + ETAP 7 (Discord) + ETAP 8 (audit logging)
4. **NISKIE:** ETAP 9 (frontend) + ETAP 10 (finalizacja)

---

## KONIEC AUDYTU

Raport zawiera pełną analizę obecnego systemu, problemy, ryzyka i plan migracji.

**Gotowy do implementacji:** TAK  
**Wymagane zatwierdzenie:** TAK  
**Szacowany czas:** 3-4 tygodnie
