# TSS Beta - Mapa Migracji Bezpieczeństwa

**Data:** 2026-07-28  
**Status:** Gotowa do zatwierdzenia  
**Cel:** Kontrolowana migracja bezpieczeństwa bez przerywania działania aplikacji

---

## PRIORYTET 1: settings.isAdmin (3 pliki)

### FILE: src/app/admin/page.tsx
**PATH:** C:\Users\marci\Documents\GitHub\tss\tss-website\src\app\admin\page.tsx

**CURRENT:**
```typescript
const checkAdminStatus = async () => {
  try {
    const response = await fetch("/api/admin/auth");
    const data = await response.json();
    setIsAdmin(data.isAdmin || false);
  } catch (error) {
    console.error("Failed to check admin status:", error);
  }
};
```

**CHANGE:**
```typescript
const checkAdminStatus = async () => {
  try {
    const response = await fetch("/api/admin/auth");
    const data = await response.json();
    setIsAdmin(data.isAdmin || false); // API zwróci to samo po migracji
  } catch (error) {
    console.error("Failed to check admin status:", error);
  }
};
```

**RISK:** NISKIE - frontend nie wymaga zmiany, API zostanie zaktualizowane

---

### FILE: src/app/api/admin/auth/route.ts
**PATH:** C:\Users\marci\Documents\GitHub\tss\tss-website\src\app\api\admin\auth\route.ts

**CURRENT:**
```typescript
const { data: profile } = await supabase
  .from("profiles")
  .select("settings")
  .eq("id", user.id)
  .single();

const isAdmin = profile?.settings?.isAdmin === true;
return NextResponse.json({ isAdmin }, { status: 200 });
```

**CHANGE:**
```typescript
// Użyć nowego helpera requireRole('ADMIN')
import { requireAuth, requireRole } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  
  const roleCheck = requireRole(auth, 'ADMIN');
  return NextResponse.json({ isAdmin: roleCheck === null }, { status: 200 });
}
```

**RISK:** ŚREDNIE - wymaga istnienia helperów, ale kompatybilne z frontendem

---

### FILE: src/app/api/admin/users/route.ts
**PATH:** C:\Users\marci\Documents\GitHub\tss\tss-website\src\app\api\admin\users\route.ts

