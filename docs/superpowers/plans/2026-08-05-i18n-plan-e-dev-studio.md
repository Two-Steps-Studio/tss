# Plan E — Translate /dev and /studio modules

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire every hardcoded user-facing string in the Developer panel (`/dev/*`) and Studio modules (`/studio/*`, plus `src/components/DEV/*` and `src/components/Electron/*` if they exist) to `useTranslation()`.

**Files in scope:**
- `C:/tss/tss-website/src/app/dev/**`
  - `dev/page.tsx`
  - `dev/projects/page.tsx`
  - `dev/files/page.tsx`
  - `dev/tasks/page.tsx`
  - `dev/description/page.tsx`
  - `dev/roadmap/page.tsx`
  - `dev/technology/page.tsx`
  - `dev/games/page.tsx`
  - `dev/music/page.tsx`
  - `dev/podcasts/page.tsx`
- `C:/tss/tss-website/src/app/studio/**`
- `C:/tss/tss-website/src/components/DEV/**`
- `C:/tss/tss-website/src/components/Projects/**`
- `C:/tss/tss-website/src/components/Electron/**`

---

## Task 1: Inventory dev/studio strings

- [ ] **Step 1: Run the audit per file**

---

## Task 2: Add namespaces

- [ ] **Step 1: Add `dev.*`, `studio.*`, `projects.*`, `electron.*` namespaces to all 3 locales**

- [ ] **Step 2: Verify parity**

```bash
cd "C:/tss/tss-website"
npm run i18n:check
```

- [ ] **Step 3: Commit**

```bash
git add src/locales/
git commit -m "feat(i18n): add dev/studio namespaces to pl/en/de locales"
```

---

## Task 3: Refactor each file

For each file in scope:
- [ ] Replace hardcoded strings
- [ ] Verify TS + lint after each batch
- [ ] Smoke test

Final commit:
```bash
git add -A
git commit -m "refactor(i18n): translate dev/studio modules in PL/EN/DE"
```

---

## Done When

- [ ] Every dev/studio page renders correctly in PL/EN/DE.
- [ ] `npm run i18n:check` and `npm run lint` pass.
- [ ] **Total i18n coverage milestone:** every user-facing string in `tss-website/src/**` resolves through `useTranslation()`.