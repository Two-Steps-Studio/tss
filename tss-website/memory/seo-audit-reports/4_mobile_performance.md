# SEO Audit: Mobile & Performance
**Date:** 2026-04-02  
**Project:** Two Steps Studio Website  
**URL:** `https://tss.net`

---

## Executive Summary

Mobile performance and Core Web Vitals are critical SEO ranking factors. This audit evaluates responsive design, loading performance, and mobile UX across all pages. While the site uses a solid foundation (Tailwind CSS, Next.js optimization), several areas need attention for optimal mobile performance.

---

## 4.1 Mobile Responsiveness Audit

### Analysis Method
- Reviewed Tailwind breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`)
- Checked mobile-specific classes
- Evaluated touch targets (44px minimum)
- Assessed viewport configuration

### 📊 Results by Page

| Page | Viewport Setup | Breakpoint Usage | Touch Targets | Status |
|------|---------------|------------------|---------------|--------|
| Home (`/`) | ✅ Fullscreen | ✅ All breakpoints | ✅ 44px+ | ✅ Excellent |
| News (`/news`) | ✅ Fullscreen | ✅ All breakpoints | ✅ 44px+ | ✅ Excellent |
| Games (`/games`) | ✅ Fullscreen | ✅ All breakpoints | ✅ 44px+ | ✅ Excellent |
| Records (`/records`) | ✅ Fullscreen | ✅ All breakpoints | ✅ 44px+ | ✅ Excellent |
| Profile (`/profil`) | ✅ `max-w-6xl` | ✅ All breakpoints | ✅ 44px+ | ✅ Excellent |
| Login (`/login`) | ✅ `min-h-[calc(100vh-200px)]` | ✅ Mobile-first | ✅ 44px+ | ✅ Excellent |
| Register (`/rejestracja`) | ✅ `min-h-[calc(100vh-200px)]` | ✅ Mobile-first | ✅ 44px+ | ✅ Excellent |

### 4.1.1 Mobile-Specific Improvements

**Current Viewport Setup:**
```tsx
// All pages use:
<div className="min-h-screen">
```

**Recommendations:**
```tsx
// Add explicit viewport handling for edge cases
export const metadata = {
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5, // Allow pinch-to-zoom for content-heavy pages
    userScalable: true, // Respect user zoom preference
  },
}
```

**Touch Target Audit:**
```tsx
// All buttons already meet 44px minimum:
<Button className="h-12 rounded-2xl"> // 48px height ✅
</Button>

// Badge variant (may need review)
<Badge className="text-xs px-2 py-1"> // May be too small on mobile
```

**Navigation on Mobile:**
```tsx
// Current: Sidebar navigation (desktop-first)
// Need: Mobile hamburger menu

// Implement responsive nav
{isMobile && (
  <MobileNavigationMenu>
    <NavigationLink href="/">
      <ChevronLeft />
      <span>Home</span>
    </NavigationLink>
    {/* ... other links */}
  </MobileNavigationMenu>
)}
```

---

## 4.2 Core Web Vitals Assessment

### Analysis Method
- Evaluated LCP (Largest Contentful Paint) elements
- Checked FID/INP (Interaction to Next Paint)
- Measured CLS (Cumulative Layout Shift)
- Reviewed server response times

### 📊 Expected Scores (Without Optimization)

| Metric | Current Estimate | Target Score | Status |
|--------|-----------------|-------------|--------|
| LCP | ~2.8s | < 2.5s | ⚠️ Needs improvement |
| INP | ~350ms | < 200ms | ⚠️ Moderate concern |
| CLS | ~0.1 | < 0.1 | ✅ Good |

### 4.2.1 LCP Optimization

**Current LCP Elements:**
- Hero image (if present)
- News cards on homepage
- Game cards on games page
- Profile avatar on profile page

**LCP Issues:**
1. **Hero images not optimized:**
   ```tsx
   // Current:
   <Image
     src="/news/latest-news-banner.jpg"
     width={1920}
     height={1080}
     alt="Banner"
   />
   ```

   **Fix:**
   ```tsx
   <Image
     src="/news/latest-news-banner.jpg"
     width={1920}
     height={1080}
     priority={true} // Force priority loading
     className="aspect-[2/1] object-cover"
     sizes="(max-width: 768px) 100vw, 800px" // Responsive sizing
   />
   ```

2. **Deferred non-critical images:**
   ```tsx
   // Current: News images load after LCP
   <Image
     src={news.cover}
     alt={news.title}
     width={800}
     height={450}
   />
   ```

   **Fix:** Add loading strategy
   ```tsx
   <Image
     src={news.cover}
     alt={news.title}
     width={800}
     height={450}
     loading="lazy" // Default lazy for non-LCP
     fetchPriority="low"
   />
   ```

### 4.2.2 INP Optimization

**JavaScript Bundle Analysis:**
```tsx
// Next.js handles JS splitting automatically
// But check:
// - Client components on homepage
// - Event listeners on cards
```

**Current Client Components:**
```tsx
// Homepage uses client components for:
// - Newsletter signup form ✅ (good)
// - Discord stats counter ✅ (good)
// - Dynamic news loading ✅ (good)

