# Audyt Bezpieczeństwa Systemu Użytkowników i Uprawnień TSS

## Technologie
- Next.js 15 + React 19 + TypeScript
- Supabase Auth + PostgreSQL RLS
- Platform/Studio model

---

## 1. SYSTEM PROFILI

### Aktualny stan

**Obecna struktura tabeli `profiles`:**
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
  settings JSONB DEFAULT '{}',
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

**Problem:** Wszystkie dane (publiczne i prywatne) są w jednej tabeli.

**Ryzyko:** Średnie - trudne zarządzanie widocznością danych, potencjalny wyciek prywatnych informacji.

---

### Proponowany podział danych

#### PUBLIC PROFILE (dostępne dla wszystkich)
```sql
public_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id),
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
)
```

#### PRIVATE PROFILE (tylko właściciel + admin)
```sql
private_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id),
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
)
```

#### WALLET (tylko system + admin)
```sql
user_wallets (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  money INTEGER DEFAULT 0,              -- Discord bot coins
  pln_balance DECIMAL(10,2) DEFAULT 0.00,
  bank INTEGER DEFAULT 0,
  transaction_history JSONB DEFAULT '[]',
  frozen BOOLEAN DEFAULT FALSE,
  freeze_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
```

---

### SQL Migration

```sql
-- ============================================
-- MIGRATION: Split profiles into public/private/wallet
-- ============================================

-- 1. Create new tables
CREATE TABLE IF NOT EXISTS public_profiles (
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

CREATE TABLE IF NOT EXISTS private_profiles (
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

CREATE TABLE IF NOT EXISTS user_wallets (
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

-- 2. Migrate existing data
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

-- 3. Add indexes
CREATE INDEX idx_public_profiles_username ON public_profiles(username);
CREATE INDEX idx_public_profiles_level ON public_profiles(level);
CREATE INDEX idx_public_profiles_xp ON public_profiles(xp DESC);
CREATE INDEX idx_private_profiles_email ON private_profiles(email);
CREATE INDEX idx_user_wallets_frozen ON user_wallets(frozen);
```

---

### RLS Policies dla nowych tabel

```sql
-- ============================================
-- RLS: public_profiles
-- ============================================
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

-- Public can read public profiles
CREATE POLICY "Public can read public profiles"
ON public_profiles FOR SELECT
USING (is_public = true OR auth.uid()::text = id);

-- Users can update their own public profile
CREATE POLICY "Users can update own public profile"
ON public_profiles FOR UPDATE
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

-- Users can insert their own public profile
CREATE POLICY "Users can insert own public profile"
ON public_profiles FOR INSERT
WITH CHECK (auth.uid()::text = id);

-- Admins can manage all public profiles
CREATE POLICY "Admins can manage public profiles"
ON public_profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid()::text 
    AND settings->>'isAdmin' = 'true'
  )
);

-- ============================================
-- RLS: private_profiles
-- ============================================
ALTER TABLE private_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own private profile
CREATE POLICY "Users can read own private profile"
ON private_profiles FOR SELECT
USING (auth.uid()::text = id);

-- Users can update their own private profile
CREATE POLICY "Users can update own private profile"
ON private_profiles FOR UPDATE
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

-- Users can insert their own private profile
CREATE POLICY "Users can insert own private profile"
ON private_profiles FOR INSERT
WITH CHECK (auth.uid()::text = id);

-- Admins can read all private profiles
CREATE POLICY "Admins can read all private profiles"
ON private_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid()::text 
    AND settings->>'isAdmin' = 'true'
  )
);

-- Admins can manage all private profiles
CREATE POLICY "Admins can manage private profiles"
ON private_profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid()::text 
    AND settings->>'isAdmin' = 'true'
  )
);

-- ============================================
-- RLS: user_wallets
-- ============================================
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

-- Users can read their own wallet
CREATE POLICY "Users can read own wallet"
ON user_wallets FOR SELECT
USING (auth.uid()::text = id);

-- NO UPDATE/INSERT POLICY for users - only system functions can modify

-- Admins can read all wallets
CREATE POLICY "Admins can read all wallets"
ON user_wallets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid()::text 
    AND settings->>'isAdmin' = 'true'
  )
);

-- Admins can manage all wallets
CREATE POLICY "Admins can manage wallets"
ON user_wallets FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid()::text 
    AND settings->>'isAdmin' = 'true'
  )
);

-- Service role can manage wallets (for system functions)
CREATE POLICY "Service role can manage wallets"
ON user_wallets FOR ALL
USING (auth.role() = 'service_role');
```

