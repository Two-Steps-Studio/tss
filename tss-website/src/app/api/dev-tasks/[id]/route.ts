import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { checkProjectPermission, checkProjectMembership, logActivity } from "@/lib/dev-permissions";

interface RouteParams {
  params: Promise<{ id: string }>;
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

  const { id } = await params;

  const { data, error } = await supabase
    .from("dev_tasks")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // Check if user has access to the project
  const membershipCheck = await checkProjectMembership(data.project_id);
  if (!membershipCheck.hasAccess) {
    return NextResponse.json({ error: membershipCheck.error }, { status: 403 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev tasks disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { id } = await params;

  // Get the task to check project_id and permissions
  const { data: existingTask } = await supabase
    .from("dev_tasks")
    .select("project_id, title, status")
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

  const body = await request.json();
  const { title, description, status, priority, tags, due_date, assignee_name, estimated_hours, progress_percent } = body;

  const validStatuses = ["todo", "in_progress", "testing", "completed"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const validPriorities = ["low", "medium", "high", "critical"];
  if (priority && !validPriorities.includes(priority)) {
    return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("dev_tasks")
    .update({
      title: title?.trim() || title,
      description,
      status,
      priority,
      tags,
      due_date,
      assignee_name,
      estimated_hours,
      progress_percent,
    })
    .eq("id", Number(id))
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  const action = status && status !== existingTask.status ? 'task_status_changed' : 'task_updated';
  await logActivity(existingTask.project_id, action, 'task', Number(id), { title: existingTask.title });

  return NextResponse.json(data);
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

  const { id } = await params;

  // Get the task to check project_id and permissions
  const { data: existingTask } = await supabase
    .from("dev_tasks")
    .select("project_id, title, status")
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
    .eq("id", Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await logActivity(existingTask.project_id, 'task_deleted', 'task', Number(id), { title: existingTask.title });

  return NextResponse.json({ success: true });
}
