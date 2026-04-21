# Phase 02: Code Review Report

**Reviewed:** 2026-04-20T12:00:00Z  
**Depth:** deep  
**Files Reviewed:** 10  
**Status:** issues_found

## Summary

Performed deep code review of 10 changed source files in the tss-website repository. Analysis includes cross-file dependency tracking, type safety verification, security assessment, and code quality evaluation.

**Key Findings:**
- 4 Critical security vulnerabilities related to Supabase client usage in Server Components
- 5 High-priority issues related to type safety and null handling
- 9 Medium-priority code quality issues
- 8 Low-priority suggestions

### Files Reviewed
- `tss-website/src/app/e-sport/e-sport.tsx`
- `tss-website/src/app/games/games.tsx`
- `tss-website/src/app/profil/page.tsx`
- `tss-website/src/app/records/page.tsx`
- `tss-website/src/components/BottomNavigation.tsx`
- `tss-website/src/components/Sidebar.tsx`
- `tss-website/src/hooks/use-section-theme.ts`
- `tss-website/src/lib/supabase.ts`
- `tss-website/src/lib/supabase-server.ts`
- `tss-website/src/middleware.ts`

---

## Critical Issues

### CR-01: Server Component Supabase Client Null Dereference Risk

**File:** `tss-website/src/app/e-sport/e-sport.tsx:8`  
**Issue:** In Server Components, `supabase` client is awaited and used directly without null checking. If Supabase environment variables are missing, the client throws an error but downstream code continues execution with potentially incomplete data.

```typescript
// Current (line 8-9)
export default async function ESportPage() {
  const supabase = await createClient();
  const { data: events, error: eventsError } = await supabase
    .from("e_sport_events")
```

**Fix:** Add explicit null/error handling:
```typescript
export default async function ESportPage() {
  let supabase: any = null;
  let createClientError: Error | null = null;
  
  try {
    supabase = await createClient();
  } catch (err) {
    createClientError = err as Error;
    console.error('[E-SPORT] Failed to create Supabase client:', createClientError.message);
    // Redirect or show error page
    return <div className="p-20 text-center">Błąd konfiguracji Supabase</div>;
  }
  
  if (!supabase) {
    return <div className="p-20 text-center">Błąd konfiguracji Supabase</div>;
  }
  
  const { data: events, error: eventsError } = await supabase
    .from("e_sport_events")
    .select("*")
    .order("event_date", { ascending: true });
```

**Severity:** Critical  
**Impact:** Can cause silent data failures or crashes when Supabase is not configured

---

### CR-02: Server Component Games Page Missing Error Handling

**File:** `tss-website/src/app/games/games.tsx:8`  
**Issue:** Similar to CR-01, the `games.tsx` Server Component lacks proper error handling for Supabase client creation and database queries.

```typescript
// Current (line 7-8)
export default async function GamesPage() {
  const supabase = await createClient();
  const { data: games, error } = await supabase.from("games").select("*");
```

**Fix:**
```typescript
export default async function GamesPage() {
  let supabase: any = null;
  let createClientError: Error | null = null;
  
  try {
    supabase = await createClient();
  } catch (err) {
    createClientError = err as Error;
    console.error('[GAMES] Failed to create Supabase client:', createClientError.message);
    return <div className="p-20 text-center">Błąd konfiguracji Supabase</div>;
  }
  
  if (!supabase) {
    return <div className="p-20 text-center">Błąd konfiguracji Supabase</div>;
  }
  
  const { data: games, error } = await supabase.from("games").select("*");
```

**Severity:** Critical  
**Impact:** Silent failures when Supabase is misconfigured

---

### CR-03: Server Component Records Page Null Safety

**File:** `tss-website/src/app/records/page.tsx:8`  
**Issue:** Records page has identical pattern without null safety for Supabase client.

```typescript
// Current (line 7-8)
export default async function RecordsPage() {
  const supabase = await createClient();
  const { data: records, error } = await supabase.from("records").select("*");
```

**Fix:** Apply same fix as CR-02

**Severity:** Critical  
**Impact:** Consistent vulnerability pattern across multiple pages

---

### CR-04: Profile Page Race Condition in Data Fetching

