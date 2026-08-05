# Plan C — Translate navigation chrome

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire every hardcoded user-facing string in the navigation chrome (Sidebar, TopBar, Footer, BottomNavigation, MobileHeader) to `useTranslation()`. Empty-state strings go to a new `emptyStates` namespace.

**Files in scope:**
- `C:/tss/tss-website/src/components/Sidebar.tsx`
- `C:/tss/tss-website/src/components/TopBar.tsx`
- `C:/tss/tss-website/src/components/Footer.tsx` (if exists)
- `C:/tss/tss-website/src/components/BottomNavigation.tsx`
- `C:/tss/tss-website/src/components/MobileHeader.tsx` (if exists)

---

## Task 1: Inventory chrome strings

- [ ] **Step 1: Run the audit**

```bash
cd "C:/tss/tss-website"
grep -nE ">[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż]" src/components/Sidebar.tsx src/components/TopBar.tsx src/components/Footer.tsx src/components/BottomNavigation.tsx src/components/MobileHeader.tsx
```

Build a list of every distinct string with its file + line.

---

## Task 2: Add keys to locales

**Files:**
- Modify: `C:/tss/tss-website/src/locales/{pl,en,de}.json`

- [ ] **Step 1: Add `nav.*` keys**

Already partial. Extend as needed.

- [ ] **Step 2: Add `chrome.*` or appropriate namespace for misc chrome strings**

Pick a consistent namespace. Some prefer `common.*` for shared microcopy.

- [ ] **Step 3: Verify parity**

```bash
cd "C:/tss/tss-website"
npm run i18n:check
```

- [ ] **Step 4: Commit**

```bash
git add src/locales/
git commit -m "feat(i18n): add chrome nav namespaces to pl/en/de locales"
```

---

## Task 3: Refactor each chrome file

- [ ] **Step 1: Sidebar.tsx**

Replace hardcoded strings with `t.foo.bar` or `t("foo.bar")`.

- [ ] **Step 2: TopBar.tsx**

Same.

- [ ] **Step 3: Footer.tsx (if exists)**

Same.

- [ ] **Step 4: BottomNavigation.tsx**

Same.

- [ ] **Step 5: MobileHeader.tsx (if exists)**

Same.

- [ ] **Step 6: TS check**

```bash
cd "C:/tss/tss-website"
npx tsc --noEmit -p tsconfig.json
```

- [ ] **Step 7: Lint**

```bash
cd "C:/tss/tss-website"
npm run lint
```

- [ ] **Step 8: Smoke test**

Open every public page in PL/EN/DE — sidebar/topbar/footer labels update.

- [ ] **Step 9: Commit**

```bash
git add src/components/Sidebar.tsx src/components/TopBar.tsx src/components/Footer.tsx src/components/BottomNavigation.tsx src/components/MobileHeader.tsx
git commit -m "refactor(i18n): translate navigation chrome in PL/EN/DE"
```

---

## Done When

- [ ] All tasks green.
- [ ] Every nav element renders in PL/EN/DE correctly.
- [ ] `npm run i18n:check` and `npm run lint` pass.