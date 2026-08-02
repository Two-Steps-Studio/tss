import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { checkProjectMembership, checkProjectPermission, logActivity } from "@/lib/dev-permissions";

interface RouteParams {
  params: Promise<{ status: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev tasks disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  // Check if user has access to the project
  const membershipCheck = await checkProjectMembership(Number(projectId));
  if (!membershipCheck.hasAccess) {
    return NextResponse.json({ error: membershipCheck.error }, { status: 403 });
  }

  const { status } = await params;

  // Map API statuses to DB statuses (todo = pending, in_progress = in_progress, testing = testing, completed = completed)
  const statusMap: Record<string, string> = {
    todo: "pending",
    in_progress: "in_progress",
    testing: "testing",
    completed: "completed",
  };

  const dbStatus = statusMap[status] || status;

  const { data, error } = await supabase
    .from("dev_tasks")
    .select("*")
    .eq("project_id", Number(projectId))
    .eq("status", dbStatus)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return empty array if no tasks exist for this status
  return NextResponse.json(data || []);
}

export async function POST(request: Request, { params }: RouteParams) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev tasks disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { status } = await params;

  // Valid statuses only
  const validStatuses = ["todo", "in_progress", "testing", "completed"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const body = await request.json();
  const { title, description, priority = 0, estimated_hours = 0, created_by = null, project_id } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (!project_id) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  // Check if user has permission to manage tasks
  const permissionCheck = await checkProjectPermission(project_id, 'manage_tasks');
  if (!permissionCheck.hasAccess) {
    return NextResponse.json({ error: permissionCheck.error || "Insufficient permissions" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("dev_tasks")
    .insert({
      title: title.trim(),
      description: description || "",
      status,
      priority,
      estimated_hours,
      created_by,
      project_id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await logActivity(project_id, 'task_created', 'task', data?.id, { title });

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev tasks disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { status } = await params;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  // Get the task to check project_id and permissions
  const { data: existingTask } = await supabase
    .from("dev_tasks")
    .select("project_id, title")
    .eq("id", Number(id))
    .single();

  if (!existingTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // Check if user has permission to manage tasks
  const permissionCheck = await checkProjectPermission(existingTask.project_id, 'manage_tasks');
  if (!permissionCheck.hasAccess) {
    return NextResponse.json({ error: permissionCheck.error || "Insufficient permissions" }, { status: 403 });
  }

  const { error } = await supabase
    .from("dev_tasks")
    .delete()
    .eq("id", Number(id))
    .eq("status", status);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await logActivity(existingTask.project_id, 'task_deleted', 'task', Number(id), { title: existingTask.title });

  return NextResponse.json({ success: true });
}