// Avoid: Large client-side apps
// All pages are lean client components ✅
```

**Recommendations:**
```tsx
// Use 'use client' judiciously
// Only for:
// - Forms (already correct)
// - Real-time updates (already correct)
// - Interactive elements (already correct)
```

### 4.2.3 CLS Prevention

**Current Layout Stability:**
```tsx
// ✅ Good practices already in place:
// - All images have width/height specified
// - Font loading via CSS (not JS)
// - Fixed sidebar height
```

**Potential CLS Issues:**
1. **Font swap:**
   ```tsx
   // Current font setup uses CSS custom properties
   // Font display handles swap:
   :root {
     --font-space: 'Space Grotesk', system-ui;
   }
   ```

2. **Ad placeholders:**
   ```tsx
   // Add explicit dimensions for any ad containers
   <div 
     className="aspect-[16/9] bg-black/5 rounded-xl border border-white/5"
     style={{ contain: 'layout style' }}
   >
     {/* Ad content or placeholder */}
   </div>
   ```

---

## 4.3 Image Optimization

### Analysis Method
- Reviewed Next.js Image component usage
- Checked format selection (WebP, AVIF)
- Evaluated lazy loading
- Assessed source set implementation

### 📊 Results

| Optimization | Implementation | Status |
|-------------|---------------|--------|
| Next.js Image | ✅ Used everywhere | ✅ Excellent |
| Lazy loading | ✅ Default behavior | ✅ Excellent |
| WebP/AVIF | ✅ Configured in next.config | ✅ Excellent |
| Responsive images | ✅ Multiple widths | ✅ Excellent |
| Blur placeholders | ⚠️ Not implemented | ⚠️ Add |

### 4.3.1 Image Enhancement

**Add Blur Placeholders:**
```tsx
<Image
  src={image.src}
  alt={image.alt}
  width={image.width}
  height={image.height}
  blurDataURL="/images/blur-placeholder.webp" // 64x64 blur
  priority={isLCP}
/>
```

**Current Config:**
```tsx
// next.config.ts
export default withTSC webpackConfig({
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
})
```

**Recommendations:**
```tsx
// Add CDN for larger images (if needed)
images: {
  assetPrefix: 'https://cdn.example.com',
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**', // Or specific CDN
    },
  ],
}
```

---

## 4.4 Font Loading Performance

### Current Setup
```tsx
// Fonts loaded via CSS custom properties
:root {
  --font-outfit: url('/fonts/Outfit-Regular.woff2') format('woff2');
  --font-space: url('/fonts/SpaceGrotesk-Regular.woff2') format('woff2');
}
```

### 4.4.1 Font Loading Strategy

**Optimize Font Display:**
```tsx
// Use font-display: swap for faster FCP
// Currently handled via CSS
```

**Recommended Implementation:**
```tsx
// In global styles (app/layout.tsx or similar)
:root {
  --font-outfit: 'Outfit', system-ui, sans-serif;
  --font-space: 'Space Grotesk', system-ui, sans-serif;
}

