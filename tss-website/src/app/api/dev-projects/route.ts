import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { CreateProjectData, UpdateProjectData, DevProject } from "@/lib/types/dev-types";
import { logActivity } from "@/lib/dev-permissions";

export async function GET(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev projects disabled - contact administrator" },
      { status: 503 }
    );
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const includeArchived = searchParams.get("includeArchived") === "true";

  // Get projects where user is owner or member
  let query = supabase
    .from("dev_projects")
    .select(`
      *,
      dev_project_members!inner(
        user_id,
        role,
        permissions
      )
    `)
    .or(`owner_id.eq.${user.id},dev_project_members.user_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (!includeArchived) {
    query = query.eq("status", "active");
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform data to include user's role and permissions
  const projects = (data || []).map((project: any) => {
    const member = project.dev_project_members?.[0];
    return {
      ...project,
      dev_project_members: undefined,
      user_role: project.owner_id === user.id ? 'owner' : member?.role || 'viewer',
      user_permissions: project.owner_id === user.id 
        ? {
            view_project: true,
            edit_project: true,
            manage_tasks: true,
            manage_roadmap: true,
            manage_files: true,
            manage_description: true,
            manage_technologies: true,
            manage_members: true,
            delete_project: true
          }
        : member?.permissions || null
    };
  });

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev projects disabled - contact administrator" },
      { status: 503 }
    );
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: CreateProjectData = await request.json();
  const { name, description, description_markdown, color, planned_end_date } = body;

  // Check user's project limits
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("project_limit, joined_projects_limit")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }

  const projectLimit = profile.project_limit || 1;

  // Count current own projects
  const { count: ownProjectsCount, error: countError } = await supabase
    .from("dev_projects")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  if (countError) {
    return NextResponse.json({ error: "Failed to count projects" }, { status: 500 });
  }

  if (ownProjectsCount && ownProjectsCount >= projectLimit) {
    return NextResponse.json(
      {
        error: "Project limit reached",
        message: `You have reached your limit of ${projectLimit} own project(s). Upgrade your subscription to create more projects.`
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("dev_projects")
    .insert({
      owner_id: user.id,
      name,
      description,
      description_markdown,
      color: color || "#ffcb2f",
      status: "active",
      planned_end_date,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await logActivity(data.id, 'project_created', 'project', data.id, { name });

  return NextResponse.json(data, { status: 201 });
}