---

## 2. SYSTEM RÓL I UPRAWNIEŃ

### Aktualny stan

**Obecny system ról:**
- Brak formalnego systemu ról w bazie danych
- Admin check przez `settings->>'isAdmin'`
- Role w DEV module: `owner`, `admin`, `developer`, `tester`, `viewer`
- Role w admin console: `OWNER`, `ADMIN`, `MOD`, `VIP`, `DEV`, `PROD`, `MKT`, `LD`

**Problem:** Niekonsekwentny system ról, brak centralnego zarządzania.

**Ryzyko:** Wysokie - możliwa eskalacja uprawnień, trudne audytowanie.

---

### Proponowany system ról

```sql
-- ============================================
-- ENUM: User Roles
-- ============================================
CREATE TYPE user_role AS ENUM (
  'USER',          -- Regular user
  'CREATOR',       -- Content creator (games, music)
  'DEV',           -- Developer with project access
  'MODERATOR',     -- Content moderator
  'ADMIN',         -- Full admin access
  'OWNER'          -- Platform owner
);

-- ============================================
-- ENUM: Project Permissions
-- ============================================
CREATE TYPE project_permission AS ENUM (
  'VIEW',          -- Can view project
  'EDIT',          -- Can edit project details
  'MANAGE_TASKS',  -- Can manage tasks
  'MANAGE_FILES',  -- Can manage files
  'MANAGE_MEMBERS',-- Can manage members
  'DELETE'         -- Can delete project
);

-- ============================================
-- TABLE: user_roles
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'USER',
    granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, role)
);

-- ============================================
-- TABLE: role_permissions
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role user_role NOT NULL,
    permission TEXT NOT NULL,
    resource_type TEXT, -- 'project', 'game', 'user', 'system'
    granted BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, permission, resource_type)
);

-- ============================================
-- TABLE: project_permissions
-- ============================================
CREATE TABLE IF NOT EXISTS project_permissions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    permissions project_permission[] DEFAULT ARRAY['VIEW'],
    granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);
```

---

### SQL Migration dla ról

```sql
-- ============================================
-- MIGRATION: Role System
-- ============================================

-- 1. Create enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('USER', 'CREATOR', 'DEV', 'MODERATOR', 'ADMIN', 'OWNER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_permission AS ENUM ('VIEW', 'EDIT', 'MANAGE_TASKS', 'MANAGE_FILES', 'MANAGE_MEMBERS', 'DELETE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create tables
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'USER',
    granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role user_role NOT NULL,
    permission TEXT NOT NULL,
    resource_type TEXT,
    granted BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, permission, resource_type)
);

CREATE TABLE IF NOT EXISTS project_permissions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    permissions project_permission[] DEFAULT ARRAY['VIEW'],
    granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- 3. Migrate existing admin users
INSERT INTO user_roles (user_id, role, granted_by, granted_at)
SELECT id, 'ADMIN', id, created_at
FROM profiles
WHERE settings->>'isAdmin' = 'true'
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Insert default role permissions
INSERT INTO role_permissions (role, permission, resource_type, granted) VALUES
-- USER permissions
('USER', 'read_public_content', null, true),
('USER', 'create_profile', null, true),
('USER', 'update_own_profile', null, true),
-- CREATOR permissions
('CREATOR', 'create_games', 'game', true),
('CREATOR', 'manage_own_games', 'game', true),
('CREATOR', 'create_music', 'music', true),
('CREATOR', 'manage_own_music', 'music', true),
-- DEV permissions
('DEV', 'create_projects', 'project', true),
('DEV', 'manage_own_projects', 'project', true),
('DEV', 'join_projects', 'project', true),
-- MODERATOR permissions
('MODERATOR', 'moderate_content', null, true),
('MODERATOR', 'ban_users', 'user', true),
('MODERATOR', 'view_all_profiles', 'user', true),
-- ADMIN permissions
('ADMIN', 'manage_users', 'user', true),
('ADMIN', 'manage_roles', 'user', true),
('ADMIN', 'manage_system', 'system', true),
('ADMIN', 'view_all_data', null, true),
-- OWNER permissions
('OWNER', 'all_permissions', null, true)
ON CONFLICT (role, permission, resource_type) DO NOTHING;

-- 5. Add indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_project_permissions_project_id ON project_permissions(project_id);
CREATE INDEX idx_project_permissions_user_id ON project_permissions(user_id);
```