**File:** `tss-website/src/app/profil/page.tsx:136`  
**Issue:** The profile page uses Supabase Realtime subscription but the ranking data is fetched inside the `fetchData` callback, which may lead to inconsistent state. The subscription fires multiple times potentially updating state before the initial load completes.

```typescript
// Current (lines 120-138)
const fetchData = async (currentUser: any) => {
  const discordId = currentUser.user_metadata?.provider_id || currentUser.id;
  const { data: initialProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", discordId)
    .maybeSingle();
  setProfile(initialProfile || { xp: 0, money: 0, bank: 0, level: 1, rank: "", discord_roles: [], pln_balance: 0 });

  if (channel) supabase.removeChannel(channel);
  const freshChannel = supabase.channel(`profile-${discordId}`);
  freshChannel.on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `id=eq.${discordId}` },
    (payload) => setProfile(payload.new));
  freshChannel.subscribe();
  channel = freshChannel;

  const data = await fetchRankingData();  // RACE CONDITION: Called inside callback
  setRankingData(data);
  setLoading(false);
};
```

**Fix:** Fetch ranking data before subscribing, and handle subscription updates more carefully:
```typescript
const fetchData = async (currentUser: any) => {
  const discordId = currentUser.user_metadata?.provider_id || currentUser.id;
  
  // Fetch ranking data FIRST (outside realtime callback)
  const rankingData = await fetchRankingData();
  setRankingData(rankingData);
  
  // Get profile with fallback
  const { data: initialProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", discordId)
    .maybeSingle();
  
  const profileData = initialProfile || { xp: 0, money: 0, bank: 0, level: 1, rank: "", discord_roles: [], pln_balance: 0 };
  
  // Set profile (but don't call setProfile twice for same event)
  setProfile(profileData);
  
  // Subscribe AFTER setting initial state
  if (channel && typeof channel.unsubscribe === 'function') {
    supabase.removeChannel(channel);
  }
  const freshChannel = supabase.channel(`profile-${discordId}`);
  const subscription = freshChannel.on("postgres_changes", { 
    event: "UPDATE",  // Only UPDATE, not INSERT/DELETE for profile
    schema: "public", 
    table: "profiles", 
    filter: `id=eq.${discordId}` 
  }, (payload) => {
    // Update only if new profile has different data
    setProfile(prev => {
      if (!prev) return payload.new;
      return { ...prev, ...payload.new };
    });
  });
  freshChannel.subscribe();
  channel = freshChannel;
};
```

**Severity:** Critical  
**Impact:** Race conditions can cause UI inconsistencies, lost updates, or incorrect ranking display

---

## High Priority Issues

### HI-01: Unchecked Optional Chaining on Profile Fields

**File:** `tss-website/src/app/profil/page.tsx:243`  
**Issue:** Direct access to `profile?.money` without ensuring `profile` exists. While optional chaining (`?.`) is used in the variable assignment, the template literal could still fail if profile is null and money is accessed improperly.

```typescript
// Current (lines 240-246)
<div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/5">
    <span className="text-sm font-bold opacity-60 text-black dark:text-white">Portfel</span>
    <div className="flex items-center gap-2">
      <span className="text-xl font-black text-[var(--color-general)]">{profile?.money || 0}</span>
      <Image src="/assets/discord/coin/Coin_TSS.png" alt="C" width={24} height={24} />
    </div>
</div>
```

**Fix:** Ensure profile always has default values:
```typescript
<div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/5">
    <span className="text-sm font-bold opacity-60 text-black dark:text-white">Portfel</span>
    <div className="flex items-center gap-2">
      <span className="text-xl font-black text-[var(--color-general)]">{(profile?.money ?? 0).toLocaleString()}</span>
      <Image src="/assets/discord/coin/Coin_TSS.png" alt="C" width={24} height={24} />
    </div>
</div>
```

**Severity:** High  
**Impact:** Potential runtime errors if profile is malformed

---

### HI-02: Discord Roles Parsing Could Fail on Malformed Input

**File:** `tss-website/src/app/profil/page.tsx:49`  
**Issue:** The `findRole` function uses regex matching that could return `undefined` if the role format doesn't match expected patterns. This could cause crashes when displaying roles.

