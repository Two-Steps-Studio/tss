import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getDiscordUser, getDiscordAvatarUrl } from "@/lib/discord-oauth";

export async function POST(request: Request) {
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

  try {
    // Get existing Discord integration
    const { data: integration, error: integrationError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "discord")
      .maybeSingle();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: "Discord not connected" },
        { status: 400 }
      );
    }

    // Check if access token is expired
    if (integration.token_expires_at && new Date(integration.token_expires_at) < new Date()) {
      // TODO: Implement token refresh logic
      return NextResponse.json(
        { error: "Access token expired. Please reconnect Discord." },
        { status: 400 }
      );
    }

    // Fetch fresh Discord user data
    const discordUser = await getDiscordUser(integration.access_token);

    // Update integration with fresh data
    const { data: updatedIntegration, error: updateError } = await supabase
      .from("user_integrations")
      .update({
        username: discordUser.username,
        avatar: getDiscordAvatarUrl(discordUser.id, discordUser.avatar),
        metadata: {
          discriminator: discordUser.discriminator,
          email: discordUser.email,
          verified: discordUser.verified,
        },
      })
      .eq("id", integration.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      integration: updatedIntegration,
    });
  } catch (error) {
    console.error("Discord sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync Discord data" },
      { status: 500 }
    );
  }
}
