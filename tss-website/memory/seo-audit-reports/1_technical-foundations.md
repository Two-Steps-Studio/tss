 P# SEO Audit: Technical Foundations
**Date:** 2026-04-02  
**Project:** Two Steps Studio Website  
**URL:** `https://tss.net`

---

## Executive Summary

The website demonstrates a solid technical foundation with Next.js 15 (App Router), Tailwind CSS, and Supabase integration. However, critical gaps exist in SEO metadata implementation, sitemap/robots configuration, and structured data markup.

---

## 1.1 Core Web Vitals Foundation

### ✅ Strengths

- **Next.js 15 App Router**: Automatic code splitting, ISR, and static generation capabilities
- **Image Optimization**: Uses Next.js Image component (`/src/lib/image.ts`) with `next/image` optimization
- **Dynamic Font Loading**: Font loading via CSS custom properties with font-display handling
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`)

### ⚠️ Needs Improvement

- **No Lighthouse scores documented**: Requires actual measurement
- **No critical CSS inlining mentioned**: LCP optimization needed
- **No CDN caching strategy visible**: `next.config.ts` needs review for caching headers

---

## 1.2 Metadata & Structured Data

### ❌ Critical Gaps Identified

**Missing on ALL pages:**

1. **Page-Specific Meta Tags**
   ```html
   <!-- NOT IMPLEMENTED -->
   <meta name="description" content="">
   <meta property="og:description" content="">
   <meta property="twitter:description" content="">
   ```

2. **Canonical URLs**
   ```html
   <!-- NOT IMPLEMENTED -->
   <link rel="canonical" href="https://tss.net/page-path" />
   ```

3. **JSON-LD Structured Data**
   ```html
   <!-- NOT IMPLEMENTED -->
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "Organization",
     "name": "Two Steps Studio",
     "url": "https://tss.net",
     "logo": "..."
   }
   </script>
   ```

### 1.2.1 Homepage (`/`)

**Current State:**
- Uses `home-client.tsx` with dynamic content
- Newsletter signup section exists
- Discord stats display

**Required Metadata:**
```tsx
// Recommended implementation
const metadata = {
  title: 'Two Steps Studio — Oficjalna strona internetowa',
  description: 'Strona internetowa Two Steps Studio — platforma z beatmapami, grami, podcastami i statystykami. Dołącz do społeczności!',
  keywords: ['beatmapy', 'gracz', 'discord', 'muzyka', 'podcasty'],
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: 'https://tss.net',
    siteName: 'Two Steps Studio',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Two Steps Studio'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@two_stepstudio',
    creator: '@two_stepstudio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};
```

### 1.2.2 Profile Page (`/profil`)

**Current State:**
- User profile with Discord integration
- Level progression UI
- Role badges
- Statistics display

**Required Metadata:**
```tsx
const metadata = {
  title: 'Twój Profil — Two Steps Studio',
  description: 'Zarządzaj swoim profilem w Two Steps Studio. Zobacz swoją pozycję na tabelach, statystyki i role.',
  openGraph: {
    type: 'profile',
    images: [`/api/avatar/${user.discord_id}`],
  },
};
```

### 1.2.3 News Page (`/news`)

**Current State:**
- Fetches news from `/api/news`
- Displays news cards with timestamps
- Author badges for moderated posts

**Required Metadata:**
```tsx
const metadata = {
  title: 'Aktualności — Two Steps Studio',
  description: 'Ostatnie wiadomości, ogłoszenia i nowości ze Studia. Śledź nasze działania.',
  openGraph: {
    type: 'website',
  },
};
```

---

## 1.3 Sitemap & Robots.txt

### ❌ Missing Files

```bash
# These files do not exist:
# - sitemap.xml
# - sitemap.xml.bak (for deployments)
# - robots.txt
```

**Required Structure:**

**`robots.txt`:**
```txt
User-agent: *
Allow: /
Allow: /news
Allow: /games
Allow: /records
Allow: /profil
Disallow: /api/
Disallow: /login
Disallow: /rejestracja
Sitemap: https://tss.net/sitemap.xml
```

**`sitemap.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tss.net/</loc>
    <lastmod>2026-04-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://tss.net/news</loc>
    <lastmod>2026-04-02</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://tss.net/games</loc>
    <lastmod>2026-04-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Add generated dynamic URLs here -->
</urlset>
```

**Implementation Strategy:**

Use Next.js `sitemap.ts` with `next-sitemap` or custom middleware:

```ts
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tss.net'
  
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    // Add dynamic URLs from database
  ]
  
  return staticUrls
}
```

---

## 1.4 Performance Budget

### Current Configuration

**`next.config.ts`:**
```ts
const config = {
  output: 'export',
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [128, 256, 384, 640, 1280],
    formats: ['image/avif', 'image/webp'],
  },
}
```

**Issues:**
- ✅ Image optimization configured
- ✅ Multiple device sizes for responsive images
- ❌ No `images.maximumAcceptableCompression` setting
- ❌ No `images.remotePatterns` for CDN images
- ❌ Missing `assetPrefix` for CDN images

---

## 1.5 Server Configuration

### Supabase Integration

**`tss-dc-bot/index.js`** (Discord Bot)
- Uses `Discord.js` with Supabase database
- Event-driven architecture (ready)
- Requires: Rate limiting, connection pooling

**`src/app/api/news/route.ts`**
- Rate limit: `rateLimit({ windowMs: 60000, max: 60 })` ✅
- CORS: `next.config.ts` needs `headers()` configuration

---

## Priority Fixes

| Priority | Issue | Impact | Fix |
|----------|-------|--------|-----|
| 🔴 Critical | No meta descriptions on dynamic pages | Poor search ranking | Add `generateMetadata()` to all pages |
| 🔴 Critical | Missing sitemap.xml | Crawlability issues | Create `app/sitemap.ts` |
| 🔴 Critical | No robots.txt | Default blocking may occur | Create `public/robots.txt` |
| 🟠 High | No canonical URLs | Duplicate content risk | Add `<link rel="canonical">` |
| 🟠 High | Missing JSON-LD | No rich snippets | Add structured data |
| 🟡 Medium | Image lazy loading not verified | LCP issues | Audit with PageSpeed |

---

## Recommendations

1. **Immediate (Week 1):**
   - Generate meta descriptions for all routes
   - Deploy sitemap.xml and robots.txt
   - Add canonical URLs

2. **Short-term (Week 2-3):**
   - Implement JSON-LD on homepage and profile
   - Optimize hero images (LCP)
   - Set up CDN for images (Cloudflare)

3. **Long-term (Month 1-2):**
   - Monitor Core Web Vitals
   - Implement AMP for news (optional)
   - Set up server-side rendering for SEO-critical pages

---

**Status:** In Progress  
**Last Updated:** 2026-04-02  
**Next Review:** Post-migration audit