**CURRENT:**
```typescript
const { data: profile } = await supabase
  .from("profiles")
  .select("settings")
  .eq("id", user.id)
  .single();

const isAdmin = profile?.settings?.isAdmin === true;
if (!isAdmin) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

**CHANGE:**
```typescript
import { requireAuth, requireRole } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  
  const roleCheck = requireRole(auth, 'ADMIN');
  if (roleCheck) return roleCheck;
  
  // ... reszta kodu
}
```

**RISK:** ŚREDNIE - wymaga istnienia helperów

---

## PRIORYTET 2: rank (6 plików)

### FILE: src/app/profil/page.tsx
**PATH:** C:\Users\marci\Documents\GitHub\tss\tss-website\src\app\profil\page.tsx

**CURRENT:**
```typescript
const roleInfo = ROLE_MAP_BADGE[profile?.rank] || { color: "var(--color-general)", label: `LEVEL ${profile?.level || 1}` };
```

**CHANGE:**
```typescript
// rank pozostaje jako Discord rank (nie globalna rola)
// Nie zmieniać - rank jest używany dla Discord roles display
const roleInfo = ROLE_MAP_BADGE[profile?.rank] || { color: "var(--color-general)", label: `LEVEL ${profile?.level || 1}` };
```

**RISK:** NISKIE - rank pozostaje jako Discord rank, nie globalna rola

---

### FILE: src/app/api/admin/exec/route.ts
**PATH:** C:\Users\marci\Documents\GitHub\tss\tss-website\src\app\api\admin\exec\route.ts

**CURRENT:**
```typescript
const VALID_ROLES = ["OWNER", "ADMIN", "MOD", "VIP", "DEV", "PROD", "MKT", "LD"];
if (cmd === "set-role" && parts.length >= 3) {
  if (!VALID_ROLES.includes(parts[1].toUpperCase())) {
    return NextResponse.json({ error: "Nieprawidlowa nazwa roli" }, { status: 400 });
  }
  const { error } = await supabaseAdmin.from("profiles").update({ rank: parts[1] }).eq("id", parts[2]);
}
```

**CHANGE:**
```typescript
// Użyć nowego systemu ról globalnych
const VALID_ROLES = ["OWNER", "ADMIN", "MODERATOR", "USER"];
if (cmd === "set-role" && parts.length >= 3) {
  if (!VALID_ROLES.includes(parts[1].toUpperCase())) {
    return NextResponse.json({ error: "Nieprawidlowa nazwa roli" }, { status: 400 });
  }
  // Użyć tabeli user_roles zamiast profiles.rank
  const { error } = await supabaseAdmin
    .from("user_roles")
    .upsert({
      user_id: parts[2],
      role: parts[1].toUpperCase(),
      granted_by: auth.user.id,
      granted_at: new Date().toISOString()
    });
}
```

**RISK:** WYSOKIE - zmiana logiki admin console, wymaga migracji bazy danych

---

### FILE: src/lib/gamification.ts
**PATH:** C:\Users\marci\Documents\GitHub\tss\tss-website\src\lib\gamification.ts

**CURRENT:**
```typescript
export function getRankName(level: number) {
  if (level >= 50) return "Legend";
  if (level >= 40) return "Grandmaster";
  if (level >= 30) return "Master";
  if (level >= 20) return "Veteran";
  if (level >= 10) return "Advanced";
  return "Novice";
}
```

**CHANGE:**
```typescript
// Nie zmieniać - to jest gamification rank, nie rola systemowa
export function getRankName(level: number) {
  if (level >= 50) return "Legend";
  if (level >= 40) return "Grandmaster";
  if (level >= 30) return "Master";
  if (level >= 20) return "Veteran";
  if (level >= 10) return "Advanced";
  return "Novice";
}
```

**RISK:** NISKIE - to jest gamification rank, nie rola systemowa

---

## PRIORYTET 3: money (6 plików)

### FILE: src/app/profil/page.tsx
**PATH:** C:\Users\marci\Documents\GitHub\tss\tss-website\src\app\profil\page.tsx

**CURRENT:**
```typescript
const profileData = initialProfile || { xp: 0, money: 0, bank: 0, level: 1, rank: "", discord_roles: [], pln_balance: 0 };
// ...
<span className="text-xl font-black text-[var(--color-general)]">{(profile?.money ?? 0).toLocaleString()}</span>
<span className="text-xl font-black text-[var(--color-general)]">{profile?.bank || 0}</span>
<span className="text-xl font-black text-[var(--color-general)]">{profile?.pln_balance?.toFixed(2) || "0.00"} zł</span>
```

**CHANGE:**
```typescript
// Po migracji walleta, dane będą pochodzić z user_wallets
// Na razie nie zmieniać - profiles pozostaje jako compatibility layer
const profileData = initialProfile || { xp: 0, money: 0, bank: 0, level: 1, rank: "", discord_roles: [], pln_balance: 0 };
// ...
<span className="text-xl font-black text-[var(--color-general)]">{(profile?.money ?? 0).toLocaleString()}</span>
<span className="text-xl font-black text-[var(--color-general)]">{profile?.bank || 0}</span>
<span className="text-xl font-black text-[var(--color-general)]">{profile?.pln_balance?.toFixed(2) || "0.00"} zł</span>
```

**RISK:** NISKIE - profiles pozostaje jako compatibility layer

---

### FILE: src/app/api/user/settings/route.ts
**PATH:** C:\Users\marci\Documents\GitHub\tss\tss-website\src\app\api\user\settings\route.ts

**CURRENT:**
```typescript
const body = await request.json();
const { games_visible, records_visible, dev_visible, username } = body;
const updateData: any = {};
if (typeof games_visible === "boolean") updateData.games_visible = games_visible;
if (typeof records_visible === "boolean") updateData.records_visible = records_visible;
if (typeof dev_visible === "boolean") updateData.dev_visible = dev_visible;
if (username && typeof username === "string") updateData.username = username;
// Brak walidacji - użytkownik może wysłać money: 999999
```

**CHANGE:**
```typescript
const body = await request.json();
const { games_visible, records_visible, dev_visible, username } = body;

