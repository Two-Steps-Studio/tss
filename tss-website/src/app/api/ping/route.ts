import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("site_session_id")?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await supabase
    .from("site_sessions")
    .upsert({
      session_id: sessionId,
      user_id: user?.id ?? null,
      last_seen: new Date().toISOString(),
    });

  await supabase
    .from("site_presence")
    .insert({
      session_id: sessionId,
      user_id: user?.id ?? null,
      seen_at: new Date().toISOString(),
    });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("site_session_id", sessionId, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });
  return res;
}
