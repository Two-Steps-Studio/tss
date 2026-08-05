# Plan D — Translate public content pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire every hardcoded user-facing string on the public-facing pages (home, games, records, news, profile, admin, pobierz, privacy, terms, kontakt, regulamin, rekrutacja) to `useTranslation()`.

**Files in scope:**
- `C:/tss/tss-website/src/app/page.tsx` and any sub-files in `src/app/` not yet migrated
- `C:/tss/tss-website/src/app/games/**`
- `C:/tss/tss-website/src/app/records/**`
- `C:/tss/tss-website/src/app/news/**`
- `C:/tss/tss-website/src/app/profil/**`
- `C:/tss/tss-website/src/app/admin/**`
- `C:/tss/tss-website/src/app/pobierz/**`
- `C:/tss/tss-website/src/app/privacy/**`
- `C:/tss/tss-website/src/app/terms/**`
- `C:/tss/tss-website/src/app/kontakt/**`
- `C:/tss/tss-website/src/app/regulamin/**`
- `C:/tss/tss-website/src/app/rekrutacja/**`
- `C:/tss/tss-website/src/app/loading.tsx`
- Shared components referenced by these pages (e.g., newsletter-form, news-feed, install-pwa, home-site-stats, discord-stats-live, Rating.tsx, game-category-card.tsx, Projects/*)

---

## Task 1: Inventory public-page strings

- [ ] **Step 1: Run the audit per page**

For each file in scope, list every user-facing string.

---

## Task 2: Add namespaces to locales

- [ ] **Step 1: Add keys under appropriate namespaces (`games.*`, `records.*`, `news.*`, `profile.*`, `admin.*`, `pobierz.*`, `privacy.*`, `terms.*`, `contact.*`, `regulamin.*`, `rekrutacja.*`, `home.footer.*`)**

- [ ] **Step 2: Verify parity**

```bash
cd "C:/tss/tss-website"
npm run i18n:check
```

- [ ] **Step 3: Commit**

```bash
git add src/locales/
git commit -m "feat(i18n): add public-page namespaces to pl/en/de locales"
```

---

## Task 3: Refactor each page

For each file in scope:
- [ ] Replace hardcoded strings with `t.*` or `t("...")`
- [ ] Verify TS compiles after each batch
- [ ] Smoke test in browser

Final commit:
```bash
git add -A
git commit -m "refactor(i18n): translate public content pages in PL/EN/DE"
```

---

## Done When

- [ ] Every public page renders correctly in PL/EN/DE.
- [ ] `npm run i18n:check` and `npm run lint` pass.