// Whitelist dozwolonych pól
const ALLOWED_FIELDS = ['games_visible', 'records_visible', 'dev_visible', 'username'];
const updateData: any = {};

for (const field of ALLOWED_FIELDS) {
  if (body[field] !== undefined) {
    updateData[field] = body[field];
  }
}

// Po migracji walleta, pola money/pln_balance/bank będą w user_wallets
// i nie będą dostępne przez ten endpoint
```

**RISK:** ŚREDNIE - wymaga natychmiastowej poprawki dla bezpieczeństwa

---

## PRIORYTET 4: dev_project_members (13 plików)

### FILE: src/lib/dev-permissions.ts
**PATH:** C:\Users\marci\Documents\GitHub\tss\tss-website\src\lib\dev-permissions.ts

**CURRENT:**
```typescript
export async function checkProjectPermission(
  projectId: number,
  permission: PermissionName
): Promise<PermissionCheckResult> {
  // ... sprawdza membership w dev_project_members
  const { data: member } = await supabase
    .from("dev_project_members")
    .select("role, permissions")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .single();
  // ...
}
```

**CHANGE:**
```typescript
// Nie zmieniać - system DEV permissions jest dobry
// Tylko zintegrować z globalnym systemem ról w przyszłości
export async function checkProjectPermission(
  projectId: number,
  permission: PermissionName
): Promise<PermissionCheckResult> {
  // ... pozostaje bez zmian
}
```

**RISK:** NISKIE - system DEV jest dobrze zaimplementowany

---

### FILE: src/app/api/dev-projects/route.ts
**PATH:** C:\Users\marci\Documents\GitHub\tss\tss-website\src\app\api\dev-projects\route.ts

**CURRENT:**
```typescript
const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("project_limit, joined_projects_limit")
  .eq("id", user.id)
  .single();
```

**CHANGE:**
```typescript
// Po migracji profili, project_limit będzie w private_profiles
// Na razie nie zmieniać - profiles pozostaje jako compatibility layer
const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("project_limit, joined_projects_limit")
  .eq("id", user.id)
  .single();
```

**RISK:** NISKIE - profiles pozostaje jako compatibility layer

---

## PRIORYTET 5: profiles (40 plików)

### FILE: src/app/api/user/settings/route.ts
**PATH:** C:\Users\marci\Documents\GitHub\tss\tss-website\src\app\api\user\settings\route.ts

**CURRENT:**
```typescript
const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("games_visible, records_visible, dev_visible, project_limit, joined_projects_limit, subscription_plan")
  .eq("id", user.id)
  .maybeSingle();
```

**CHANGE:**
```typescript
// Po migracji, publiczne pola będą w public_profiles
// Prywatne pola będą w private_profiles
// Na razie nie zmieniać - profiles pozostaje jako compatibility layer
const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("games_visible, records_visible, dev_visible, project_limit, joined_projects_limit, subscription_plan")
  .eq("id", user.id)
  .maybeSingle();