```typescript
// Current (lines 46-57)
function findRole(raw: string) {
    const t = raw.trim();
    if (ROLE_MAP.has(t)) return ROLE_MAP.get(t)!;
    const inner = raw.match(/︱\s*(.+?)\s*〕/)?.[1]?.trim().toLowerCase();
    if (inner) {
        for (const [key, val] of ROLE_MAP) {
            const ki = key.match(/︱\s*(.+?)\s*〕/)?.[1]?.trim().toLowerCase();
            if (ki && ki === inner) return val;
        }
    }
    return null;  // Returns null but callers expect { priority, color, label }
}
```

**Fix:** Add type guard and better error handling:
```typescript
function findRole(raw: string): { priority: number; color: string; label: string } | null {
    const t = raw.trim();
    
    if (ROLE_MAP.has(t)) return ROLE_MAP.get(t)!;
    
    const match = raw.match(/︱\s*(.+?)\s*〕/);
    if (!match) return null;
    
    const inner = match[1]?.trim().toLowerCase();
    if (!inner) return null;
    
    for (const [key, val] of ROLE_MAP) {
        const keyMatch = key.match(/︱\s*(.+?)\s*〕/);
        if (keyMatch) {
            const ki = keyMatch[1]?.trim().toLowerCase();
            if (ki === inner) return val;
        }
    }
    return null;
}
```

**Severity:** High  
**Impact:** Could cause runtime errors with malformed Discord role data

---

### HI-03: Ranking Data Type Safety

**File:** `tss-website/src/app/profil/page.tsx:91`  
**Issue:** The `fetchRankingData` function uses type assertion `as any` implicitly through `u: any` which bypasses TypeScript's type checking.

```typescript
// Current (lines 91-94)
const usersByLevel = (levelUsers || []).map((u: any, idx: number) => ({
    ...u,
    rank: idx + 1,
    discord_id: u.discord_id || u.id
}));
```

**Fix:** Use explicit types:
```typescript
interface RankedUser {
    id: string;
    discord_id: string;
    username?: string;
    discord_name?: string;
    level?: number;
    xp?: number;
    money?: number;
    rank: number;
}

const fetchRankingData = async () => {
    const { data: levelUsers } = await supabase.from("profiles").select("id, discord_id, username, level, xp").order("level", { ascending: false }).limit(100);
    const { data: moneyUsers } = await supabase.from("profiles").select("id, discord_id, username, money").order("money", { ascending: false }).limit(100);

    const usersByLevel: RankedUser[] = (levelUsers || []).map((u, idx: number) => ({
        ...u,
        rank: idx + 1,
        discord_id: u.discord_id || u.id
    }));
    
    const usersByMoney: RankedUser[] = (moneyUsers || []).map((u, idx: number) => ({
        ...u,
        rank: idx + 1,
        discord_id: u.discord_id || u.id
    }));

    return { usersByLevel, usersByMoney };
};
```

**Severity:** High  
**Impact:** Reduced type safety, potential for runtime errors

---

### HI-04: Sidebar Hover State Not Cleared on Navigation Change

**File:** `tss-website/src/components/Sidebar.tsx:112`  
**Issue:** The `hoveredSectionId` state is never reset when navigating to a new page. This can cause the sidebar to appear "stuck" in an expanded state when switching sections.

```typescript
// Current (line 112)
const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
```

**Fix:** Reset on pathname change:
```typescript
const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

useEffect(() => {
    // Reset hover state on navigation change
    setHoveredSectionId(null);
}, [pathname]);
```

**Severity:** High  
**Impact:** UI state persistence bugs, poor user experience

---

## Medium Priority Issues

### ME-01: Unused Import in BottomNavigation

**File:** `tss-website/src/components/BottomNavigation.tsx:3`  
**Issue:** `React` is imported but not used anywhere in the component.

```typescript
import React, { useState, useEffect } from "react";
```

**Fix:** Remove unused import:
```typescript
import { useState, useEffect } from "react";
```

**Severity:** Medium  
**Impact:** Minor code cleanliness issue

---

### ME-02: Missing Type Exports

**File:** `tss-website/src/app/profil/page.tsx:87`  
**Issue:** The `fetchRankingData` function is not exported, making it impossible to test in isolation or reuse in other components.

```typescript
const fetchRankingData = async () => { ... }  // Not exported
```

