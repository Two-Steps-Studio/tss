# Architecture Documentation

This document describes the architecture of the Two Steps Studio (TSS) system, covering the website application, Discord bot, and their integration through a shared Supabase backend.

## System Overview

```
┌─────────────────┐         ┌───────────────────┐
│   Web App       │◄───HTTP─►│      API         │
│ (Next.js 15)    │         │   Gateway         │
└────────┬────────┘         └─────────┬─────────┘
         │                            │
         │     ┌──────────────────────┘
         │     │
         ▼     ▼
┌─────────────────┐         ┌─────────────────┐
│  Discord Bot    │◄──WS────►│   Supabase     │
│ (Discord.js)    │         │   (PostgreSQL)  │
└─────────────────┘         └────────┬────────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │  Storage    │
                              │  (Buckets)  │
                              └─────────────┘
```

## Technology Stack

### Website (tss-website)

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 15 (App Router) | React framework with SSR/SSG |
| **Language** | TypeScript 5.9+ | Type-safe JavaScript |
| **UI** | React 19 + Tailwind CSS v4 | Component library and styling |
| **Components** | shadcn/ui + Radix UI | Accessible UI primitives |
| **State** | React Context + Server State | Global and component state |
| **Auth** | Supabase Auth | User authentication and sessions |
| **Database** | Supabase (PostgreSQL) | Data persistence |
| **Desktop** | Electron 35 | Desktop wrapper |

### Discord Bot (tss-dc-bot)

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Library** | Discord.js 14 | Discord API wrapper |
| **Language** | JavaScript | Bot logic |
| **Images** | @napi-rs/canvas | Profile card generation |
| **Database** | Supabase | Data storage |
| **Events** | Discord Webhook API | Community events |

### Shared Backend (Supabase)

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Database** | PostgreSQL | Primary data storage |
| **Auth** | Supabase Auth | Authentication |
| **Storage** | Supabase Storage | File uploads |
| **Realtime** | Supabase Realtime | Live updates |

## Data Flow Architecture

### User Interaction Flow

```
┌─────────────┐     HTTP/WS     ┌─────────────┐
│  User       │────────────────►│  App        │
│  Client     │                 │  (Next.js)  │
└─────────────┘                 └─────────────┘
                                   │
                                   │ API calls
                                   ▼
                    ┌─────────────────────────┐
                    │   Supabase API          │
                    │   (Rate Limiting)       │
                    └─────────────┬───────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│ Auth        │          │  Database   │          │  Storage     │
│ Service     │          │  Queries    │          │  Buckets     │
└─────────────┘          └─────────────┘          └─────────────┘
```

### Authentication Flow

1. **Registration/Login** → Supabase Auth API
2. **Session Creation** → Secure cookies set
3. **Protected Routes** → Middleware validation
4. **Admin Actions** → JWT verification

### Real-time Data Flow

```
┌─────────────┐     Webhook     ┌─────────────┐
│  Discord    │────────────────►│  Bot        │
│  Bot        │                 │  Handler    │
└─────────────┘                 └─────────────┘
                                   │
                                   │ Update
                                   ▼
                    ┌─────────────────────────┐
                    │   Supabase              │
                    │   Database Update       │
                    └─────────────────────────┘
                                   │
                                   │ Broadcast
                                   ▼
                    ┌─────────────────────────┐
                    │  Realtime Subscription  │
                    │  to affected tables     │
                    └─────────────────────────┘
```

## Database Schema

### Core Tables

#### profiles
User profile information and game stats:
- `id` (UUID, primary key)
- `discord_id` (TEXT)
- `username` (TEXT)
- `xp` (INTEGER)
- `level` (INTEGER)
- `money` (DECIMAL)
- `bank` (DECIMAL)
- `background` (TEXT)
- `pln_balance` (DECIMAL) - PLN currency balance
- `vip_status`, `svip_status`, `mvip_status` (BOOLEAN)
- `updated_at` (TIMESTAMP)

#### discord_stats
Server statistics:
- `online_users`
- `active_channels`
- `member_count`
- `site_accounts`
- `messages_today`
- `recorded_at`

#### fishing_gear
User fishing equipment:
- `user_id` (TEXT, references profiles.discord_id)
- `zylka`, `kolowrotek`, `haczyk`, `przyneta` (INTEGER)
- `wedka`, `zaneta`, `lodz`, `skrzynka` (INTEGER)

