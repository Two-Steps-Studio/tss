import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

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
  const body = await request.json();

  const {
    title,
    description,
    status,
    assigned_to,
    priority,
    tags,
    due_date,
    estimated_hours,
    actual_hours,
    completed_at,
    custom_fields,
    project_id,
  } = body;

  const updateData: any = {};

  if (title !== undefined) updateData.title = title?.trim() || title;
  if (description !== undefined) updateData.description = description || "";
  if (status) {
    const validStatuses = ["pending", "in_progress", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updateData.status = status;
  }
  if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
  if (priority !== undefined) updateData.priority = priority;
  if (tags) updateData.tags = tags;
  if (due_date) updateData.due_date = due_date;
  if (estimated_hours !== undefined) updateData.estimated_hours = estimated_hours;
  if (actual_hours !== undefined) updateData.actual_hours = actual_hours;
  if (completed_at !== undefined) updateData.completed_at = completed_at;
  if (custom_fields) updateData.custom_fields = custom_fields;
  if (project_id !== undefined) updateData.project_id = project_id;

  // Jeśli status jest 'completed', ustaw completed_at
  if (status === "completed" && !completed_at) {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("dev_tasks")
    .update(updateData)
    .eq("id", Number(id))
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("dev_tasks")
    .delete()
    .eq("id", Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
