import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { generateState, getDiscordAuthUrl } from "@/lib/discord-oauth";

export async function GET(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Integrations service disabled" },
      { status: 503 }
    );
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user already has Discord integration
  const { data: existingIntegration } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "discord")
    .maybeSingle();

  if (existingIntegration) {
    return NextResponse.json(
      { error: "Discord already connected" },
      { status: 400 }
    );
  }

  // Generate state for OAuth flow
  const state = generateState();

  // SECURITY: Store state in session/database for verification
  // For now, we'll pass it back to client to include in callback
  // In production, store in Redis or session with expiration

  // Generate Discord OAuth URL with state
  const authUrl = getDiscordAuthUrl(state);

  return NextResponse.json({
    authUrl,
    state,
  });
}
