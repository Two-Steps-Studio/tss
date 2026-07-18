 import { NextRequest, NextResponse } from "next/server";

 // Rate limiting store
 const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
 const MAX_ADMIN_REQUESTS = 5;
 const WINDOW_MS = 60000;

 export async function POST(req: NextRequest) {
   // Check rate limit
   const ip = req.headers.get("x-forwarded-for") || "unknown";
   const now = Date.now();
   const record = rateLimitStore.get(ip);

   if (!record || now < record.resetTime) {
     if (record && record.count >= MAX_ADMIN_REQUESTS) {
       return NextResponse.json(
         { error: "Too many requests. Please wait before trying again." },
         { status: 429, headers: { "Retry-After": "60" } }
       );
     }
     rateLimitStore.set(ip, { count: record?.count || 0 + 1, resetTime: record?.resetTime || now + WINDOW_MS });
   } else if (record && record.count >= MAX_ADMIN_REQUESTS) {
     return NextResponse.json(
       { error: "Too many requests. Please wait before trying again." },
       { status: 429, headers: { "Retry-After": "60" } }
     );
   }

   try {
     const body = await req.json();
     const password = (body?.password as string) || "";
     const name = (body?.name as string) || "";
     const secret = process.env.ADMIN_CONSOLE_PASSWORD || "";
    const allowedUser = (process.env.ADMIN_CONSOLE_USER || "TwoStepsStudioAdmin").trim().toLowerCase();
     if (!secret) {
       return NextResponse.json({ error: "Brak konfiguracji hasła" }, { status: 500 });
     }
     if (!password || !name) {
       return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
     }
    if (name.trim().toLowerCase() !== allowedUser) {
      return NextResponse.json({ error: "Nieprawidłowa nazwa" }, { status: 401 });
    }
     if (password !== secret) {
       return NextResponse.json({ error: "Hasło nieprawidłowe" }, { status: 401 });
     }

     // Add debug headers if enabled
     let headers: HeadersInit = {};
     if (process.env.NODE_ENV === 'development' || process.env.DEBUG_MODE === 'true') {
       headers = {
         "X-Debug-Mode": "enabled",
         "X-Environment": process.env.NODE_ENV || 'unknown',
       };
     }

     return NextResponse.json({ ok: true }, headers);
   } catch {
     return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
   }
 }