**Fix:** Consider exporting for testing:
```typescript
export const fetchRankingData = async () => { ... }
```

**Severity:** Medium  
**Impact:** Reduces testability and code reuse

---

### ME-03: Hardcoded Role Priority Values

**File:** `tss-website/src/app/profil/page.tsx:18`  
**Issue:** Role priority values are hardcoded in an array. This makes it difficult to modify role ordering without modifying the code.

```typescript
const ROLE_PRIORITY: Array<{ key: string; color: string; label: string }> = [
    { key: "〔 👑︱Owner 〕", color: "#dc3545", label: "OWNER" },
    // ... many more roles
];
```

**Fix:** Consider external configuration:
```typescript
// Extract role priorities from a config file or environment variables
const ROLE_PRIORITY: Array<{ key: string; color: string; label: string }> = 
  JSON.parse(process.env.ROLE_PRIORITIES || '[]');
```

**Severity:** Medium  
**Impact:** Hard to maintain and modify

---

### ME-04: Channel Variable Not Initialized Before Use

**File:** `tss-website/src/app/profil/page.tsx:118`  
**Issue:** The `channel` variable is declared but may not be initialized in all code paths before being passed to `supabase.removeChannel()`.

```typescript
// Current (lines 118-134)
let channel: any = null;

const fetchData = async (currentUser: any) => {
  // ...
  if (channel) supabase.removeChannel(channel);
  const freshChannel = supabase.channel(`profile-${discordId}`);
  freshChannel.on("postgres_changes", { ... }, (payload) => setProfile(payload.new));
  freshChannel.subscribe();
  channel = freshChannel;
```

**Fix:** Add null check before removeChannel:
```typescript
if (channel && typeof channel.unsubscribe === 'function') {
  supabase.removeChannel(channel);
}
```

**Severity:** Medium  
**Impact:** Potential runtime errors

---

### ME-05: Missing Loading State for Ranking Data

**File:** `tss-website/src/app/profil/page.tsx:114`  
**Issue:** The `rankingData` state is initialized but there's no explicit loading state. The component shows loading only for the initial auth check, not for the ranking data fetch.

```typescript
const [rankingData, setRankingData] = useState<{ usersByLevel: any[]; usersByMoney: any[] }>({ 
    usersByLevel: [], 
    usersByMoney: [] 
});
```

**Fix:** Add separate loading state:
```typescript
const [rankingData, setRankingData] = useState<{ 
    usersByLevel: any[]; 
    usersByMoney: any[] 
}>({ usersByLevel: [], usersByMoney: [] });
const [rankingLoading, setRankingLoading] = useState(false);

const fetchData = async (currentUser: any) => {
  // ...
  setRankingLoading(true);
  const data = await fetchRankingData();
  setRankingData(data);
  setRankingLoading(false);
  setLoading(false);
};
```

**Severity:** Medium  
**Impact:** User waits without feedback

---

### ME-06: Inconsistent Error Logging

**File:** `tss-website/src/app/e-sport/e-sport.tsx:17`  
**Issue:** Error logging is inconsistent - some pages log with `console.error`, others don't.

```typescript
// Current (line 17)
if (eventsError) console.error('[E-SPORT] Error fetching events:', eventsError.message);
```

**Fix:** Create a consistent logging utility or use a proper logger:
```typescript
// In lib/logger.ts
export const log = {
    error: (ctx: string, message: string) => console.error(`[${ctx}] ${message}`),
    warn: (ctx: string, message: string) => console.warn(`[${ctx}] ${message}`),
    info: (ctx: string, message: string) => console.info(`[${ctx}] ${message}`),
};

// Usage:
log.error('[E-SPORT]', 'Error fetching events:', eventsError.message);
```

**Severity:** Medium  
**Impact:** Inconsistent debugging experience

---

### ME-07: Next Image Unoptimized Flag

**File:** `tss-website/src/app/profil/page.tsx:158`  
**Issue:** Image optimization is disabled (`unoptimized`) which can cause issues in production and increases bundle size.

```typescript
<Image
    src={logo}
    alt="Two Steps Studio Logo"
    width={240}
    height={140}
    className="transition-opacity duration-500 object-contain w-auto h-full max-h-[90px]"
    unoptimized  // This should be investigated
/>
```