#### pln_transactions
Currency transaction log:
- `user_id` (references profiles.id)
- `amount`, `coin_amount` (DECIMAL/BIGINT)
- `type` (deposit/withdrawal)
- `description`
- `created_at`

### Relationship Diagram

```
┌─────────────┐         ┌─────────────┐
│ profiles     │         │ discord_stats│
├─────────────┤         ├─────────────┤
│ ── id ──────┼────────► │ ── site_accounts│
│     │       │         ├─────────────┤
│     │       │         │  ── member_count│
│ ── discord_id ────┼──►│         │
│         │       │         │  ── online_users│
│ ── id ───────────►│   │         │  ── active_channels│
└─────────────┘     │ └─────────────┘
        │           │
        │           ▼
        │    ┌─────────────┐
        └────►│ fishing_gear│
              │ ── user_id │
              └─────────────┘
```

## Component Architecture

### Website Component Tree

```
src/
└── app/
    ├── layout.tsx          # Root layout
    ├── page.tsx            # Home page
    ├── login/              # Login page
    ├── rejestracja/        # Registration page
    ├── profil/             # User profile
    │   ├── page.tsx        # Profile page
    │   ├── [userId]/      # Specific user profile
    │   └── ...
    ├── ustawienia/         # Settings
    ├── powiadomienia/      # Notifications
    ├── shop/               # Shop pages
    └── admin/              # Admin dashboard
```

### Bot Event Handling

```
index.js:
├── interactionCreate       # Command handling
├── voiceStateUpdate        # Voice channel events
├── messageCreate           # Text leveling
├── guildMemberAdd          # Welcome messages
└── error                   # Error handling
```

## API Architecture

### REST API Structure

```
/api/
├── auth/                    # Authentication endpoints
├── shop/                    # Shop endpoints
├── news/                    # News feed
├── avatars/                 # Avatar upload
├── admin/                   # Admin commands
└── ...
```

### Rate Limiting Strategy

- **In-memory** rate limiter (60 second window, 100 requests max)
- **IP-based** tracking
- **Suspicious UA** detection (bot, curl, python)
- **Reset on deployment** (planned: Redis integration)

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────┐
│  Layer 1: Network Level             │
│  - Rate limiting (middleware)       │
│  - IP blocking                       │
│  - Suspicious UA detection          │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Layer 2: Application Level         │
│  - Input validation (Zod)           │
│  - Auth checks (middleware)         │
│  - Protected routes                 │
│  - XSS prevention                   │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Layer 3: Data Level                │
│  - Row-level security (RLS)         │
│  - Secure file storage              │
│  - Encrypted secrets                │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Layer 4: Infrastructure            │
│  - CSP headers                      │
│  - HTTPS only                      │
│  - Secure cookies                   │
└─────────────────────────────────────┘
```

## Deployment Architecture

### Monorepo Structure

```
tss/
├── tss-website/            # Can be deployed independently
│   ├── src/
│   ├── next.config.ts
│   └── package.json
│
└── tss-dc-bot/             # Can be deployed separately
    ├── index.js
    └── package.json
```

### Deployment Options

1. **Vercel** - For Next.js app
   - Automatic deployments from Git
   - Built-in rate limiting
   - Serverless functions

2. **AWS/DigitalOcean** - For hosting
   - Node.js containers
   - Database via Supabase

3. **Docker** - Containerization
   - `Dockerfile` for each project
   - Multi-stage builds

## Performance Architecture

### Optimization Strategies

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic with Next.js
- **Caching**: Redis for API responses
- **Database Indexing**: On user_id, discord_id columns
- **CDN**: Vercel Edge Network

### Scalability Considerations

- Stateless application design
- Database connections via connection pool
- WebSocket connection limits (10000)
- Supabase realtime subscriptions

## Future Architecture

### Planned Enhancements

1. **Redis Integration**
   - Persistent rate limiting
   - Session caching
   - Real-time pub/sub

2. **Message Queue**
   - RabbitMQ for async tasks
   - Email processing
   - Webhook queue

3. **Microservices**
   - Separate auth service
   - Game logic service
   - Notification service

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-13 | Initial architecture documentation |

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Discord.js Documentation](https://discord.js.org/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
