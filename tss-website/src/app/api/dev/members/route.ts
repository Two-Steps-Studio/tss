import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { DevProjectMember, AddMemberData } from "@/lib/types/dev-types";

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

  // Get all members of the project
  const { data: members, error: membersError } = await supabase
    .from("dev_project_members")
    .select(`
      *,
      profiles!inner(
        id,
        username,
        avatar_url
      )
    `)
    .eq("project_id", projectId)
    .order("joined_at", { ascending: true });

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 500 });
  }

  // Transform data
  const transformedMembers = (members || []).map((member: any) => ({
    ...member,
    profiles: undefined,
    username: member.profiles?.username,
    avatar_url: member.profiles?.avatar_url,
  }));

  return NextResponse.json(transformedMembers);
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

  const body: AddMemberData = await request.json();
  const { project_id, user_id, role, permissions } = body;

  // Check if user is owner of the project
  const { data: project, error: projectError } = await supabase
    .from("dev_projects")
    .select("owner_id")
    .eq("id", project_id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.owner_id !== user.id) {
    return NextResponse.json({ error: "Only project owners can add members" }, { status: 403 });
  }

  // Check if user exists
  const { data: targetUser, error: targetUserError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user_id)
    .single();

  if (targetUserError || !targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Set default permissions based on role
  let defaultPermissions = permissions;
  if (!defaultPermissions) {
    switch (role) {
      case 'admin':
        defaultPermissions = {
          view_project: true,
          edit_project: true,
          manage_tasks: true,
          manage_kanban: true,
          manage_files: true,
          manage_description: true,
          manage_roadmap: true,
          manage_technologies: true,
          manage_members: true,
          manage_settings: true,
          delete_project: false
        };
        break;
      case 'developer':
        defaultPermissions = {
          view_project: true,
          edit_project: true,
          manage_tasks: true,
          manage_kanban: true,
          manage_roadmap: false,
          manage_files: true,
          manage_description: true,
          manage_technologies: true,
          manage_members: false,
          manage_settings: false,
          delete_project: false
        };
        break;
      case 'tester':
        defaultPermissions = {
          view_project: true,
          edit_project: false,
          manage_tasks: false,
          manage_kanban: false,
          manage_roadmap: true,
          manage_files: true,
          manage_description: false,
          manage_technologies: true,
          manage_members: false,
          manage_settings: false,
          delete_project: false
        };
        break;
      case 'viewer':
        defaultPermissions = {
          view_project: true,
          edit_project: false,
          manage_tasks: false,
          manage_kanban: false,
          manage_roadmap: true,
          manage_files: true,
          manage_description: false,
          manage_technologies: true,
          manage_members: false,
          manage_settings: false,
          delete_project: false
        };
        break;
      default:
        defaultPermissions = {
          view_project: true,
          edit_project: false,
          manage_tasks: false,
          manage_kanban: false,
          manage_roadmap: false,
          manage_files: false,
          manage_description: false,
          manage_technologies: false,
          manage_members: false,
          manage_settings: false,
          delete_project: false
        };
    }
  }

  const { data, error } = await supabase
    .from("dev_project_members")
    .insert({
      project_id,
      user_id,
      role,
      permissions: defaultPermissions,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