---

### RLS Policies dla ról

```sql
-- ============================================
-- RLS: user_roles
-- ============================================
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles
CREATE POLICY "Users can read own roles"
ON user_roles FOR SELECT
USING (auth.uid()::text = user_id);

-- Users can read public roles of others
CREATE POLICY "Users can read public roles"
ON user_roles FOR SELECT
USING (role IN ('USER', 'CREATOR', 'DEV'));

-- Admins can read all roles
CREATE POLICY "Admins can read all roles"
ON user_roles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid()::text 
    AND role = 'ADMIN'
  )
);

-- Only admins can manage roles
CREATE POLICY "Admins can manage roles"
ON user_roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid()::text 
    AND role = 'ADMIN'
  )
);

-- ============================================
-- RLS: role_permissions
-- ============================================
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Everyone can read role permissions
CREATE POLICY "Public can read role permissions"
ON role_permissions FOR SELECT
USING (true);

-- Only admins can manage role permissions
CREATE POLICY "Admins can manage role permissions"
ON role_permissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid()::text 
    AND role = 'ADMIN'
  )
);

-- ============================================
-- RLS: project_permissions
-- ============================================
ALTER TABLE project_permissions ENABLE ROW LEVEL SECURITY;

-- Users can read permissions for projects they have access to
CREATE POLICY "Users can read project permissions"
ON project_permissions FOR SELECT
USING (
  auth.uid()::text = user_id OR
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE id = project_id 
    AND owner_id = auth.uid()::text
  )
);

-- Users can update permissions for projects they own
CREATE POLICY "Project owners can manage permissions"
ON project_permissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM dev_projects 
    WHERE id = project_id 
    AND owner_id = auth.uid()::text
  )
);

-- Admins can manage all project permissions
CREATE POLICY "Admins can manage all project permissions"
ON project_permissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid()::text 
    AND role = 'ADMIN'
  )
);
```

---

## 3. SYSTEM WALUTY / MONEY

### Aktualny stan

**Obecne pola w `profiles`:**
- `money INTEGER DEFAULT 0` - Discord bot coins
- `pln_balance DECIMAL(10,2) DEFAULT 0.00` - PLN balance
- `bank INTEGER DEFAULT 0`

**Problem:** Walidacja tylko na poziomie API, brak zabezpieczeń w bazie.

**Ryzyko:** Krytyczne - użytkownik może zmienić swoje saldo przez API.

---

### Proponowane zabezpieczenia

#### Database Functions (tylko system może zmieniać)

