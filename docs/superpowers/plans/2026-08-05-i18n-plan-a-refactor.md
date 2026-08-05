# Plan A — i18n Architecture Refactor (no content change)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the monolithic `src/lib/translations.ts` into per-locale JSON files in `src/i18n/messages/`, wire up `useLanguage()` to load from the new location, delete the orphan stub and the dead file, and add a parity check script. Existing 21 consumers keep working unchanged.

**Architecture:** Move from a single hand-typed TS dictionary to per-locale JSON files (`pl.json`, `en.json`, `de.json`) under `src/i18n/messages/`, with a derived `BaseMessages` TypeScript type and a Node parity-check script. The `useLanguage()` hook keeps the same public API.

**Tech Stack:** Next.js 15, React 19, TypeScript, Node.js (for parity script).

**Scope constraint:** This plan does NOT add new translations. It only moves the existing ones. Plans B-E add content.

---

## File Structure

**Create:**
- `C:/tss/tss-website/src/i18n/messages/pl.json` — Polish locale (canonical)
- `C:/tss/tss-website/src/i18n/messages/en.json` — English locale
- `C:/tss/tss-website/src/i18n/messages/de.json` — German locale
- `C:/tss/tss-website/src/i18n/types.ts` — `BaseMessages` derived type
- `C:/tss/tss-website/src/i18n/loader.ts` — exports `messages` keyed by locale
- `C:/tss/tss-website/tools/check-i18n-parity.mjs` — assertion that all 3 locales have identical keys
- `C:/tss/docs/i18n.md` — contributor guide

**Modify:**
- `C:/tss/tss-website/src/hooks/use-language.tsx` — import from new loader, drop orphan locales
- `C:/tss/tss-website/package.json` — add `i18n:check` script

**Delete:**
- `C:/tss/tss-website/src/lib/translations.ts` — replaced by `src/i18n/`
- `C:/tss/tss-website/src/lib/tss-website/src/lib/translations.ts` — dead stub

---

## Task 1: Audit existing translations.ts

**Files:**
- Read: `C:/tss/tss-website/src/lib/translations.ts`

- [ ] **Step 1: Read the entire translations.ts file**

Confirm the 8 top-level keys: `settings`, `nav`, `sections`, `home`, `auth`, `profile`, `regulamin`, `rekrutacja`.

- [ ] **Step 2: Create a brief inventory note**

In your head (or on paper, your choice): list the keys that exist at each level. This is what `pl.json` shape will follow.

---

## Task 2: Create the JSON files (pl, en, de)

**Files:**
- Create: `C:/tss/tss-website/src/i18n/messages/pl.json`
- Create: `C:/tss/tss-website/src/i18n/messages/en.json`
- Create: `C:/tss/tss-website/src/i18n/messages/de.json`

- [ ] **Step 1: Generate pl.json from the existing PL section of translations.ts**

Run a quick mental scan to map:
- `translations.pl.settings` → `pl.json["settings"]`
- `translations.pl.nav` → `pl.json["nav"]`
- `translations.pl.sections` → `pl.json["sections"]`
- `translations.pl.home` → `pl.json["home"]`
- `translations.pl.auth` → `pl.json["auth"]`
- `translations.pl.profile` → `pl.json["profile"]`
- `translations.pl.regulamin` → `pl.json["regulamin"]`
- `translations.pl.rekrutacja` → `pl.json["rekrutacja"]`

Write the JSON file using the EXACT Polish strings from `translations.ts`. JSON does NOT support comments. JSON keys must be quoted with double quotes.

- [ ] **Step 2: Generate en.json from translations.en**

Same shape as pl.json. Same keys. English translations from `translations.ts`.

- [ ] **Step 3: Generate de.json from translations.de**

Same shape. German translations.

- [ ] **Step 4: Validate each file is valid JSON**

Open a terminal:
```bash
cd "C:/tss/tss-website"
node -e "JSON.parse(require('fs').readFileSync('src/i18n/messages/pl.json', 'utf8'))" && echo "pl.json OK"
node -e "JSON.parse(require('fs').readFileSync('src/i18n/messages/en.json', 'utf8'))" && echo "en.json OK"
node -e "JSON.parse(require('fs').readFileSync('src/i18n/messages/de.json', 'utf8'))" && echo "de.json OK"
```
Expected: 3 lines, each ending with "OK".

- [ ] **Step 5: Commit**

```bash
git add src/i18n/messages/
git commit -m "refactor(i18n): extract translations to per-locale JSON files"
```

---

## Task 3: Create the i18n types and loader

**Files:**
- Create: `C:/tss/tss-website/src/i18n/types.ts`
- Create: `C:/tss/tss-website/src/i18n/loader.ts`

- [ ] **Step 1: Write the types module**

