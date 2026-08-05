# Full i18n Coverage (PL/EN/DE) — Design Spec

**Date:** 2026-08-05
**Status:** DRAFT — awaiting user approval
**Author:** Claude (advisor mode)

## 1. Problem

The Two Steps Studio website (`tss-website/`) has a hand-rolled i18n system but only covers **~20-30% of the user-facing surface**. About 70-80% of UI strings remain hardcoded in PL/EN/DE, with the existing dictionary only really covering `settings`, `nav`, `home` (partially), `auth`, `profile`, `regulamin`, `rekrutacja`. The user wants full coverage in PL/EN/DE.

Additional structural problems identified by the codebase survey:

- **Orphan locales:** `ru`, `es`, `fr`, `it` are exported as `const` outside the main `translations` object. They are unreachable through `useLanguage()` because `availableLanguages = Object.keys(translations)`. **Risk.** If we add `ru/es/fr/it` to the main object, the type system will force us to translate every key in every language — currently the type comes from `BaseTranslations` (no `Language` key involvement).
- **Parallel inline dictionary:** `src/components/home-client.tsx` has its own `t.pl/en/de` shadowing the central system — incomplete migration.
- **Dead stub file:** `src/lib/tss-website/src/lib/translations.ts` contains only a `console.log` and a partial interface — leftover artifact.
- **Monolithic dictionary:** `src/lib/translations.ts` has 1168 lines. Type is hand-maintained (`BaseTranslations`) — easy to drift if extended.
- **localStorage-only persistence:** Active language is in `localStorage` only. No SSR-aware detection, no cookie, no URL segment.
- **No glossary / shared terms** — translators/style can drift.

## 2. Goals

1. Every user-facing string in `tss-website/src/**` resolves through `useLanguage()`.
2. PL/EN/DE all complete and parity-checked (a static test asserts every key has all three locales).
3. The dictionary is split into per-locale files (not one mega-file).
4. The orphan locales are either wired up properly OR removed from the surface (user choice: I recommend **remove** for now since YAGNI — we will only ever translate to PL/EN/DE per scope).
5. Existing `useLanguage()` API stays compatible for the 21 consumers.
6. No regressions in lint or build.

## 3. Non-Goals

- URL-segment locale routing (`/[locale]/...`) — out of scope, would force huge layout refactor.
- Server-side locale detection via cookies — out of scope (current is localStorage only; persisted on client).
- Translating `tss-dc-bot` (Discord bot) — out of scope per CLAUDE.md and the i18n survey.
- Translating email content, DB-stored strings, or user-generated content.
- Adding new languages beyond PL/EN/DE.

## 4. Architecture Decision

**Per-locale JSON files in `src/locales/`**, dynamically imported on demand.

```
src/locales/
├── pl.json         # canonical (source of truth)
├── en.json
├── de.json
└── index.ts        # exports `loadMessages(locale)` async + `LocaleMessages` type
src/hooks/
└── use-translation.tsx   # new hook with HYBRID API
```

### Why JSON not TS

- Easy to swap with a CMS / fetch later (YAGNI now, but the seam is free).
- Easier to diff translations.
- No risk of accidentally introducing JS logic in a translation file.
- Standard tooling (i18next, formatjs) all read JSON.

### Hook API — HYBRID

The new hook `useTranslation()` returns:

```ts
const { t, locale, setLocale, availableLocales } = useTranslation();

t.settings.title          // existing: object access (backward-compat for 21 consumers)
t("settings.theme.dark")  // new: dot-path function access (for new code)
```

- `t` works as both an object (proxy) and a function. Already-translated components keep working unchanged — none of the 21 consumers must be modified.
- Internally a small `lookupPath(obj, "settings.theme.dark")` function returns the value; the object proxy is built lazily using `Object.defineProperty` on the `t` returned object so `t.settings.title` resolves to the same value as `t("settings.title")`.

### Runtime

- `locale/index.ts` exports `loadMessages(locale) → Promise<LocaleMessages>` using `await import(\`./${locale}.json\`)` so each locale is its own webpack chunk. Switching language at runtime pre-caches the next locale if needed.
- For SSR, `useTranslation()` defaults to `pl` synchronously (we still import `pl.json` eagerly), then `useEffect` reads `localStorage` and triggers async load of the saved locale. No SSR mismatch because the first render is always the static PL bundle.
- The static `pl.json` is bundled into the main chunk; `en.json` and `de.json` are split out.

### Type safety

`LocaleMessages` is derived from `pl.json` literal via `import type pl from "./pl.json"` — TypeScript automatically infers the full nested shape. EN and DE are typed as `LocaleMessages` and a parity check fails the build if any key is missing or differs.

### Persistence

Active language in `localStorage` (key `"language"`). Default `pl`. Same as before.

### Old hook `useLanguage()`

`useLanguage()` is removed. The 21 consumers must be renamed to `useTranslation()`. (Variable rename, not API change — the object shape is identical.) This is a sweep task within Plan A.

## 5. Migration Strategy

**5 sequenced plans, each independently shippable:**

### Plan A — Architecture Refactor (no content change)

Split the monolithic `translations.ts` into per-locale JSON files. Keep the same interfaces. No new strings added. All 21 existing consumers keep working unchanged.