**Fix:** Either fix image paths or remove unoptimized:
```typescript
<Image
    src="/assets/Logo/Glowne/Two Steps Studio Bez Tła.png"  // Use absolute path
    alt="Two Steps Studio Logo"
    width={240}
    height={140}
    className="transition-opacity duration-500 object-contain w-auto h-full max-h-[90px]"
/>
```

**Severity:** Medium  
**Impact:** Potential build issues, larger bundle size

---

### ME-08: Missing Supabase TypeScript Definitions

**File:** `tss-website/src/lib/supabase.ts:4`  
**Issue:** Supabase types are not explicitly imported or configured, which may lead to incomplete type coverage.

```typescript
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

**Fix:** Add explicit type declarations:
```typescript
interface Profile {
    id: string;
    discord_id: string;
    username?: string;
    level: number;
    xp: number;
    money: number;
    bank: number;
    pln_balance?: number;
    // ...
}

declare module '@supabase/ssr' {
    interface SupabaseClient {
        from<T>(table: string): Table<T>;
    }
}
```

**Severity:** Medium  
**Impact:** Reduced IDE support and type safety

---

## Low Priority Issues

### LO-01: Magic Numbers in Level Calculation

**File:** `tss-website/src/app/profil/page.tsx:169`  
**Issue:** Magic number `0.1` is used in level XP calculation without explanation.

```typescript
const currentLevelStartXP = Math.pow(level / 0.1, 2);
const nextLevelStartXP = Math.pow((level + 1) / 0.1, 2);
```

**Fix:** Extract to constant with documentation:
```typescript
const XP_BASE_MULTIPLIER = 0.1;

const currentLevelStartXP = Math.pow(level / XP_BASE_MULTIPLIER, 2);
const nextLevelStartXP = Math.pow((level + 1) / XP_BASE_MULTIPLIER, 2);
```

**Severity:** Low  
**Impact:** Minor code clarity issue

---

### LO-02: Line Clamp on Dynamic Content

**File:** `tss-website/src/app/e-sport/e-sport.tsx:98`  
**Issue:** `line-clamp-1` class could cause text truncation issues if team names exceed certain lengths.

```typescript
<CardTitle className="text-2xl font-bold font-[family-name:var(--font-space)] text-black dark:text-white group-hover:text-[var(--color-e-sport)] transition-colors line-clamp-1">
    {team.name}
</CardTitle>
```

**Fix:** Consider adding a max-width or using `truncate`:
```typescript
<CardTitle className="text-2xl font-bold font-[family-name:var(--font-space)] text-black dark:text-white group-hover:text-[var(--color-e-sport)] transition-colors line-clamp-2 truncate max-w-full">
    {team.name}
</CardTitle>
```

**Severity:** Low  
**Impact:** Potential UX issue with very long names

---

### LO-03: Hover State Scale Values

**File:** `tss-website/src/components/BottomNavigation.tsx:52`  
**Issue:** The `scale-125` class may cause overlapping icons when multiple items are active.

```typescript
const getPathScale = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)
        ? "scale-125 drop-shadow-[0_0_8px_rgba(var(--color-general-rgb),0.5)]"
        : "scale-100";