File: `C:/tss/tss-website/src/i18n/types.ts`

```typescript
import type pl from "./messages/pl.json";

export type Messages = typeof pl;
export type Locale = "pl" | "en" | "de";
export const LOCALES: Locale[] = ["pl", "en", "de"];
export const DEFAULT_LOCALE: Locale = "pl";
```

Rationale: deriving `Locale` from `pl.json` keeps the source of truth in one place. Adding a new locale requires adding the JSON file and extending the union.

- [ ] **Step 2: Write the loader module**

File: `C:/tss/tss-website/src/i18n/loader.ts`

```typescript
import pl from "./messages/pl.json";
import en from "./messages/en.json";
import de from "./messages/de.json";
import type { Locale, Messages } from "./types";

export const messages: Record<Locale, Messages> = {
  pl,
  en,
  de,
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "C:/tss/tss-website"
npx tsc --noEmit -p tsconfig.json
```
Expected: same pre-existing errors as before — no NEW errors in `src/i18n/`.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/types.ts src/i18n/loader.ts
git commit -m "feat(i18n): add types and loader for per-locale messages"
```

---

## Task 4: Update use-language.tsx to use the new loader

**Files:**
- Modify: `C:/tss/tss-website/src/hooks/use-language.tsx`

- [ ] **Step 1: Replace the import**

Replace:
```typescript
import { translations, BaseTranslations } from "../lib/translations";
```

With:
```typescript
import { messages } from "../i18n/loader";
import { DEFAULT_LOCALE, LOCALES, type Locale, type Messages } from "../i18n/types";
```

- [ ] **Step 2: Update the type exports**

Replace:
```typescript
// Lista dostępnych języków (domyślnie: polski)
export type Language = keyof typeof translations;

// Lista domyślnych języków dla dropdown menu
export const defaultLanguages = ["pl", "en", "de", "ru", "es", "fr", "it"] as const;
```

With:
```typescript
// Locale definition stays compatible with the previous `Language` alias.
export type Language = Locale;
export type Languages = Messages;
export const defaultLanguages = LOCALES;
```

(Note: `BaseTranslations` is referenced by `addTranslation` and `importTranslations`. We will remove those next.)

- [ ] **Step 3: Update the context value**

Replace:
```typescript
const contextValue = {
  language,
  setLanguage,
  t: translations[language] || translations.pl,
  availableLanguages,
};
```

With:
```typescript
const availableLanguages = LOCALES;
const contextValue = {
  language,
  setLanguage,
  t: messages[language] || messages[DEFAULT_LOCALE],
  availableLanguages,
};
```

- [ ] **Step 4: Update the useEffect and availableLanguages**

Remove the trailing `const availableLanguages = Object.keys(translations) as Language[];` line (moved into the context value block above).

Update the `useEffect`:
```typescript
useEffect(() => {
  const savedLanguage = localStorage.getItem("language") as Locale | null;
  if (savedLanguage && savedLanguage in messages) {
    setLanguageState(savedLanguage);
  }
}, []);
```

- [ ] **Step 5: Remove the window-only helpers `addTranslation` and `importTranslations`**

These depended on `BaseTranslations` and the dynamic `__TSS_TRANSLATIONS__` window hack. They are unused in the current codebase (the `/tlumaczenia` page uses `LanguageSelect`'s `importTranslations` from a different export). Verify no usage:

```bash
cd "C:/tss/tss-website"
grep -R "useLanguage" src/ --include="*.tsx" --include="*.ts" | grep -E "addTranslation|importTranslations"
```

If there are no hits in `src/`, remove the two functions from `use-language.tsx`. If there ARE hits, keep them and re-export from a deprecated module instead — but this is unlikely given the survey.

Expected: no matches → delete both functions.

- [ ] **Step 6: Verify the file compiles**

```bash
cd "C:/tss/tss-website"
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "use-language|i18n" | head -20
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/use-language.tsx
git commit -m "refactor(i18n): point useLanguage at new per-locale loader"
```

---

## Task 5: Delete obsolete files

**Files:**
- Delete: `C:/tss/tss-website/src/lib/translations.ts`
- Delete: `C:/tss/tss-website/src/lib/tss-website/src/lib/translations.ts`

- [ ] **Step 1: Verify no remaining imports**

```bash
cd "C:/tss/tss-website"
grep -R "from .*lib/translations" src/ --include="*.tsx" --include="*.ts"
grep -R "from .*translations" src/ --include="*.tsx" --include="*.ts" | grep -v "use-language"
grep -R "BaseTranslations" src/ --include="*.tsx" --include="*.ts"
```

Expected: no matches. (The `useLanguage` import inside `use-language.tsx` is now from `../i18n/loader`, not `../lib/translations`.)

- [ ] **Step 2: Delete the files**

```bash
rm "C:/tss/tss-website/src/lib/translations.ts"
rm "C:/tss/tss-website/src/lib/tss-website/src/lib/translations.ts"
```

(The `C:/tss/tss-website/src/lib/tss-website/...` directory is now empty — that's fine; leaving the empty parent is OK. Optionally clean it up with `rm -rf` if it has no other contents.)

- [ ] **Step 3: Verify build still works**

```bash
cd "C:/tss/tss-website"
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -vE "brute-force|use-dev-projects|mfa|redis|resend|supabase-storage|supabase\.ts|middleware" | head -20
```
Expected: no NEW errors. (Pre-existing errors in unrelated files are acceptable; the design document lists them.)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor(i18n): remove old monolithic translations.ts and dead stub"
```

