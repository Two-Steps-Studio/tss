import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// --- Rate Limiting & Security ---
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS = 100;
const WINDOW_MS = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now < record.resetTime) {
    if (record && record.count >= MAX_REQUESTS) {
      return false;
    }
    return true;
  }

  if (record && record.count >= MAX_REQUESTS) {
    return false;
  }

  rateLimitStore.set(ip, { count: record.count + 1, resetTime: record.resetTime });
  return true;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0] : request.socket?.remoteAddress || "unknown";
}

// --- Bot Detection & Protection ---
const BOT_PATTERNS = [
  /bot|crawler|spider|scraper/i,
  /curl|wget|python|ruby|perl|node\.js|java/i,
  /sqlmap|nikto|nuclei|nmap/i,
];

async function detectBot(request: NextRequest): Promise<{ isBot: boolean; botType: string | null }> {
  const ua = request.headers.get("user-agent") || "";

  // Check for bot patterns
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(ua)) {
      const match = ua.match(pattern);
      return { isBot: true, botType: match?.[0]?.replace(/\/gi/g, '') || 'unknown-bot' };
    }
  }

  // Check for suspicious header combinations
  const accept = request.headers.get("accept") || "";
  if (accept.includes('*/*') && !ua.includes('Mozilla')) {
    return { isBot: true, botType: 'suspicious-accept' };
  }

  return { isBot: false, botType: null };
}

function handleBotRequest(request: NextRequest, botType: string): NextResponse {
  // Log bot detection
  const ip = getClientIp(request);
  console.log(`[${new Date().toISOString()}] [BOT-DETECTION] Blocked: ${botType} from ${ip}`);

  // Rate limit for bots (stricter)
  if (rateLimitStore.has(ip) && rateLimitStore.get(ip)!.count >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // Block known attack tools immediately
  if (/sqlmap|nikto|nuclei/i.test(botType)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403, headers: { "X-Content-Type-Options": "nosniff" } }
    );
  }

  // Warn about scraper/crawler
  if (/crawler|scraper/i.test(botType)) {
    return NextResponse.json(
      { error: "Scraping is disabled on this site" },
      { status: 403 }
    );
  }

  // Allow basic user agents with "bot" in name (Googlebot, Bingbot, etc.)
  if (/googlebot|bingbot|baidu|yandex/i.test(botType)) {
    return NextResponse.next();
  }

  // Default: block unknown bots
  return NextResponse.json(
    { error: "Access denied" },
    { status: 403 }
  );
}

// --- Logging for security monitoring ---
const securityLog = (endpoint: string, action: string, user?: string, ip?: string, details?: string) => {
  const logEntry = `[${new Date().toISOString()}] [SECURITY] ${action} - ${endpoint} | User: ${user || 'N/A'} | IP: ${ip || 'N/A'}${details ? ` | ${details}` : ''}`;
  console.log(logEntry);
};

export async function middleware(request: NextRequest) {
  const ip = getClientIp(request);

  // Add secure headers
  const headers: HeadersInit = {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), camera=(), microphone=()",
    "Cache-Control": "public, max-age=31536000, stale-while-revalidate=31536000",
  };

  // Production: add HSTS
  if (process.env.NODE_ENV === "production") {
    headers["Strict-Transport-Security"] =
      "max-age=31536000; includeSubDomains; preload";
    headers["Content-Security-Policy"] =
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'none'; object-src 'none';";
  }

  // Apply security headers
  headers[
    "X-Download-Options"
  ] = "noopen";
  headers[
    "X-XSS-Protection"
  ] = "1; mode=block";
  headers[
    "X-Permitted-Cross-Domain-Policies"
  ] = "none";

  // Detect bots before rate limiting
  const botDetection = await detectBot(request);
  if (botDetection.isBot) {
    return handleBotRequest(request, botDetection.botType || '');
  }

  // Check request rate limit
  if (!checkRateLimit(ip)) {
    securityLog(request.url, "RATE_LIMIT_EXCEEDED", undefined, ip);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // Only create Supabase client if credentials exist
  let user = null;
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    user = (await supabase.auth.getUser()).data.user;
  }

  // Protected routes
  const protectedRoutes = ["/profil", "/ustawienia", "/powiadomienia"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Auth routes (redirect to profile if already logged in)
  const authRoutes = ["/login", "/rejestracja"];
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    securityLog(request.url, "UNAUTHORIZED_ACCESS", undefined, ip, `Attempted access to: ${request.nextUrl.pathname}`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/profil", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes - handled separately if needed, or included)
     * - manifest.webmanifest (PWA manifest)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$|manifest.webmanifest).*)",
  ],
};

// Register service worker at runtime
if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}