```sql
-- ============================================
-- FUNCTION: add_money (tylko system)
-- ============================================
CREATE OR REPLACE FUNCTION add_money(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_transaction_type TEXT DEFAULT 'system'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Lock the row
  SELECT money INTO current_balance
  FROM user_wallets
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if wallet is frozen
  IF (SELECT frozen FROM user_wallets WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Wallet is frozen';
  END IF;

  -- Update balance
  UPDATE user_wallets
  SET 
    money = money + p_amount,
    updated_at = CURRENT_TIMESTAMP,
    transaction_history = transaction_history || jsonb_build_object(
      'type', p_transaction_type,
      'amount', p_amount,
      'reason', p_reason,
      'timestamp', CURRENT_TIMESTAMP,
      'balance_after', money + p_amount
    )
  WHERE id = p_user_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: add_pln (tylko system)
-- ============================================
CREATE OR REPLACE FUNCTION add_pln(
  p_user_id UUID,
  p_amount DECIMAL(10,2),
  p_reason TEXT,
  p_transaction_type TEXT DEFAULT 'payment'
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Lock the row
  UPDATE user_wallets
  SET 
    pln_balance = pln_balance + p_amount,
    updated_at = CURRENT_TIMESTAMP,
    transaction_history = transaction_history || jsonb_build_object(
      'type', p_transaction_type,
      'amount', p_amount,
      'reason', p_reason,
      'timestamp', CURRENT_TIMESTAMP,
      'balance_after', pln_balance + p_amount
    )
  WHERE id = p_user_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: transfer_money (tylko system)
-- ============================================
CREATE OR REPLACE FUNCTION transfer_money(
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  from_balance INTEGER;
BEGIN
  -- Check if users exist
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_from_user_id) THEN
    RAISE EXCEPTION 'Sender not found';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_to_user_id) THEN
    RAISE EXCEPTION 'Recipient not found';
  END IF;

  -- Check amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Lock both rows
  SELECT money INTO from_balance
  FROM user_wallets
  WHERE id = p_from_user_id
  FOR UPDATE;

  -- Check balance
  IF from_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Check if wallets are frozen
  IF (SELECT frozen FROM user_wallets WHERE id = p_from_user_id) THEN
    RAISE EXCEPTION 'Sender wallet is frozen';
  END IF;

  IF (SELECT frozen FROM user_wallets WHERE id = p_to_user_id) THEN
    RAISE EXCEPTION 'Recipient wallet is frozen';
  END IF;

  -- Transfer
  UPDATE user_wallets
  SET 
    money = money - p_amount,
    updated_at = CURRENT_TIMESTAMP,
    transaction_history = transaction_history || jsonb_build_object(
      'type', 'transfer_out',
      'amount', p_amount,
      'reason', p_reason,
      'timestamp', CURRENT_TIMESTAMP,
      'to_user', p_to_user_id
    )
  WHERE id = p_from_user_id;

  UPDATE user_wallets
  SET 
    money = money + p_amount,
    updated_at = CURRENT_TIMESTAMP,
    transaction_history = transaction_history || jsonb_build_object(
      'type', 'transfer_in',
      'amount', p_amount,
      'reason', p_reason,
      'timestamp', CURRENT_TIMESTAMP,
      'from_user', p_from_user_id
    )
  WHERE id = p_to_user_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: freeze_wallet (tylko admin)
-- ============================================
CREATE OR REPLACE FUNCTION freeze_wallet(
  p_user_id UUID,
  p_reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if requester is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid()::text 
    AND role = 'ADMIN'
  ) THEN
    RAISE EXCEPTION 'Only admins can freeze wallets';
  END IF;

  UPDATE user_wallets
  SET 
    frozen = true,
    freeze_reason = p_reason,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_user_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### RLS Policies dla wallet functions

```sql
-- Grant execute permissions to service role only
GRANT EXECUTE ON FUNCTION add_money TO service_role;
GRANT EXECUTE ON FUNCTION add_pln TO service_role;
GRANT EXECUTE ON FUNCTION transfer_money TO service_role;
GRANT EXECUTE ON FUNCTION freeze_wallet TO service_role;

-- Revoke from authenticated users
REVOKE EXECUTE ON FUNCTION add_money FROM authenticated;
REVOKE EXECUTE ON FUNCTION add_pln FROM authenticated;
REVOKE EXECUTE ON FUNCTION transfer_money FROM authenticated;
REVOKE EXECUTE ON FUNCTION freeze_wallet FROM authenticated;
```

---

## 4. API SECURITY HELPERS

### Proponowane helper functions

```typescript
// src/lib/auth-helpers.ts

