# Plan A — i18n Architecture Refactor (no content change)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the monolithic `src/lib/translations.ts` into per-locale JSON files in `src/locales/`, write a new `useTranslation()` hook with hybrid API (`t.settings.title` AND `t("settings.theme.dark")`), dynamically import each locale, rename `useLanguage()` → `useTranslation()` in all 21 consumers, delete the orphan stub and the dead file, and add a parity check script.

**Architecture:** Per-locale JSON files (`pl.json`, `en.json`, `de.json`) under `src/locales/`. Static eager import of `pl.json` (default), dynamic `import()` for `en.json` and `de.json` on demand. Hybrid `t` (object + dot-path function) via Proxy. Parity check at `npm run i18n:check`.

**Tech Stack:** Next.js 15, React 19, TypeScript, Node.js (for parity script).

**Scope constraint:** This plan does NOT add new translations. It only moves the existing ones. Plans B-E add content.

---

## File Structure

**Create:**
- `C:/tss/tss-website/src/locales/pl.json` — Polish locale (canonical)
- `C:/tss/tss-website/src/locales/en.json` — English locale
- `C:/tss/tss-website/src/locales/de.json` — German locale
- `C:/tss/tss-website/src/locales/index.ts` — exports `loadMessages(locale)` async + `LocaleMessages` type
- `C:/tss/tss-website/src/hooks/use-translation.tsx` — new hook with hybrid API
- `C:/tss/tss-website/tools/check-i18n-parity.mjs` — assertion that all 3 locales have identical keys
- `C:/tss/docs/i18n.md` — contributor guide

**Modify:**
- 21 consumer files — rename `useLanguage` → `useTranslation` (variable + import)
- `C:/tss/tss-website/src/components/Providers.tsx` — rename `LanguageProvider` → `TranslationProvider`
- `C:/tss/tss-website/package.json` — add `i18n:check` script

**Delete:**
- `C:/tss/tss-website/src/lib/translations.ts` — replaced by `src/locales/`
- `C:/tss/tss-website/src/lib/tss-website/src/lib/translations.ts` — dead stub
- `C:/tss/tss-website/src/hooks/use-language.tsx` — replaced by `use-translation.tsx`

---

## Task 1: Audit existing translations.ts

**Files:**
- Read: `C:/tss/tss-website/src/lib/translations.ts`

- [ ] **Step 1: Read the file**

Confirm the 8 top-level keys: `settings`, `nav`, `sections`, `home`, `auth`, `profile`, `regulamin`, `rekrutacja`.

---

## Task 2: Create the JSON files (pl, en, de)

**Files:**
- Create: `C:/tss/tss-website/src/locales/pl.json`
- Create: `C:/tss/tss-website/src/locales/en.json`
- Create: `C:/tss/tss-website/src/locales/de.json`

- [ ] **Step 1: Generate pl.json**

Mirror the shape of `translations.pl` exactly. JSON keys must be quoted. Polish strings preserved verbatim.

- [ ] **Step 2: Generate en.json**

Mirror `translations.en`. Same keys as pl.json.

- [ ] **Step 3: Generate de.json**

Mirror `translations.de`. Same keys as pl.json.

- [ ] **Step 4: Validate JSON**

```bash
cd "C:/tss/tss-website"
node -e "JSON.parse(require('fs').readFileSync('src/locales/pl.json', 'utf8'))" && echo "pl.json OK"
node -e "JSON.parse(require('fs').readFileSync('src/locales/en.json', 'utf8'))" && echo "en.json OK"
node -e "JSON.parse(require('fs').readFileSync('src/locales/de.json', 'utf8'))" && echo "de.json OK"
```

Expected: 3 lines ending with "OK".

- [ ] **Step 5: Commit**

```bash
git add src/locales/
git commit -m "refactor(i18n): extract translations to per-locale JSON files"
```

---

## Task 3: Create the loader/index module

**Files:**
- Create: `C:/tss/tss-website/src/locales/index.ts`

- [ ] **Step 1: Write the loader**

File: `C:/tss/tss-website/src/locales/index.ts`