- Files: split `src/lib/translations.ts` → `src/i18n/messages/{pl,en,de}.json`
- Update `src/hooks/use-language.tsx` to import from new location
- Delete `src/lib/translations.ts`
- Delete orphan stub `src/lib/tss-website/src/lib/translations.ts`
- Add `tools/check-i18n-parity.mjs` and a `npm run i18n:check` script
- Removes `ru/es/fr/it` from `defaultLanguages` (they were never accessible anyway)

**Done when:** `npm run dev` boots, `/ustawienia` language switcher works, all 3 locales load.

### Plan B — Replace inline parallel dictionary in home-client.tsx

Migrate `src/components/home-client.tsx` (which has its own inline `t.pl/en/de` object) onto the central system.

- Audit: list every key used in `home-client.tsx` and ensure it's in the corresponding locale's JSON.
- Refactor `home-client.tsx` to use `useLanguage()`.
- If a hero-specific key doesn't exist in the central dict, add it under a new `home.hero` namespace.

**Done when:** `/` page renders identically in PL/EN/DE; switching language updates the hero/sections/marquee.

### Plan C — Navigation chrome: Sidebar, TopBar, Footer, BottomNavigation, MobileHeader

These are the visible shell of every page. High-impact, fixed set of files (~5 components).

- For each component: list every hardcoded string, categorize (label, action, placeholder, error), add to `nav`/`common` namespace, swap to `t.*`.
- Empty-state strings (e.g. "No projects") go into a small `emptyStates` namespace.

**Done when:** Switching language changes all chrome elements immediately.

### Plan D — Public content pages

Translate `/`, `/games`, `/records`, `/news`, `/kontakt`, `/regulamin`, `/rekrutacja`, `/pobierz`, `/profil`, `/admin`, `/privacy`, `/terms`.

- Bulk approach: one page at a time, grouped by directory.
- Add new namespaces as needed: `games`, `records`, `news`, `footer`, `pobierz`, `privacy`, `terms`.

**Done when:** Each public page renders correctly in all 3 locales.

### Plan E — Dev / Studio modules

Translate `/dev/*` and `/studio/*` (Sidebar Studio entry has these).

- Sub-pages: `/dev`, `/dev/projects`, `/dev/files`, `/dev/tasks`, `/dev/description`, `/dev/roadmap`, `/dev/technology`, `/dev/games`, `/dev/music`, `/dev/podcasts`, plus shared components in `src/components/DEV/`.

**Done when:** Every dev page renders in PL/EN/DE.

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Hand-typed `BaseMessages` drifts from JSON | Parity test (`tools/check-i18n-parity.mjs`) runs in `npm run i18n:check` and on `pre-commit` |
| Translating everything in one go is overwhelming | 5 sequenced plans; each can ship independently |
| Hardcoded strings hidden in dynamic data (e.g. file categories, error messages) | Code review checklist; `git grep` for `>[A-Za-z]` near JSX |
| LLM translations lose nuance | Use a clear, simple English base; mark `[BRAND]` tokens (e.g. "Two Steps Studio") that should not be translated |
| Plural forms / gender | Not handled in current system; out of scope. Strings avoid `{count, plural, ...}` for now |
| Markdown/HTML in translation strings | Current `description` page uses raw HTML injection — translations must avoid `<script>` etc. The translator is internal so this is acceptable risk for now |
| Performance: switching language re-renders whole tree | Current behavior — acceptable. If it becomes a problem, add `React.memo` later |
| `next-themes` SSR hydration mismatch on dark/light | Already handled; not in scope |

## 7. Testing

- **Parity test** (`tools/check-i18n-parity.mjs`): loads all 3 JSON files, asserts every key in `pl.json` exists in `en.json` and `de.json`, and that no extra keys exist. Run via `npm run i18n:check` and `pre-commit` hook.
- **Build:** `npm run build` must pass with all translations.
- **Lint:** `npm run lint` must pass.
- **Manual:** Playwright walk-through of each major page in each locale, switching language in TopBar.
- **Smoke:** `next build && next start`, hit `/`, `/ustawienia`, `/dev/projects`, `/dev/files`, `/dev/description`, `/games`, `/records`, `/kontakt` in each locale.

## 8. Rollout

Plans are executed in order A → B → C → D → E. Each plan ends with a green build + Playwright screenshot of the affected pages in PL/EN/DE committed to the PR. The PR is reviewed and merged before the next plan starts.

## 9. Acceptance Criteria

- `npm run i18n:check` exits 0.
- `npm run build` exits 0.
- `npm run lint` exits 0.
- Every page listed in Plan D/E renders correctly in PL/EN/DE.
- `useLanguage()` API unchanged.
- No `useLanguage()` consumer has to change (except `home-client.tsx` in Plan B).
- `defaultLanguages` is exactly `["pl", "en", "de"]`.
- `src/lib/translations.ts` and the orphan stub are deleted.
- Documentation added: `docs/i18n.md` explaining how to add a new key.

## 10. Open Questions

None. User answered: full coverage, PL/EN/DE, "architecturally do per-locale files, decide yourself".

## 11. Estimated Effort

- Plan A: ~1-2 hours
- Plan B: ~30-60 minutes
- Plan C: ~1-2 hours
- Plan D: ~3-5 hours (depends on number of strings)
- Plan E: ~3-5 hours

**Total: 8-13 hours.** Split across multiple sessions.