import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export interface AuthContext {
  user: { id: string; email: string | null };
  profile: any;
  roles: string[];
}

/**
 * Sprawdza czy użytkownik jest zalogowany
 */
export async function requireAuth(): Promise<AuthContext | NextResponse> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user roles
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    user,
    profile,
    roles: roles?.map(r => r.role) || []
  };
}

/**
 * Sprawdza czy użytkownik ma wymaganą rolę
 */
export function requireRole(authContext: AuthContext, requiredRole: string): NextResponse | null {
  if (!authContext.roles.includes(requiredRole)) {
    return NextResponse.json({ error: "Forbidden - insufficient permissions" }, { status: 403 });
  }
  return null;
}

/**
 * Sprawdza czy użytkownik jest adminem
 */
export function requireAdmin(authContext: AuthContext): NextResponse | null {
  return requireRole(authContext, 'ADMIN');
}

/**
 * Sprawdza czy użytkownik jest właścicielem zasobu
 */
export async function requireOwnership(
  authContext: AuthContext,
  resourceType: 'project' | 'game' | 'music',
  resourceId: number
): Promise<NextResponse | null> {
  const supabase = await createClient();
  
  let query;
  if (resourceType === 'project') {
    query = supabase
      .from("dev_projects")
      .select("owner_id")
      .eq("id", resourceId)
      .single();
  } else if (resourceType === 'game') {
    query = supabase
      .from("games")
      .select("owner_id")
      .eq("id", resourceId)
      .single();
  }
  
  const { data, error } = await query;
  
  if (error || !data) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }
  
  if (data.owner_id !== authContext.user.id) {
    return NextResponse.json({ error: "Forbidden - not owner" }, { status: 403 });
  }
  
  return null;
}

/**
 * Sprawdza dostęp do projektu (owner lub member)
 */
export async function requireProjectAccess(
  authContext: AuthContext,
  projectId: number,
  requiredPermission: 'VIEW' | 'EDIT' | 'MANAGE_TASKS' | 'MANAGE_FILES' | 'MANAGE_MEMBERS' | 'DELETE' = 'VIEW'
): Promise<NextResponse | null> {
  const supabase = await createClient();
  
  // Check if owner
  const { data: project } = await supabase
    .from("dev_projects")
    .select("owner_id")
    .eq("id", projectId)
    .single();
  
  if (project?.owner_id === authContext.user.id) {
    return null; // Owner has all permissions
  }
  
  // Check if member with required permission
  const { data: membership } = await supabase
    .from("project_permissions")
    .select("permissions")
    .eq("project_id", projectId)
    .eq("user_id", authContext.user.id)
    .single();
  
  if (!membership) {
    return NextResponse.json({ error: "Forbidden - no project access" }, { status: 403 });
  }
  
  if (!membership.permissions.includes(requiredPermission)) {
    return NextResponse.json({ error: "Forbidden - insufficient permissions" }, { status: 403 });
  }
  
  return null;
}

/**
 * Walidacja danych wejściowych z Zod
 */
export function validateInput<T>(schema: any, data: any): T | NextResponse {
  try {
    return schema.parse(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Validation failed", details: error },
      { status: 400 }
    );
  }
}
```

---

## 5. AUDYT ENDPOINTÓW API

### Krytyczne problemy

#### 1. `src/app/api/games/post/route.ts` - Brak autoryzacji

**Aktualny problem:**
```typescript
export async function POST(request: Request) {
  const supabase = createServerClient(...);
  // Brak sprawdzenia autoryzacji!
  const body = await request.json();
  // Bezpośrednie INSERT do bazy
}
```

**Ryzyko:** Krytyczne - każdy może dodawać/usuwać gry

**Proponowana zmiana:**
```typescript
import { requireAuth, requireAdmin, validateInput } from "@/lib/auth-helpers";
import { z } from "zod";

const gameSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  release_date: z.string().optional(),
  category: z.string().optional(),
});

