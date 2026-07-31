import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { DevProjectInvite, CreateInviteData } from "@/lib/types/dev-types";

export async function GET(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev module disabled - contact administrator" },
      { status: 503 }
    );
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  // Check if user is owner or admin of the project
  const { data: project, error: projectError } = await supabase
    .from("dev_projects")
    .select("owner_id")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.owner_id !== user.id) {
    // Check if user is admin
    const { data: member } = await supabase
      .from("dev_project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!member || member.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Get all invites for the project
  const { data: invites, error: invitesError } = await supabase
    .from("dev_project_invites")
    .select(`
      *,
      profiles!inner(
        id,
        username,
        avatar_url
      )
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (invitesError) {
    return NextResponse.json({ error: invitesError.message }, { status: 500 });
  }

  // Transform data
  const transformedInvites = (invites || []).map((invite: any) => ({
    ...invite,
    profiles: undefined,
    invited_by_username: invite.profiles?.username,
    invited_by_avatar: invite.profiles?.avatar_url,
  }));

  return NextResponse.json(transformedInvites);
}

export async function POST(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev module disabled - contact administrator" },
      { status: 503 }
    );
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: CreateInviteData = await request.json();
  const { project_id, email, username, role, permissions, expires_in_hours = 168 } = body; // Default 7 days

  // SECURITY: Validate project_id is a number
  const projectIdNum = parseInt(project_id as any, 10);
  if (isNaN(projectIdNum) || projectIdNum <= 0) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  // SECURITY: Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // SECURITY: Validate role
  const validRoles = ['owner', 'admin', 'developer', 'tester', 'viewer'];
  if (role && !validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // SECURITY: Validate expires_in_hours
  if (expires_in_hours && (expires_in_hours < 1 || expires_in_hours > 720)) {
    return NextResponse.json({ error: "expires_in_hours must be between 1 and 720" }, { status: 400 });
  }

  // Check if user is owner of the project
  const { data: project, error: projectError } = await supabase
    .from("dev_projects")
    .select("owner_id")
    .eq("id", projectIdNum)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.owner_id !== user.id) {
    // Check if user is admin
    const { data: member } = await supabase
      .from("dev_project_members")
      .select("role")
      .eq("project_id", project_id)
      .eq("user_id", user.id)
      .single();

    if (!member || member.role !== 'admin') {
      return NextResponse.json({ error: "Only project owners and admins can send invites" }, { status: 403 });
    }
  }

  // Check if user already exists in project
  const { data: existingMember } = await supabase
    .from("dev_project_members")
    .select("user_id")
    .eq("project_id", projectIdNum)
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    return NextResponse.json({ error: "User is already a member of this project" }, { status: 400 });
  }

  // Check if there's already a pending invite
  const { data: existingInvite } = await supabase
    .from("dev_project_invites")
    .select("id")
    .eq("project_id", projectIdNum)
    .eq("email", email)
    .eq("status", "pending")
    .single();

  if (existingInvite) {
    return NextResponse.json({ error: "A pending invite already exists for this email" }, { status: 400 });
  }

  // Generate token
  const { data: tokenData } = await supabase.rpc('generate_invite_token');
  const token = tokenData;

  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expires_in_hours);

  // Set default permissions based on role
  let defaultPermissions = permissions;
  if (!defaultPermissions) {
    const { data: defaultPerms } = await supabase.rpc('get_default_permissions', { p_role: role });
    defaultPermissions = defaultPerms;
  }

  const { data, error } = await supabase
    .from("dev_project_invites")
    .insert({
      project_id: projectIdNum,
      email,
      username,
      invited_by: user.id,
      role,
      permissions: defaultPermissions,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the activity
  await supabase.rpc('log_dev_activity', {
    p_project_id: projectIdNum,
    p_user_id: user.id,
    p_action: 'invite_sent',
    p_entity_type: 'project_invite',
    p_entity_id: data.id,
    p_details: { email, role }
  });

  return NextResponse.json(data, { status: 201 });
}
