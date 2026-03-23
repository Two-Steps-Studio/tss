 import { NextResponse } from "next/server";
 
 export async function POST(req: Request) {
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
     return NextResponse.json({ ok: true });
   } catch {
     return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
   }
 }
