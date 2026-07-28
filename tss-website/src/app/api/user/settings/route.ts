import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Settings service disabled" },
      { status: 503 }
    );
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("games_visible, records_visible, dev_visible, project_limit, joined_projects_limit, subscription_plan")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Profile error:", profileError);
    return NextResponse.json({ error: "Failed to fetch user settings: " + profileError.message }, { status: 500 });
  }

  if (!profile) {
    console.error("Profile not found for user:", user.id);
    // Create profile if it doesn't exist
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        games_visible: true,
        records_visible: true,
        dev_visible: false,
        project_limit: 1,
        joined_projects_limit: 3,
        subscription_plan: 'free',
      })
      .select()
      .single();

    if (createError || !newProfile) {
      return NextResponse.json({ error: "Profile not found and failed to create: " + createError?.message }, { status: 500 });
    }

    // Use the newly created profile
    profile = newProfile as any;
  }

  // Count current projects
  const { count: ownProjectsCount } = await supabase
    .from("dev_projects")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  // Count joined projects
  const { count: joinedProjectsCount } = await supabase
    .from("dev_project_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Calculate total accessible projects
  const totalProjects = (ownProjectsCount || 0) + (joinedProjectsCount || 0);

  // Default DEV visibility: OFF if user has no projects/permissions, ON if they have access
  let devVisible = profile.dev_visible;
  if (devVisible === null || devVisible === undefined) {
    // If not explicitly set, default based on project access
    devVisible = totalProjects > 0;
  }

  // Update profile if dev_visible needs to be set for the first time
  if (profile.dev_visible === null || profile.dev_visible === undefined) {
    await supabase
      .from("profiles")
      .update({ dev_visible: devVisible })
      .eq("id", user.id);
  }

  return NextResponse.json({
    visibility: {
      games: profile.games_visible ?? true,
      records: profile.records_visible ?? true,
      dev: devVisible,
    },
    limits: {
      own_projects: {
        current: ownProjectsCount || 0,
        limit: profile.project_limit || 1,
      },
      joined_projects: {
        current: joinedProjectsCount || 0,
        limit: profile.joined_projects_limit || 3,
      },
    },
    subscription: profile.subscription_plan || 'free',
  });
}

export async function PATCH(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Settings service disabled" },
      { status: 503 }
    );
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if profile exists, create if not
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!existingProfile) {
    // Create profile with default values
    const { error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        games_visible: true,
        records_visible: true,
        dev_visible: false,
        project_limit: 1,
        joined_projects_limit: 3,
        subscription_plan: 'free',
      });

    if (createError) {
      return NextResponse.json({ error: "Failed to create profile: " + createError.message }, { status: 500 });
    }
  }

  const body = await request.json();
  const { games_visible, records_visible, dev_visible, username } = body;

  const updateData: any = {};
  if (typeof games_visible === "boolean") updateData.games_visible = games_visible;
  if (typeof records_visible === "boolean") updateData.records_visible = records_visible;
  if (typeof dev_visible === "boolean") updateData.dev_visible = dev_visible;
  if (username && typeof username === "string") updateData.username = username;

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Profile not found after update" }, { status: 404 });
  }

  return NextResponse.json({
    visibility: {
      games: data.games_visible,
      records: data.records_visible,
      dev: data.dev_visible,
    },
  });
}
