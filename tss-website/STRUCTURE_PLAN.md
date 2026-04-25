# PLAN UPORZĄDKOWANIA PROJEKTU

## 🎯 Cele
- Zgrupowanie powiązanych komponentów
- Łatwiejsze utrzymanie kodu
- Standardowa strukturaNext.js

---

## 📊 Obecna struktura

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (nie uporządkowane)
│   ├── profil/            # Poszczególne pliki wewnątrz folderu
│   ├── powiadomienia/     # Poszczególne pliki wewnątrz folderu
│   ├── games/             # Single page
│   └── ...
├── components/
│   ├── ui/                # shadcn/ui components ✅
│   ├── install-pwa.tsx    # Powinien być w ui/
│   ├── home-site-stats.tsx# Powinien być w app/home/
│   └── ...
├── hooks/
│   ├── use-mobile.tsx     # Duplikat w src/lib/hooks/
│   ├── use-electron.tsx
│   ├── use-auth.tsx
│   ├── use-color-theme.tsx
│   ├── use-language.tsx
│   ├── use-sidebar.tsx
│   └── use-dev-settings.tsx
└── lib/
    ├── gamification.ts
    ├── storage.ts
    ├── theme-utilities.ts
    └── hooks/             # Duplikat hooks/
        └── use-mobile.tsx
```

---

## 🗂️ Proponowana nowa struktura

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (uporządkowane)
│   │   ├── admin/         # Admin endpoints grouped
│   │   ├── auth/          # Authentication endpoints
│   │   ├── avatars/       # Avatar endpoints
│   │   ├── beaty/         # Beauty endpoints
│   │   ├── dev-tasks/     # Dev tasks endpoints
│   │   ├── games/         # Games endpoints
│   │   ├── newsletter/    # Newsletter endpoints
│   │   ├── news/          # News endpoints
│   │   ├── shop/          # Shop endpoints
│   │   └── stripe/        # Stripe endpoints
│   ├── avatars/           # Static avatars (not API)
│   ├── beaty/             # Beauty page
│   ├── cod-analyzer/      # E-sport sub-page
│   ├── contacts/          # Kontakt page
│   ├── dev-tasks/        # Dev tasks page
│   ├── dev/               # Dev page
│   ├── e-sport/           # E-sport page
│   ├── games/             # Games page
│   ├── login/             # Login page
│   ├── news/              # News page
│   ├── profil/            # Profile page
│   ├── powiadomienia/     # Notifications page
│   ├── records/           # Records page
│   ├── rejestracja/       # Registration page
│   ├── regulations/       # Regulamin page
│   ├── rekrutacja/        # Recruitment page
│   └── ...
├── components/
│   ├── ui/                # ALL shadcn/ui + custom UI components
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── aspect-ratio.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button-group.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── command.tsx
│   │   ├── context-menu.tsx
│   │   ├── custom-cursor.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── empty.tsx
│   │   ├── field.tsx
│   │   ├── form.tsx
│   │   ├── hover-card.tsx
│   │   ├── input-group.tsx
│   │   ├── input-otp.tsx
│   │   ├── input.tsx
│   │   ├── item.tsx
│   │   ├── kbd.tsx
│   │   ├── label.tsx
│   │   ├── menubar.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── noise-overlay.tsx
│   │   ├── pagination.tsx
│   │   ├── popover.tsx
│   │   ├── radio-group.tsx
│   │   ├── resizable.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── sonner.tsx
│   │   ├── spinner.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toggle-group.tsx
│   │   ├── toggle.tsx
│   │   ├── tooltip.tsx
│   │   ├── progress.tsx
│   │   ├── switch.tsx
│   │   └── chart.tsx
│   ├── layout/            # Layout components
│   │   ├── AdminConsole.tsx
│   │   ├── ErrorReporter.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileHeader.tsx
│   │   ├── PWAController.tsx
│   │   ├── PageTransition.tsx
│   │   ├── PresencePing.tsx
│   │   ├── SidebarLayout.tsx
│   │   ├── ServiceWorkerRegister.tsx
│   │   ├── TopBar.tsx
│   │   ├── InstallPrompt.tsx
│   │   ├── newsletter-form.tsx
│   │   ├── install-pwa.tsx
│   │   └── VisualEditsMessenger.tsx
│   ├── features/          # Feature-based components
│   │   ├── discord-stats-live.tsx
│   │   ├── home-site-stats.tsx
│   │   ├── home-client.tsx
│   │   ├── home-hero.tsx
│   │   ├── news-feed.tsx
│   │   ├── online-chart.tsx
│   │   ├── presence-ping.tsx
│   │   └── OrganizationTree.tsx
│   ├── protected-route.tsx # Reusable HOC
│   └── protected-route-client.tsx # Client-side version
├── hooks/                 # Custom React hooks
│   ├── use-auth.tsx
│   ├── use-color-theme.tsx
│   ├── use-dev-settings.tsx
│   ├── use-electron.tsx
│   ├── use-language.tsx
│   ├── use-mobile.tsx     # Removed duplicate
│   └── use-sidebar.tsx
├── lib/                   # Utilities & helpers
│   ├── storage.ts
│   ├── theme-utilities.ts
│   ├── gamification.ts
│   └── types/             # Type definitions
│       └── index.ts       # Consolidated types
├── styles/                # Consolidated styles (new)
│   ├── globals.css        # Moved from src/app/
│   └── components.css     # Component-specific styles (new)
└── visual-edits/          # Visual edits component
```

---

## 📝 Krok po kroku

### Krok 1: Przenieś `install-pwa.tsx` do `ui/`
### Krok 2: Przenieś statyczne `avatars/`, `beaty/`, etc. do `app/`
### Krok 3: Zgrupuj API endpoints
### Krok 4: Przenieś `globals.css` do `styles/`
### Krok 5: Usuń duplikat `hooks/use-mobile.tsx`
### Krok 6: Stwórz `types/` folder z typami
### Krok 7: Zgrupuj feature components

---

## ⏱️ Szacowany czas

- **Krok 1-3**: 15 minut
- **Krok 4-7**: 30 minut
- **Testy**: 10 minut

**Łącznie**: ~55 minut
