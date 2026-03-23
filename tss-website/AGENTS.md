## Project Summary
Two Steps Studio is a multi-purpose creative hub website focusing on game development, e-sports, music records (podcasts/beats), and software development. The project aims to provide a unified platform for tracking projects, events, and community engagement.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS, Framer Motion, Radix UI
- **Auth**: Supabase Auth (default)
- **Runtime**: Bun

## Architecture
- `src/app`: Page routes and API endpoints
- `src/components`: Reusable UI components (including `src/components/ui` for shadcn)
- `src/db`: Database schema and migration files
- `src/lib`: Core utility functions, clients (Supabase), and shared logic
- `src/hooks`: Custom React hooks and context providers (e.g., sidebar, theme, language)

## User Preferences
- Use Polish language for main content (implied by previous interactions)
- Use "Główne" and other descriptive names for assets folder structure
- Prefer functional components and modern React patterns

## Project Guidelines
- **UI Aesthetic**: High-end modern look using noise texture overlays, advanced glassmorphism (20px blur), and floating components.
- **Components**: Sidebar and TopBar are floating/glass-based. Sidebar uses active route glowing indicators.
- **Layouts**: Use Bento Grid for category displays and animated marquees for dynamic content.
- **Animations**: Use Framer Motion for page transitions (scale + fade) and micro-interactions on cards and buttons.
- No comments unless explicitly requested.
- Maintain consistency with existing file naming conventions.
- Always use Supabase for database and authentication tasks.

## Common Patterns
- Supabase client usage via `src/lib/supabase.ts`
- Centralized schema definition in `src/db/schema.sql`
- Translation system via `src/hooks/use-language.tsx` and `src/lib/translations.ts`
