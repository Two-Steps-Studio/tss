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

// --- Logging for security monitoring ---
const securityLog = (endpoint: string, action: string, user?: string, ip?: string, details?: string) => {
  const logEntry = `[${new Date().toISOString()}] [SECURITY] ${action} - ${endpoint} | User: ${user || 'N/A'} | IP: ${ip || 'N/A'}${details ? ` | ${details}` : ''}`;
  console.log(logEntry);
};

export async function middleware(request: NextRequest) {
  const ip = getClientIp(request);

  // Check request rate limit
  if (!checkRateLimit(ip)) {
    securityLog(request.url, "RATE_LIMIT_EXCEEDED", undefined, ip);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // Detect suspicious user agents
  const ua = request.headers.get("user-agent") || "";
  if (ua.includes("bot") || ua.includes("curl") || ua.includes("python")) {
    securityLog(request.url, "SUSPICIOUS_USER_AGENT", undefined, ip, `UA: ${ua}`);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
