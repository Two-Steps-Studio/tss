# Plan B — Migrate home-client.tsx off parallel dictionary

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the inline `t.pl/en/de` object in `src/components/home-client.tsx` with calls to the central `useTranslation()` hook, ensuring the home page renders identically in PL/EN/DE.

**Architecture:** Audit every string used in `home-client.tsx`, add missing keys to `src/locales/{pl,en,de}.json` under appropriate namespaces (likely extend `home` with a `hero`, `marquee`, `sections` sub-tree), then refactor the component.

---

## Task 1: Audit home-client.tsx strings

**Files:**
- Read: `C:/tss/tss-website/src/components/home-client.tsx`

- [ ] **Step 1: List every string used**

Identify each distinct hardcoded string, its location in the JSX, and which locale object key it currently maps to.

- [ ] **Step 2: Decide new namespaces**

Group the strings into `home.hero.*`, `home.marquee.*`, `home.sections.*`, etc. (or whatever fits best).

---

## Task 2: Add the keys to all 3 locales

**Files:**
- Modify: `C:/tss/tss-website/src/locales/pl.json`
- Modify: `C:/tss/tss-website/src/locales/en.json`
- Modify: `C:/tss/tss-website/src/locales/de.json`

- [ ] **Step 1: Add keys to pl.json under `home.*`**

- [ ] **Step 2: Add translated values to en.json**

- [ ] **Step 3: Add translated values to de.json**

- [ ] **Step 4: Verify parity**

```bash
cd "C:/tss/tss-website"
npm run i18n:check
```

Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add src/locales/
git commit -m "feat(i18n): add home-client namespaces to pl/en/de locales"
```

---

## Task 3: Refactor home-client.tsx

**Files:**
- Modify: `C:/tss/tss-website/src/components/home-client.tsx`

- [ ] **Step 1: Replace the inline `t` object**

Remove the inline `t = { pl: ..., en: ..., de: ... }`. Replace usage with `const { t } = useTranslation();` and access keys via `t("home.hero.title")` or `t.home.hero.title`.

- [ ] **Step 2: Verify TS compiles**

```bash
cd "C:/tss/tss-website"
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "home-client" | head -20
```

Expected: no errors.

- [ ] **Step 3: Smoke test**

Run `npm run dev`, open `/`, switch between PL/EN/DE — hero, marquee, and sections update correctly.

- [ ] **Step 4: Commit**

```bash
git add src/components/home-client.tsx
git commit -m "refactor(i18n): migrate home-client off inline parallel dictionary"
```

---

## Done When

- [ ] All tasks green.
- [ ] `npm run i18n:check` passes.
- [ ] Home page renders identically in PL/EN/DE.
- [ ] No inline `t` object remains in `home-client.tsx`.