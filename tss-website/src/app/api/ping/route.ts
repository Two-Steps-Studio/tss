import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("site_session_id")?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }

  // Don't use Supabase in API routes - just respond with OK
  const res = NextResponse.json({ ok: true });
  res.cookies.set("site_session_id", sessionId, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });
  return res;
}