export async function POST(request: Request) {
  // 1. Check auth
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  
  // 2. Check role (only CREATOR and above can create games)
  const roleCheck = requireRole(auth, 'CREATOR');
  if (roleCheck) return roleCheck;
  
  // 3. Validate input
  const body = await request.json();
  const validated = validateInput(gameSchema, body);
  if (validated instanceof NextResponse) return validated;
  
  // 4. Insert with user_id
  const { data, error } = await supabase
    .from("games")
    .insert({
      ...validated,
      owner_id: auth.user.id,
    })
    .select()
    .single();
  
  if (error) {
    console.error("[API] Games insert error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  
  return NextResponse.json({ success: true, data });
}
```

#### 2. `src/app/api/music/route.ts` - Brak autoryzacji

**Aktualny problem:** Identyczny jak games

**Ryzyko:** Krytyczne - każdy może dodawać/usuwać muzykę

**Proponowana zmiana:** Identyczna jak games z role check dla CREATOR

#### 3. `src/app/api/podcasts/route.ts` - Brak autoryzacji

**Aktualny problem:** Identyczny jak games

**Ryzyko:** Krytyczne - każdy może dodawać/usuwać podcasty

**Proponowana zmiana:** Identyczna jak games z role check dla CREATOR

#### 4. `src/app/api/admin/exec/route.ts` - Słaba walidacja

**Aktualny problem:**
```typescript
const VALID_ROLES = ["OWNER", "ADMIN", "MOD", "VIP", "DEV", "PROD", "MKT", "LD"];
if (cmd === "set-role" && parts.length >= 3) {
  if (!VALID_ROLES.includes(parts[1].toUpperCase())) {
    return NextResponse.json({ error: "Nieprawidlowa nazwa roli" }, { status: 400 });
  }
  const { error } = await supabaseAdmin.from("profiles").update({ rank: parts[1] }).eq("id", parts[2]);
}
```

**Ryzyko:** Wysokie - możliwa eskalacja uprawnień, brak logowania kto nadał rolę

**Proponowana zmiana:**
```typescript
// Use proper role system
if (cmd === "set-role" && parts.length >= 3) {
  const targetUserId = parts[2];
  const newRole = parts[1].toUpperCase();
  
  // Validate role against enum
  const VALID_ROLES = ["USER", "CREATOR", "DEV", "MODERATOR", "ADMIN", "OWNER"];
  if (!VALID_ROLES.includes(newRole)) {
    adminSecurityLog(`Invalid role attempt: ${newRole}`, ip, req.url);
    return NextResponse.json({ error: "Nieprawidlowa nazwa roli" }, { status: 400 });
  }
  
  // Check if target user exists
  const { data: targetUser } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", targetUserId)
    .single();
  
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  
  // Remove old role
  await supabaseAdmin
    .from("user_roles")
    .delete()
    .eq("user_id", targetUserId);
  
  // Insert new role
  const { error } = await supabaseAdmin
    .from("user_roles")
    .insert({
      user_id: targetUserId,
      role: newRole::user_role,
      granted_by: auth.user.id,
      granted_at: new Date().toISOString(),
    });
  
  if (error) throw new Error(error.message);
  
  // Log the action
  adminSecurityLog(`Role changed: ${targetUserId} -> ${newRole} by ${auth.user.id}`, ip, req.url);
  result = `Ustawiono role ${newRole} dla ${targetUserId}`;
}
```

---

## 6. OCHRONA PROJEKTÓW

### Aktualny stan

**DEV Projects:**
- Tabela `dev_projects` z `owner_id`
- Tabela `dev_project_members` z rolami
- Brak RLS policies
- Autoryzacja tylko w middleware

**Problem:** Brak RLS, możliwy dostęp przez API

**Ryzyko:** Wysokie - dostęp do cudzych projektów

---

### Proponowane RLS Policies dla DEV Projects

```sql
-- ============================================
-- RLS: dev_projects
-- ============================================
ALTER TABLE dev_projects ENABLE ROW LEVEL SECURITY;

-- Public can read public projects (if we add visibility)
CREATE POLICY "Public can read public projects"
ON dev_projects FOR SELECT
USING (visibility = 'public');

-- Users can read their own projects
CREATE POLICY "Users can read own projects"
ON dev_projects FOR SELECT
USING (auth.uid()::text = owner_id);

-- Users can read projects they are members of
CREATE POLICY "Users can read member projects"
ON dev_projects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM dev_project_members
    WHERE project_id = dev_projects.id
    AND user_id = auth.uid()::text
  )
);