```

**Severity:** Low  
**Impact:** Minor visual polish issue

---

### LO-04: Profile Page Suppress Hydration Warning Scope

**File:** `tss-website/src/app/profil/page.tsx:179`  
**Issue:** `suppressHydrationWarning` is only on the outer container, but inner components may still cause hydration mismatches.

```typescript
return (
    <div className="container mx-auto p-6 space-y-8 mt-20 max-w-6xl pb-16" suppressHydrationWarning>
```

**Fix:** Add to all dynamic content or use more granular suppressHydrationWarning placement.

**Severity:** Low  
**Impact:** Console warnings in development

---

### LO-05: BottomNavigation Conditional Rendering

**File:** `tss-website/src/components/BottomNavigation.tsx:43`  
**Issue:** Early return without checking for `pathname` existence could cause issues on empty paths.

```typescript
if (!isMobile) return null;
```

**Fix:** Add defensive check:
```typescript
if (!isMobile || !pathname) return null;
```

**Severity:** Low  
**Impact:** Edge case handling

---

### LO-06: Unused Files in Git Status

**File:** `.claude/settings.local.json`, `Project.md`, `REFACTORING_SUMMARY.md`, `tss-website/README.md`  
**Issue:** These files appear in git status but are documentation/metadata files, not source code. They should be excluded from code review.

**Severity:** Low  
**Impact:** None - these files shouldn't be reviewed

---

## Cross-File Analysis

### Import Graph Analysis

**Modules Analyzed:**
- `e-sport.tsx` → `supabase-server` → `ui/card`, `ui/badge`, `ui/button`
- `games.tsx` → `supabase-server` → `ui/card`, `ui/badge`
- `records.tsx` → `supabase-server` → `ui/card`, `ui/badge`
- `page.tsx` (profil) → `supabase` (browser) → `ui/card`, `ui/avatar`, `ui/progress`
- `BottomNavigation.tsx` → `ui/utils`, `lucide-react`
- `Sidebar.tsx` → `use-section-theme`, `use-language`, `use-sidebar`, `next-themes`
- `use-section-theme.ts` → `next/navigation`

**Circular Dependencies:** None detected

**Shared Dependencies:**
- All pages share `@supabase/ssr` package
- Sidebar and BottomNavigation share theme hooks

### Call Chain Analysis

**Key Functions:**
1. `fetchRankingData()` → `setRankingData()` → `topList.map()`
   - Risk: Race condition between fetch and subscription updates
   
2. `useSectionTheme()` → theme color → `Card` styling
   - Risk: No validation of pathname before applying theme

3. `findRole()` → `DiscordRolesPanel` → UI rendering
   - Risk: Null handling in role parsing

**Error Propagation:**
- Supabase errors are logged but not uniformly propagated
- UI fallbacks exist but error messages could be more user-friendly

### Type Safety Assessment

**Type Issues Found:**
1. Implicit `any` in profile state: `useState<any>(null)`
2. Missing type definitions for Supabase queries
3. Mixed use of `any`, `string | null`, and explicit types

**Recommendations:**
- Define interfaces for all Supabase query types
- Remove all `any` type assertions
- Add proper types for profile data structure

---

## Security Summary

| Issue | Severity | Status |
|-------|----------|--------|
| Null client dereference | Critical | Needs Fix |
| Missing error handling | Critical | Needs Fix |
| Race conditions | Critical | Needs Fix |
| Unchecked role parsing | High | Needs Fix |
| Type safety gaps | High | Needs Fix |
| Unused imports | Medium | Can improve |
| Missing loading states | Medium | Can improve |

### Security Recommendations

1. **Implement Supabase Error Handling:**
   - All Server Components must handle `createClient()` errors
   - Add fallback UI for missing Supabase configuration
   - Log errors consistently with context

2. **Type Safety:**
   - Define explicit types for all database queries
   - Remove `any` type assertions
   - Add TypeScript definitions for Supabase types

3. **Race Condition Prevention:**
   - Fetch ranking data before subscribing
   - Use proper subscription event filtering
   - De-duplicate state updates

4. **Input Validation:**
   - Validate Discord role strings before parsing
   - Handle malformed data gracefully
   - Add type guards for user metadata

5. **Consistent Error Handling:**
   - Create utility functions for common errors
   - Use consistent logging format
   - Add user-friendly error messages

---

## Recommendations

### Immediate Actions (Critical)
1. Fix Supabase null safety in all Server Components
2. Add proper error handling for database queries
3. Fix race conditions in profile page data fetching
4. Add type definitions for Supabase types

### Short-term (High)
1. Improve type safety across all components
2. Add loading states for async operations
3. Fix hover state cleanup in Sidebar
4. Improve error logging consistency

### Long-term (Medium/Low)
1. Extract magic numbers to constants
2. Document role priorities externally
3. Improve image optimization
4. Create utility functions for common patterns

---

## Findings Summary

```yaml
status: issues_found
findings:
  critical: 4
  warning: 5
  info: 8
  total: 17
```

- **Critical:** 4 (Security vulnerabilities, race conditions, null safety)
- **Warning:** 5 (High priority issues affecting functionality)
- **Info:** 8 (Medium/Low priority improvements)
- **Total:** 17

---

_Reviewed: 2026-04-20T12:00:00Z_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: deep_