```typescript
import pl from "./pl.json";
import type { Messages } from "./_types";

export type Locale = "pl" | "en" | "de";
export const LOCALES: Locale[] = ["pl", "en", "de"];
export const DEFAULT_LOCALE: Locale = "pl";

export type LocaleMessages = Messages;

// Static eager import of PL (canonical, used in SSR + default).
export const messages: Record<Locale, LocaleMessages> = {
  pl: pl as LocaleMessages,
  en: null as unknown as LocaleMessages, // populated on first access
  de: null as unknown as LocaleMessages, // populated on first access
};

// Dynamic loaders. Webpack splits each locale into its own chunk.
const loaders: Record<Locale, () => Promise<LocaleMessages>> = {
  pl: async () => pl as LocaleMessages,
  en: () => import("./en.json") as Promise<unknown> as Promise<LocaleMessages>,
  de: () => import("./de.json") as Promise<unknown> as Promise<LocaleMessages>,
};

/**
 * Load a locale's messages. Cached after first load.
 */
export async function loadMessages(locale: Locale): Promise<LocaleMessages> {
  if (messages[locale]) return messages[locale];
  const data = await loaders[locale]();
  messages[locale] = data;
  return data;
}

/**
 * Pre-load a locale in the background (e.g., on hover of language switcher).
 */
export function preloadLocale(locale: Locale): void {
  if (locale in messages && messages[locale]) return;
  void loadMessages(locale);
}
```

- [ ] **Step 2: Create the type module**

File: `C:/tss/tss-website/src/locales/_types.ts`

```typescript
import type pl from "./pl.json";

export type Messages = typeof pl;
```

Rationale: deriving `Messages` from `pl.json` keeps the source of truth in one place. Adding a new locale requires updating the `Locale` union in `src/locales/index.ts` and the loaders map.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "C:/tss/tss-website"
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "locales" | head -20
```

Expected: no errors in `src/locales/`.

- [ ] **Step 4: Commit**

```bash
git add src/locales/index.ts src/locales/_types.ts
git commit -m "feat(i18n): add dynamic loader with code-splitting per locale"
```

---

## Task 4: Write the new use-translation hook with hybrid API

**Files:**
- Create: `C:/tss/tss-website/src/hooks/use-translation.tsx`

- [ ] **Step 1: Write the hook**

File: `C:/tss/tss-website/src/hooks/use-translation.tsx`

```typescript
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  loadMessages,
  type Locale,
  type LocaleMessages,
} from "@/locales";

const STORAGE_KEY = "tss-i18n-locale";

interface TranslationContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  availableLocales: Locale[];
  // Back-compat aliases — kept so the existing 18 consumers keep working unchanged.
  // Future plans can drop these once all consumers are migrated to the new names.
  language: Locale;
  setLanguage: (locale: Locale) => void;
  availableLanguages: Locale[];
  /** Hybrid: works as object (`t.settings.title`) AND as function (`t("settings.title")`). */
  t: LocaleMessages & ((path: string) => string);
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

/**
 * Resolve a dot-path against a nested object. Returns undefined if any segment missing.
 */
function lookupPath(obj: unknown, path: string): string | undefined {
  const segments = path.split(".");
  let current: unknown = obj;
  for (const seg of segments) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[seg];
  }
  return typeof current === "string" ? current : undefined;
}

/**
 * Build the hybrid `t`: a Proxy that exposes nested objects AND is callable with a dot-path.
 */