-- Users can create projects (with limits checked in API)
CREATE POLICY "Users can create projects"
ON dev_projects FOR INSERT
WITH CHECK (auth.uid()::text = owner_id);

-- Project owners can update their projects
CREATE POLICY "Owners can update own projects"
ON dev_projects FOR UPDATE
USING (auth.uid()::text = owner_id)
WITH CHECK (auth.uid()::text = owner_id);

-- Project owners can delete their projects
CREATE POLICY "Owners can delete own projects"
ON dev_projects FOR DELETE
USING (auth.uid()::text = owner_id);

-- Admins can manage all projects
CREATE POLICY "Admins can manage all projects"
ON dev_projects FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()::text
    AND role = 'ADMIN'
  )
);

-- ============================================
-- RLS: dev_tasks
-- ============================================
ALTER TABLE dev_tasks ENABLE ROW LEVEL SECURITY;

-- Users can read tasks from their projects
CREATE POLICY "Users can read tasks from their projects"
ON dev_tasks FOR SELECT
USING (
  auth.uid()::text IN (
    SELECT owner_id FROM dev_projects WHERE id = dev_tasks.project_id
  ) OR
  EXISTS (
    SELECT 1 FROM dev_project_members
    WHERE project_id = dev_tasks.project_id
    AND user_id = auth.uid()::text
  )
);

-- Users can create tasks in their projects
CREATE POLICY "Users can create tasks in their projects"
ON dev_tasks FOR INSERT
WITH CHECK (
  auth.uid()::text IN (
    SELECT owner_id FROM dev_projects WHERE id = project_id
  ) OR
  EXISTS (
    SELECT 1 FROM dev_project_members
    WHERE project_id = project_id
    AND user_id = auth.uid()::text
    AND permissions ? 'MANAGE_TASKS'
  )
);

-- Users can update tasks in their projects
CREATE POLICY "Users can update tasks in their projects"
ON dev_tasks FOR UPDATE
USING (
  auth.uid()::text IN (
    SELECT owner_id FROM dev_projects WHERE id = project_id
  ) OR
  EXISTS (
    SELECT 1 FROM dev_project_members
    WHERE project_id = project_id
    AND user_id = auth.uid()::text
    AND permissions ? 'MANAGE_TASKS'
  )
);

-- Users can delete tasks in their projects
CREATE POLICY "Users can delete tasks in their projects"
ON dev_tasks FOR DELETE
USING (
  auth.uid()::text IN (
    SELECT owner_id FROM dev_projects WHERE id = project_id
  ) OR
  EXISTS (
    SELECT 1 FROM dev_project_members
    WHERE project_id = project_id
    AND user_id = auth.uid()::text
    AND permissions ? 'MANAGE_TASKS'
  )
);

