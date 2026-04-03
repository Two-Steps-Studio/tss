# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo for **Two Steps Studio (TSS)**, containing:
1. **tss-website/** - Next.js 15 web application with Electron desktop wrapper
2. **tss-dc-bot/** - Discord.js bot for XP/leveling, economy, and events

Both projects share a Supabase database for user profiles, levels, and economy data.

## Project Structure

```
tss/
├── tss-website/          # Next.js 15 + Electron app
│   ├── src/
│   │   ├── app/         # App Router pages
│   │   ├── components/  # React components (ui/, Sidebar.tsx, etc.)
│   │   ├── lib/         # Utilities (supabase.ts, utils.ts)
│   │   └── hooks/       # Custom React hooks
│   ├── electron/        # Electron main process
│   └── next.config.ts
│
└── tss-dc-bot/          # Discord.js bot
    ├── index.js         # Main bot entry
    ├── profileGenerator.js  # Canvas-based profile cards
    ├── shop.js
    ├── events/
    └── fishing/
```

## Development Commands

### Website (tss-website/)

```bash
# Development (web mode)
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Electron desktop app (dev)
npm run electron:dev

# Electron desktop app (build)
npm run electron:build:win     # Windows
npm run electron:build:mac     # macOS
npm run electron:build:linux   # Linux
```

### Discord Bot (tss-dc-bot/)

```bash
# Start the bot
npm start
# or
node index.js
```

No build step required - runs directly with Node.js.

## Architecture

### Website Stack
- **Framework**: Next.js 15 with App Router
- **React**: Version 19
- **Styling**: Tailwind CSS v4 with custom theme system
- **UI Components**: shadcn/ui components in `src/components/ui/`
- **Auth**: Supabase Auth with middleware protection
- **Database**: Supabase (PostgreSQL)
- **Desktop**: Electron wrapper that runs Next.js server internally

### Theme System
The app uses a dynamic color theme system defined in `globals.css`:
- **General/Ocean**: `#1bbdbd` (default)
- **Games**: `#dc3545`
- **Records**: `#ad83f8`
- **Dev**: `#ffcb2f`
- **E-Sport**: `#06e402`

Themes are CSS custom properties applied via `.theme-*` classes.

### Protected Routes
The middleware (`src/middleware.ts`) protects:
- `/profil`, `/ustawienia`, `/powiadomienia` - require auth
- `/login`, `/rejestracja` - redirect to profile if already authenticated

### Discord Bot Architecture
- **Level System**: XP from messages (+2) and voice chat (+3/min)
- **Auto-roles**: Level-based role assignment (Level 1-100)
- **Economy**: Coins from messages (+1) and voice (+2/min)
- **Fishing**: AFK fishing system with gear and inventory
- **Events**: Community event creation and signup
- **Profile Cards**: Canvas-generated profile images synced with website

### Shared Data
Both projects use the same Supabase instance:
- User profiles, levels, XP
- Economy (coins, inventory)
- Fishing data
- Events

## Key Files

### Website
- `src/lib/supabase.ts` - Browser client with hardlink fallback
- `src/lib/supabase-server.ts` - Server component client
- `src/middleware.ts` - Auth route protection
- `electron/main.js` - Electron entry point
- `next.config.ts` - Config with Electron asset handling

### Bot
- `index.js` - Main entry, command handlers, voice XP tracking
- `profileGenerator.js` - Canvas profile image generation
- `shop.js` - Shop and inventory logic
- `events/events.js` - Event management
- `fishing/` - Fishing game mechanics

## Environment Variables

### Website
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Bot
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DISCORD_TOKEN`
- `CLIENT_ID`
- `GUILD_ID`

## Database Schema Notes

### Profiles table - każdy użytkownik ma własny balans w PLN
```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pln_balance DECIMAL(10,2) DEFAULT 0.00,  -- Balans w polskich złotych
ADD COLUMN IF NOT EXISTS vip_status BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS svip_status BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mvip_status BOOLEAN DEFAULT FALSE;
```

**Kurs wymiany:** 0,01 PLN = 10000 coinów (1 PLN = 10000000 coinów)

### Transactions log
```sql
CREATE TABLE IF NOT EXISTS pln_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    coin_amount BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Fishing gear progress
```sql
CREATE TABLE IF NOT EXISTS fishing_gear (
    user_id TEXT PRIMARY KEY REFERENCES profiles(discord_id),
    zylka INTEGER DEFAULT 0,
    kolowrotek INTEGER DEFAULT 0,
    haczyk INTEGER DEFAULT 0,
    przynet INTEGER DEFAULT 0,
    wedka INTEGER DEFAULT 0,
    zaneta INTEGER DEFAULT 0,
    lodz INTEGER DEFAULT 0,
    skrzynka INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Voice XP tracking
```sql
CREATE TABLE IF NOT EXISTS voice_sessions (
    user_id TEXT PRIMARY KEY REFERENCES profiles(discord_id),
    guild_id TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    xp_earned INTEGER DEFAULT 0
);
```

### PLN Currency Info
- **Pole w bazie:** `pln_balance DECIMAL(10,2)`
- **Kurs:** 0,01 PLN = 10000 coinów
- **Zastosowanie:** Saldo produktów sklepu, nagrody realno-pieniężne

## Notes

- The website can run in two modes: web (`npm run dev`) or desktop (`npm run electron:dev`)
- Electron mode sets `ELECTRON=true` which affects asset paths and image optimization
- The Supabase client has hardlink config as fallback for Turbopack issues
- Bot commands are registered guild-specific (not global)
- Profile cards use @napi-rs/canvas for image generation
- Polish language is used throughout the UI
