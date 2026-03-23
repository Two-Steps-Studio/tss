import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const threshold = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { count: onlineSite } = await supabase
    .from("site_sessions")
    .select("session_id", { count: "exact", head: true })
    .gte("last_seen", threshold);

  const { count: onlineLogged } = await supabase
    .from("site_sessions")
    .select("session_id", { count: "exact", head: true })
    .gte("last_seen", threshold)
    .not("user_id", "is", null);

  const { count: onlineAnon } = await supabase
    .from("site_sessions")
    .select("session_id", { count: "exact", head: true })
    .gte("last_seen", threshold)
    .is("user_id", null);

  const { count: totalProfiles } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({
    online_site: onlineSite || 0,
    online_logged_in: onlineLogged || 0,
    online_anonymous: onlineAnon || 0,
    total_profiles: totalProfiles || 0,
  });
}
