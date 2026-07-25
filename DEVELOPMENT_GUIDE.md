# Development Guide

This guide covers development setup, debugging, build process, and deployment for the Two Steps Studio project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Development Setup](#development-setup)
- [Building the Project](#building-the-project)
- [Debugging](#debugging)
- [Deployment](#deployment)
- [Performance Optimization](#performance-optimization)
- [CI/CD](#cicd)

## Prerequisites

### Required Software

- **Node.js** 18+ ([Install](https://nodejs.org/))
- **npm** or **pnpm** package manager
- **Git** for version control
- **TypeScript** compiler (included with Node.js)

### Recommended Tools

- [Visual Studio Code](https://code.visualstudio.com/)
- [Node.js](https://nodejs.org/) (LTS version)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Supabase](https://supabase.com/) account
- [Electron](https://www.electronjs.org/) (for desktop app)

### Optional Tools

- [Vercel](https://vercel.com/) for deployment

## Environment Setup

### System Requirements

- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 2GB free space for dependencies
- **CPU**: 2+ cores recommended

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Kenikusss/tss
cd tss
```

#### 2. Install Dependencies

```bash
# Install website dependencies
cd .\tss-website
npm install

# Install bot dependencies
cd .\tss-dc-bot
npm install
```

#### 3. Configure Environment Variables

**Website (.env) in tss-website/**:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Authentication
AUTH_SECRET=your-generated-secret

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Optional: Email settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Bot (.env) in tss-dc-bot/**:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Discord Bot
DISCORD_TOKEN=your-bot-token-here
CLIENT_ID=your-discord-client-id
GUILD_ID=your-discord-guild-id
```

### First Time Setup

```bash
# Website setup
cd tss-website
npm run setup

# Bot setup
cd ../tss-dc-bot
npm run setup
```

## Development Setup

### Website Development

```bash
# Start web development server
npm run dev

# Start in Electron desktop mode
npm run electron:dev

# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm test
```

#### Development Server

```bash
# Port: 3000
npm run dev

# Access at: http://localhost:3000
```

#### Electron Desktop Development

```bash
# Launches Next.js server + Electron window
npm run electron:dev

# Automatically opens in your default browser when in web mode
# Opens Electron window in desktop mode
```

### Bot Development

```bash
# Start the bot
npm start

# Or directly
node index.js

# Check Discord Developer Portal for OAuth2 tokens
```

#### Bot Debug Mode

```bash
# Enable verbose logging
node --trace-warnings index.js

# Enable async stack traces
node --enable-source-maps index.js
```

## Building the Project

### Website Build

```bash
# Build for production
npm run build

# Build with analytics
npm run build:analytics

# Build for Electron desktop app
npm run build:electron

# Build for Windows
npm run electron:build:win

# Build for macOS
npm run electron:build:mac

# Build for Linux
npm run electron:build:linux
```

#### Build Output

Build files are in `.next/` directory:

```
.next/
├── static/        # Static assets
├── pages/         # Pages for client hydration
├── package.json   # Build config
└── build-manifest.json
```

### Bot Build

```bash
# The bot doesn't require a build step
# Just install dependencies and run

# For Electron desktop wrapper
npm run electron:build
```

### Docker Build

```bash
# Build Docker images
docker build -t tss-website .
docker build -t tss-bot .

# Run containers
docker run -p 3000:3000 tss-website
docker run -p 5871:5871 tss-bot
```

## Debugging

### Common Issues

#### 1. Build Fails

```bash
# Clear cache and rebuild
rm -rf .next
npm run build

# Check Node version
node --version
# Should be 18.x or higher
```

#### 2. Supabase Connection Error

```bash
# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Check Supabase project is active
# Go to https://supabase.com/dashboard
```

#### 3. Database Migration Issues

```bash
# Run migrations
npx supabase db push

# Or use Supabase dashboard to sync schema
```

#### 4. Electron App Won't Launch

```bash
# Clear build cache
rm -rf out

# Rebuild
npm run build:electron

# Verify Electron installation
npm list electron
```

### Debugging Tools

#### Chrome DevTools

```bash
# Enable debugging in production
npm run dev

# Access DevTools at:
# http://localhost:3000/__debug-toolbar
```

#### Bot Debugging

```bash
# Add debug command to bot
# /debug enable
# /debug disable
# /debug logs

# View logs
tail -f logs/bot.log
```

#### Supabase Debug

```typescript
// Enable Supabase logging
SupabaseLogger.init({
  level: 'debug',
  database: {
    event: true,
    query: true,
  },
});
```

### Console Errors

```bash
# Website console
npm run dev

# Bot console
npm start

# View logs
tail -f logs/
```

## Deployment

### Deployment Options

#### Vercel (Website)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd tss-website
vercel

# Or GitHub integration
# Connect repo to Vercel dashboard
# Automatic deployments on push
```

#### Docker

```bash
# Build and push Docker image
docker build -t tss-app .
docker push registry.example.com/tss-app

# Run in production
docker run -d \
  -p 3000:3000 \
  -e SUPABASE_URL=... \
  -e DISCORD_TOKEN=... \
  tss-app
```

#### Direct Deployment

```bash
# Deploy to shared hosting
npm run build
# Upload .next directory to hosting provider
# Configure reverse proxy for WebSocket support
```

### Production Environment

```env
# Production .env
NEXT_PUBLIC_SUPABASE_URL=production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=production_key
NODE_ENV=production
```

### Environment Variables for Production

#### Website Production

```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=prod_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_key
```

#### Bot Production

```env
NODE_ENV=production
SUPABASE_URL=prod_url
SUPABASE_SERVICE_ROLE_KEY=prod_key
DISCORD_TOKEN=prod_token
```

## Performance Optimization

### Website Optimization

```bash
# Image optimization
# Use Next.js Image component
<Image src="/image.jpg" alt="Example" />

# Code splitting
# Automatic with Next.js

# Caching
# Enable Vercel cache
```

### Bot Optimization

```typescript
// Rate limiting
const rateLimitStore = new Map();
const MAX_REQUESTS = 100;

// Connection pooling
const client = new SupabaseClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Async operations
const queue = await asyncQueue();
await queue.add(async () => {
  // Process task
});
```

### Monitoring

```bash
# Add analytics
npm install next-vitalsource

# Monitor performance
npm install vitalsource
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
```

### Automated Testing

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Additional Development Tasks

### Adding New Features

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Write Code**
   - Follow [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines
   - Write tests for new functionality
   - Update documentation

3. **Run Tests**
   ```bash
   npm test
   npm run lint
   ```

4. **Create Pull Request**
   - Fill out PR template
   - Reference related issues
   - Add screenshots for UI changes

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Database Management

```bash
# Run migrations
npx supabase migration up

# Backup database
npx supabase db dump -f backup.sql

# Restore database
npx supabase db restore -f backup.sql
```

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Discord.js Documentation](https://discord.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Electron Documentation](https://www.electronjs.org/docs)

## Support

For development-related questions:
- GitHub Issues
- Development discussions
- Community support channels

---

**Last Updated**: 2026-07-24
**Version**: BETA - 0.1V  