function buildHybridT(messages: LocaleMessages): TranslationContextValue["t"] {
  const callable = ((path: string) => {
    const value = lookupPath(messages, path);
    if (value === undefined) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[i18n] Missing key: ${path}`);
      }
      return path;
    }
    return value;
  }) as TranslationContextValue["t"];

  // Wrap the messages object so that property access also returns nested hybrid proxies.
  const proxy = new Proxy(messages, {
    get(target, prop, receiver) {
      if (prop === Symbol.toPrimitive) return undefined;
      const value = Reflect.get(target, prop, receiver);
      if (value && typeof value === "object") {
        return buildHybridT(value as LocaleMessages);
      }
      return value;
    },
  });

  return new Proxy(callable, {
    get(_target, prop) {
      return (proxy as Record<PropertyKey, unknown>)[prop];
    },
  }) as TranslationContextValue["t"];
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [messages, setMessages] = useState<LocaleMessages | null>(null);

  // Initial load: synchronously serve PL (already eager), then hydrate from localStorage.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = (typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEY)
        : null) as Locale | null;
      const initial = saved && LOCALES.includes(saved) ? saved : DEFAULT_LOCALE;
      const data = await loadMessages(initial);
      if (cancelled) return;
      setLocaleState(initial);
      setMessages(data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
    setLocaleState(next);
    void loadMessages(next).then(setMessages);
  }, []);

  const availableLocales = LOCALES;

  const value = useMemo<TranslationContextValue | null>(() => {
    if (!messages) return null;
    return {
      locale,
      setLocale,
      availableLocales,
      // Back-compat aliases
      language: locale,
      setLanguage: setLocale,
      availableLanguages: LOCALES,
      t: buildHybridT(messages),
    };
  }, [locale, setLocale, messages, availableLocales]);

  // Avoid hydration mismatch: render nothing translation-dependent until messages load.
  if (!value) {
    return <TranslationContext.Provider value={null}>{children}</TranslationContext.Provider>;
  }
  return (
    <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    // TranslationProvider not mounted — return no-op fallback so SSR doesn't throw.
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      availableLocales: LOCALES,
      // Back-compat aliases
      language: DEFAULT_LOCALE,
      setLanguage: () => {},
      availableLanguages: LOCALES,
      t: {} as TranslationContextValue["t"],
    };
  }
  return ctx;
}

/** Back-compat alias for any code that still imports the old name. */
export const useLanguage = useTranslation;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "C:/tss/tss-website"
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "use-translation|i18n" | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-translation.tsx
git commit -m "feat(i18n): new useTranslation hook with hybrid object+dot-path API"
```

---

## Task 5: (OPTIONAL cleanup) Rename hook usage in consumers

**Status:** OPTIONAL — the hook exports `useLanguage` as an alias and the context value exposes `language`/`setLanguage`/`availableLanguages` alongside the new names. The 18 existing consumers can keep their current code unchanged.

This task is here for code hygiene. Recommend deferring to Plan E (final cleanup pass).

**Files:**
- Modify: each of the 18 consumer files (list below, found by `grep`)

- [ ] **Step 1: Find all consumers**

```bash
cd "C:/tss/tss-website"
grep -rl "useLanguage" src/ --include="*.tsx" --include="*.ts" | grep -v "use-translation.tsx"
```

Expected: 18 files.

- [ ] **Step 2: For each consumer file, optionally rename**

For each file:
1. Replace `import { useLanguage } from "@/hooks/use-language"` → `import { useTranslation } from "@/hooks/use-translation"`
2. Rename `useLanguage` → `useTranslation`
3. Rename destructured `language` → `locale`, `setLanguage` → `setLocale`, `availableLanguages` → `availableLocales`

Sample for `src/components/Sidebar.tsx`:
```typescript
// Before
import { useLanguage } from "@/hooks/use-language";
const { t, language, setLanguage } = useLanguage();

// After
import { useTranslation } from "@/hooks/use-translation";
const { t, locale, setLocale } = useTranslation();
```

- [ ] **Step 3: Verify no remaining old imports**

```bash
cd "C:/tss/tss-website"
grep -r "from .*use-language" src/ --include="*.tsx" --include="*.ts"
```

Expected: no matches.

- [ ] **Step 4: Verify TS compiles**

```bash
cd "C:/tss/tss-website"
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "useLanguage" | head -20
```

Expected: no errors.

- [ ] **Step 5: Commit (only if Step 2 was done)**

```bash
git add -A
git commit -m "refactor(i18n): rename useLanguage → useTranslation across consumers (optional cleanup)"
```

---

## Task 6: Update Providers.tsx (also optional — back-compat alias keeps old import working)

**Files:**
- Modify: `C:/tss/tss-website/src/components/Providers.tsx`

`Providers.tsx` imports `LanguageProvider` and mounts it. The new hook file does NOT export `LanguageProvider` (it exports `TranslationProvider`). So this single file MUST be updated, or the old `use-language.tsx` file must keep exporting `LanguageProvider`. Plan A picks the cleanest path: update Providers.tsx.

- [ ] **Step 1: Update the import**

Replace:
```typescript
import { LanguageProvider } from "@/hooks/use-language";
```

With:
```typescript
import { TranslationProvider } from "@/hooks/use-translation";
```

- [ ] **Step 2: Replace the JSX usage**

Replace all `<LanguageProvider>` and `</LanguageProvider>` with `<TranslationProvider>` and `</TranslationProvider>`.

- [ ] **Step 3: Verify TS compiles**

```bash
cd "C:/tss/tss-website"
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "Providers" | head -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Providers.tsx
git commit -m "refactor(i18n): mount TranslationProvider in app providers"
```

---

## Task 7: Delete obsolete files

**Files:**
- Delete: `C:/tss/tss-website/src/lib/translations.ts`
- Delete: `C:/tss/tss-website/src/lib/tss-website/src/lib/translations.ts`
- Delete: `C:/tss/tss-website/src/hooks/use-language.tsx`

- [ ] **Step 1: Verify no remaining imports**

```bash
cd "C:/tss/tss-website"
grep -r "from .*lib/translations" src/ --include="*.tsx" --include="*.ts"
grep -r "from .*use-language" src/ --include="*.tsx" --include="*.ts"
grep -r "BaseTranslations" src/ --include="*.tsx" --include="*.ts"
```

Expected: no matches.

- [ ] **Step 2: Delete the files**

```bash
rm "C:/tss/tss-website/src/lib/translations.ts"
rm "C:/tss/tss-website/src/lib/tss-website/src/lib/translations.ts"
rm "C:/tss/tss-website/src/hooks/use-language.tsx"
```

- [ ] **Step 3: Verify build still works**

```bash
cd "C:/tss/tss-website"
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -vE "brute-force|use-dev-projects|mfa|redis|resend|supabase-storage|supabase\.ts|middleware" | head -20
```

Expected: no NEW errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor(i18n): remove old monolithic translations.ts and dead stub"
```

---

## Task 8: Add parity check script

**Files:**
- Create: `C:/tss/tss-website/tools/check-i18n-parity.mjs`
- Modify: `C:/tss/tss-website/package.json`

- [ ] **Step 1: Write the parity check script**

File: `C:/tss/tss-website/tools/check-i18n-parity.mjs`

```javascript
#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = resolve(__dirname, "../src/locales");

function load(locale) {
  const path = resolve(messagesDir, `${locale}.json`);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    console.error(`✗ Failed to load ${locale}.json: ${e.message}`);
    process.exit(1);
  }
}

function collectKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...collectKeys(v, path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

const canonical = "pl";
const canonicalData = load(canonical);
const canonicalKeys = new Set(collectKeys(canonicalData));

const otherLocales = ["en", "de"];
let failed = false;

for (const locale of otherLocales) {
  const data = load(locale);
  const keys = new Set(collectKeys(data));
  const missing = [...canonicalKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !canonicalKeys.has(k));
  const empty = [...keys].filter((k) => {
    const value = k.split(".").reduce((o, p) => o?.[p], data);
    return typeof value !== "string" || value.trim().length === 0;
  });
  if (missing.length || extra.length || empty.length) {
    failed = true;
    console.error(`✗ ${locale}.json parity issues:`);
    if (missing.length) console.error(`    Missing keys: ${missing.join(", ")}`);
    if (extra.length) console.error(`    Extra keys:   ${extra.join(", ")}`);
    if (empty.length) console.error(`    Empty values: ${empty.join(", ")}`);
  } else {
    console.log(`✓ ${locale}.json parity OK (${keys.size} keys)`);
  }
}

if (failed) {
  process.exit(1);
}
console.log(`✓ All locales match ${canonical}.json (${canonicalKeys.size} keys).`);
```

- [ ] **Step 2: Run the parity check**

```bash
cd "C:/tss/tss-website"
node tools/check-i18n-parity.mjs
```

Expected:
```
✓ en.json parity OK (N keys)
✓ de.json parity OK (N keys)
✓ All locales match pl.json (N keys).
```

- [ ] **Step 3: Add the npm script**

In `C:/tss/tss-website/package.json`, add:
```json
"i18n:check": "node tools/check-i18n-parity.mjs"
```

And chain it into `"lint"`:
```json
"lint": "next lint && npm run i18n:check"
```

- [ ] **Step 4: Verify via npm run**

```bash
cd "C:/tss/tss-website"
npm run i18n:check
```

Expected: success.

- [ ] **Step 5: Commit**

```bash
git add tools/check-i18n-parity.mjs package.json
git commit -m "feat(i18n): add parity check script for all locales"
```

---

## Task 9: Write the contributor guide

**Files:**
- Create: `C:/tss/docs/i18n.md`

- [ ] **Step 1: Write the guide**

File: `C:/tss/docs/i18n.md`

```markdown
# i18n — Two Steps Studio

## Locales

Currently supported: **pl** (default), **en**, **de**.

## Directory layout

```
src/locales/
├── pl.json   # canonical (source of truth)
├── en.json
├── de.json
├── _types.ts # `Messages` type derived from pl.json
└── index.ts  # exports `loadMessages(locale)`, `Locale`, `LocaleMessages`
src/hooks/
└── use-translation.tsx   # `TranslationProvider` + `useTranslation()` hook
```

## Hook API

```typescript
const { t, locale, setLocale, availableLocales } = useTranslation();

// Object access (legacy, still works):
t.settings.title;

// Dot-path function access (preferred for new code):
t("settings.theme.dark");
```

## Adding a new translation key

1. Add the key to `src/locales/pl.json` (canonical).
2. Add the same key path to `en.json` and `de.json`.
3. Run `npm run i18n:check` — fails if any locale is missing the key.
4. Use it in a component: `const { t } = useTranslation(); t("nav.home")`.

The check script is wired into `npm run lint`.

## Adding a new locale

1. Copy `pl.json` to `<newlocale>.json`.
2. Translate every value.
3. Add `<newlocale>` to:
   - `Locale` union in `src/locales/index.ts`
   - `LOCALES` array in `src/locales/index.ts`
   - `loaders` map in `src/locales/index.ts`
4. Run `npm run i18n:check`.

## Persistence

Active language is stored in `localStorage` under the key `"tss-i18n-locale"`. SSR uses the default (`pl`). The mismatch is intentional — clients hydrate from localStorage on mount.

## Runtime loading

- `pl.json` is bundled into the main chunk (eager).
- `en.json` and `de.json` are split into separate webpack chunks and loaded on demand when the user switches language.
- `preloadLocale(locale)` can be called ahead of time (e.g., on hover of the language switcher) to warm the cache.
```

- [ ] **Step 2: Commit**

```bash
git add docs/i18n.md
git commit -m "docs(i18n): contributor guide for translations"
```

---

## Task 10: Final verification

- [ ] **Step 1: Run lint**

```bash
cd "C:/tss/tss-website"
npm run lint
```

Expected: passes (the `i18n:check` step runs as part of this).

- [ ] **Step 2: Run a build**

```bash
cd "C:/tss/tss-website"
npm run build 2>&1 | tail -30
```

Expected: builds successfully.

- [ ] **Step 3: Smoke test in dev server**

```bash
cd "C:/tss/tss-website"
npm run dev
```

In a browser:
- Open `/` — page renders in Polish.
- Click the language switcher in TopBar → choose EN → page text updates immediately.
- Switch to DE → page text updates.
- Refresh the page → language persists.
- Open `/ustawienia` — language switcher still works.

- [ ] **Step 4: Take screenshots**

Use Playwright to capture `/` in PL/EN/DE. Save to `docs/superpowers/plans/screenshots/plan-a/`.

- [ ] **Step 5: Final commit**

```bash
git status
git add -A
git commit -m "chore(i18n): plan A verification — screenshots and adjustments" --allow-empty
```

---

## Done When

- [ ] All 10 tasks green.
- [ ] `npm run i18n:check` exits 0.
- [ ] `npm run lint` exits 0.
- [ ] `npm run build` succeeds.
- [ ] Switching language in TopBar changes all already-translated pages.
- [ ] PR opened with Plan A scope. The next plan is Plan B (home-client.tsx).