```

**RISK:** NISKIE - profiles pozostaje jako compatibility layer

---

### FILE: src/app/profil/page.tsx
**PATH:** C:\Users\marci\Documents\GitHub\tss\tss-website\src\app\profil\page.tsx

**CURRENT:**
```typescript
const { data: initialProfile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", discordId)
  .maybeSingle();
```

**CHANGE:**
```typescript
// Po migracji, publiczne pola będą z public_profiles
// Prywatne pola będą z private_profiles
// Wallet będzie z user_wallets
// Na razie nie zmieniać - profiles pozostaje jako compatibility layer
const { data: initialProfile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", discordId)
  .maybeSingle();
```

**RISK:** NISKIE - profiles pozostaje jako compatibility layer

---

## PODSUMOWANIE RYZYK

### KRYTYCZNE (natychmiastowa poprawka):
1. **src/app/api/user/settings/route.ts** - użytkownik może zmienić money przez API
   - RISK: KRYTYCZNE
   - CHANGE: Dodaj whitelist dozwolonych pól

### WYSOKIE (wymagają migracji bazy danych):
1. **src/app/api/admin/exec/route.ts** - zmiana z rank na user_roles
   - RISK: WYSOKIE
   - CHANGE: Użyć tabeli user_roles

### ŚREDNIE (wymagają helperów):
1. **src/app/api/admin/auth/route.ts** - zmiana z settings.isAdmin na requireRole
   - RISK: ŚREDNIE
   - CHANGE: Użyć helperów

2. **src/app/api/admin/users/route.ts** - zmiana z settings.isAdmin na requireRole
   - RISK: ŚREDNIE
   - CHANGE: Użyć helperów

### NISKIE (kompatybilne):
1. **src/app/profil/page.tsx** - rank, money, profiles
   - RISK: NISKIE
   - CHANGE: Nie zmieniać - profiles jako compatibility layer

2. **src/lib/gamification.ts** - getRankName
   - RISK: NISKIE
   - CHANGE: Nie zmieniać - to jest gamification rank

3. **src/lib/dev-permissions.ts** - dev_project_members
   - RISK: NISKIE
   - CHANGE: Nie zmieniać - system DEV jest dobry

---

## PLAN IMPLEMENTACJI

### KROK 1: Natychmiastowa poprawka krytyczna
1. Napraw `src/app/api/user/settings/route.ts` - dodaj whitelist
2. Test czy użytkownik nie może zmienić money

### KROK 2: API Security Helpers
1. Stwórz `src/lib/auth-helpers.ts`
2. Implementuj requireAuth, requireRole, requireAdmin
3. Test helperów

### KROK 3: System ról
1. Utwórz tabelę user_roles
2. Migruj adminy z settings.isAdmin
3. Zaktualizuj admin/auth i admin/users
4. Test admin panel

### KROK 4: Wallet Security
1. Utwórz tabelę user_wallets
2. Migruj money/pln_balance/bank
3. Stwórz database functions
4. Zaktualizuj API które modyfikują wallet
5. Test wallet security

### KROK 5: Profile Separation
1. Utwórz public_profiles i private_profiles
2. Migruj dane
3. Zaktualizuj RLS policies
4. Zostaw profiles jako compatibility layer
5. Test profile access

### KROK 6: Content System
1. Dodaj owner_id do games/music_tracks/podcasts
2. Włącz RLS policies
3. Zaktualizuj API endpoints
4. Test content security

### KROK 7: Discord Security
1. Szyfruj tokeny w user_integrations
2. Dodaj RLS policies
3. Zaktualizuj API endpoints
4. Test Discord integration

### KROK 8: Audit Logs
1. Utwórz tabelę audit_logs
2. Loguj敏感操作
3. Test audit logging

### KROK 9: Frontend Migration
1. Zaktualizuj TypeScript types
2. Zaktualizuj API calls
3. Test frontend

### KROK 10: Cleanup
1. Usuń stare pola z profiles
2. Usuń settings.isAdmin i rank
3. Final cleanup

---

## ZATWIERDZENIE

**Gotowy do implementacji:** TAK  
**Wymagane zatwierdzenie:** TAK  
**Szacowany czas:** 3-4 tygodnie  
**Ryzyko przestoju:** NISKIE (stopniowa migracja z compatibility layer)