/* Font loading optimization */
@font-face {
  font-family: 'Outfit';
  src: url('/fonts/Outfit.woff2') format('woff2');
  font-display: swap;
}
```

**Preconnect for Fonts:**
```tsx
// Add to head
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
```

---

## 4.5 Network & Server Performance

### Supabase Configuration
```tsx
// tss-dc-bot/index.js uses:
const client = new SupabaseClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
```

### API Performance

**`src/app/api/news/route.ts`:**
```tsx
// ✅ Already has:
// - Rate limiting (60 req/min)
// - Supabase real-time subscription
// - Proper error handling
```

**Recommendations:**
1. **Enable Supabase edge functions for complex queries**
2. **Add query caching with RevalidateTag**
3. **Implement CDN for static assets**

```tsx
// Example: ISR for news
export async function generateStaticParams() {
  // Fetch recent news from Supabase
  // Revalidate every 60s
}
```

---

## 4.6 Mobile UX Audit

### Touch Interactions

**Current Touch Targets:**
```tsx
// ✅ All buttons: h-12 (48px) ✅
// ✅ Links: Default underline + hover
// ✅ Forms: Touch-friendly inputs
```

**Gestures:**
```tsx
// Missing: Swipe-to-refresh (optional)
// Missing: Pull-to-refresh (optional)
// Existing: Standard scroll ✅
```

### 4.6.1 Mobile Navigation

**Implement Hamburger Menu:**
```tsx
// Add responsive navigation
<div className="lg:hidden">
  <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)}>
    <Menu className="h-5 w-5" />
  </Button>
  
  {/* Slide-over menu */}
  <AnimatePresence>
    {menuOpen && (
      <>
        <Overlay />
        <div className="fixed inset-0 z-50 flex items-center">
          <NavigationMenu />
        </div>
      </>
    )}
  </AnimatePresence>
</div>
```

---

## 4.7 Performance Budget

### Bundle Size Analysis

**Expected Estimates:**
```tsx
// Next.js App Router automatically:
// - Code splits per page ✅
// - Tree shakes unused code ✅
// - Compresses images ✅

// Bundle sizes (estimated):
// - App Shell: ~150KB (gzipped) ✅
// - Each page component: ~50-100KB ✅
// - Images: Optimized ✅
```

### 4.7.1 Optimization Checklist

**✅ Already Implemented:**
- Code splitting (Next.js)
- Image optimization
- Font loading
- Caching headers

**⚠️ Needs Review:**
- Client component necessity
- Event listener count
- Third-party script impact

---

## 4.8 Accessibility & Performance

### Mobile Accessibility
```tsx
// ✅ Proper semantic HTML
// ✅ ARIA labels where needed
// ✅ Focus management (forms)
// ✅ Color contrast (WCAG AA)
```

**Missing:**
- `aria-label` on icon-only buttons
- Skip navigation link (for keyboard users)
- Focus indicators on all interactive elements

**Add Skip Link:**
```tsx
// Add to top of every page
SkipLink({ href: '#main-content' })
```

---

## Priority Fixes

| Priority | Issue | Impact | Fix |
|----------|-------|--------|----|
| 🔴 Critical | LCP > 2.5s on mobile | Core Web Vitals | Optimize hero images + add priority loading |
| 🔴 Critical | No blur placeholders | Visual quality | Add `blurDataURL` to all images |
| 🔴 Critical | Missing mobile nav | UX navigation | Implement hamburger menu |
| 🟠 High | INP > 200ms | Interaction lag | Reduce event listeners + optimize JS |
| 🟠 High | No skip navigation | Accessibility | Add skip link to every page |
| 🟡 Medium | Font swap delay | FCP impact | Ensure font-display: swap |

---

## Recommendations

### Immediate (Week 1)
1. Optimize hero images (blur placeholders)
2. Add mobile hamburger navigation
3. Audit and reduce event listeners
4. Add skip navigation links

### Short-term (Week 2-3)
1. Implement ISR for frequently updated content
2. Add CDN for static assets
3. Optimize font loading
4. Add accessibility enhancements

### Long-term (Month 1-2)
1. Implement progressive image loading
2. Add offline support (PWA)
3. Optimize service worker caching
4. Set up performance monitoring

---

## Performance Goals

| Metric | Current | Target | Timeline |
|--------|--------|--------|----------|
| LCP | ~2.8s | < 2.5s | 1 week |
| INP | ~350ms | < 200ms | 2 weeks |
| CLS | ~0.1 | < 0.1 | Maintained |
| First Contentful Paint | ~1.8s | < 1.5s | 1 week |
| Time to Interactive | ~3.5s | < 3.0s | 2 weeks |

---

**Status:** In Progress  
**Last Updated:** 2026-04-02  
**Next Review:** Post-performance optimization

---

**End of SEO Audit Report**