---

## Task 6: Add parity check script

**Files:**
- Create: `C:/tss/tss-website/tools/check-i18n-parity.mjs`
- Modify: `C:/tss/tss-website/package.json`

- [ ] **Step 1: Write the parity check script**

File: `C:/tss/tss-website/tools/check-i18n-parity.mjs`

```javascript
#!/usr/bin/env node
/**
 * i18n parity check.
 * Asserts that all locales in src/i18n/messages/ have the same key structure
 * as the canonical PL locale. Exits with code 1 on any mismatch.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = resolve(__dirname, "../src/i18n/messages");

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

Expected output:
```
✓ en.json parity OK (N keys)
✓ de.json parity OK (N keys)
✓ All locales match pl.json (N keys).
```
(where N is the total leaf count)

- [ ] **Step 3: Add the npm script**

In `C:/tss/tss-website/package.json`, find the `"scripts"` section and add:
```json
"i18n:check": "node tools/check-i18n-parity.mjs"
```

Also add to `"lint"` (after the existing `next lint` call):
```json
"lint": "next lint && npm run i18n:check"
```

(Or chain it. Pick whichever maintains the existing pattern.)

- [ ] **Step 4: Verify via npm run**

```bash
cd "C:/tss/tss-website"
npm run i18n:check
```
Expected: same success output as Step 2.

- [ ] **Step 5: Commit**

```bash
git add tools/check-i18n-parity.mjs package.json
git commit -m "feat(i18n): add parity check script for all locales"
```

---

## Task 7: Write the contributor guide

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
src/i18n/
├── messages/
│   ├── pl.json   # canonical (Polish is the source of truth)
│   ├── en.json
│   └── de.json
├── types.ts      # Locale union + Messages type derived from pl.json
└── loader.ts     # static import of all locales
```

## Adding a new translation key

1. Add the key to `src/i18n/messages/pl.json` (canonical).
2. Add the same key path to `en.json` and `de.json`.
3. Run `npm run i18n:check` — fails if any locale is missing the key.
4. Use it in a component: `const { t } = useLanguage(); t.nav.home`.

The check script is wired into `npm run lint`.

## Adding a new locale

1. Copy `pl.json` to `<newlocale>.json`.
2. Translate every value.
3. Add `<newlocale>` to the `Locale` union in `src/i18n/types.ts` and to `LOCALES`.
4. Add it to the loader map in `src/i18n/loader.ts`.
5. Run `npm run i18n:check`.

## Persistence

Active language is stored in `localStorage` under the key `"language"`. SSR uses the default (`pl`). The mismatch is intentional — clients hydrate from localStorage on mount.

## Adding languages via JSON import

The `/tlumaczenia` admin page lets administrators upload additional locale JSON files at runtime. These are stored in `window.__TSS_TRANSLATIONS__` and override the static load. They are **not** persisted across reloads by default.
```

- [ ] **Step 2: Commit**

```bash
git add docs/i18n.md
git commit -m "docs(i18n): contributor guide for translations"
```

---

## Task 8: Final verification

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
Expected: builds successfully (some pre-existing warnings are acceptable).

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
- Open `/dev` — page renders (Dev panel does not yet have translations — that's Plan E).

- [ ] **Step 4: Take screenshots**

Use Playwright to capture `/` in PL/EN/DE. Save to `docs/superpowers/plans/screenshots/plan-a/`. These confirm post-implementation parity.

- [ ] **Step 5: Final commit if any stray changes**

```bash
git status
git add -A
git commit -m "chore(i18n): plan A verification — screenshots and adjustments" --allow-empty
```

---

## Done When

- [ ] All 8 tasks green.
- [ ] `npm run i18n:check` exits 0.
- [ ] `npm run lint` exits 0.
- [ ] `npm run build` succeeds.
- [ ] Switching language in TopBar changes all already-translated pages.
- [ ] PR opened with Plan A scope. The next plan is Plan B (home-client.tsx).
