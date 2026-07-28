import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

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

  try {
    // Get all integrations for current user
    const { data: integrations, error } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format integrations for frontend
    const formattedIntegrations = integrations?.map(integration => ({
      provider: integration.provider,
      username: integration.username,
      avatar: integration.avatar,
      connected: true,
      connectedAt: integration.created_at,
    })) || [];

    return NextResponse.json({
      integrations: formattedIntegrations,
    });
  } catch (error) {
    console.error("Failed to fetch integrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}