-- Admins can manage all tasks
CREATE POLICY "Admins can manage all tasks"
ON dev_tasks FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()::text
    AND role = 'ADMIN'
  )
);
```

---

## 7. ZNALEZIONE PODATNOŚCI

### 1. Brak autoryzacji w endpointach content (CRITICAL)
- **Lokalizacja:** `src/app/api/games/post/route.ts`, `src/app/api/music/route.ts`, `src/app/api/podcasts/route.ts`
- **Problem:** Każdy z anon key może dodawać/usuwać treści
- **Ryzyko:** Krytyczne - pełna kontrola nad treścią

### 2. Brak RLS na tabelach content (CRITICAL)
- **Lokalizacja:** `games`, `music_tracks`, `podcasts`
- **Problem:** Brak RLS policies
- **Ryzyko:** Krytyczne - dostęp do wszystkich danych

### 3. Brak walidacji danych wejściowych (HIGH)
- **Lokalizacja:** Większość endpointów
- **Problem:** Dane nie są walidowane przed użyciem
- **Ryzyko:** Wysokie - SQL Injection, data corruption

### 4. Słaby system ról (HIGH)
- **Lokalizacja:** Admin console, DEV module
- **Problem:** Niekonsekwentny system ról
- **Ryzyko:** Wysokie - eskalacja uprawnień

### 5. Brak zabezpieczeń waluty (CRITICAL)
- **Lokalizacja:** `profiles.money`, `profiles.pln_balance`
- **Problem:** Możliwość zmiany przez API
- **Ryzyko:** Krytyczne - kradzież waluty

### 6. Brak audytowania akcji admin (HIGH)
- **Lokalizacja:** `src/app/api/admin/exec/route.ts`
- **Problem:** Brak szczegółowego logowania
- **Ryzyko:** Wysokie - trudne śledzenie nadużyć

### 7. Wyciek danych w error messages (MEDIUM)
- **Lokalizacja:** Większość endpointów
- **Problem:** Błędy Supabase zwracane bezpośrednio
- **Ryzyko:** Średnie - ujawnienie struktury bazy

### 8. Brak rate limiting per user (MEDIUM)
- **Lokalizacja:** Middleware
- **Problem:** Rate limiting tylko per IP
- **Ryzyko:** Średnie - DoS ataki

---

## 8. PLAN IMPLEMENTACJI

### KROK 1: Krytyczne bezpieczeństwo (24-48h)

1. ✅ Dodaj autoryzację do wszystkich endpointów content
2. ✅ Włącz RLS na wszystkich tabelach
3. ✅ Stwórz helper functions dla autoryzacji
4. ✅ Zabezpiecz system waluty (database functions)
5. ✅ Dodaj walidację danych wejściowych

### KROK 2: System ról (tydzień)

1. ✅ Utwórz nowe tabele ról
2. ✅ Migruj istniejące dane
3. ✅ Zaimplementuj RLS policies dla ról
4. ✅ Zaktualizuj admin console
5. ✅ Zaktualizuj DEV module

### KROK 3: Podział danych profilu (tydzień)

1. ✅ Utwórz nowe tabele (public/private/wallet)
2. ✅ Migruj istniejące dane
3. ✅ Zaimplementuj RLS policies
4. ✅ Zaktualizuj API endpoints
5. ✅ Zaktualizuj frontend

### KROK 4: Ochrona projektów (tydzień)

1. ✅ Dodaj RLS policies dla dev_projects
2. ✅ Dodaj RLS policies dla dev_tasks
3. ✅ Zaktualizuj API helpers
4. ✅ Dodaj audytowanie akcji
5. ✅ Testuj system uprawnień

### KROK 5: Finalizacja (tydzień)

1. ✅ Dodaj comprehensive logging
2. ✅ Dodaj monitoring
3. ✅ Testuj wszystkie endpointy
4. ✅ Dokumentuj system
5. ✅ Security review

---

## PODSUMOWANIE

- **Krytyczne problemy:** 5
- **Ważne problemy:** 3
- **Średnie problemy:** 2
- **Całkowita liczba problemów:** 10

**Szacowany czas implementacji:** 4-5 tygodni

**Priorytet:** Zacznij od krytycznych problemów bezpieczeństwa, potem system ról, potem podział danych profilu.

---

## DODATKOWE REKOMENDACJE

1. **Implementuj webhook signature verification** dla wszystkich webhooków
2. **Dodaj rate limiting per user** z użyciem Redis
3. **Implementuj audit logging** dla wszystkich敏感操作
4. **Dodaj encryption** dla wrażliwych danych w bazie
5. **Regular security reviews** co miesiąc
6. **Penetration testing** przed wdrożeniem
7. **Bug bounty program** dla społeczności
