import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { normalizeTask, toDbStatus } from "@/lib/dev/status-utils";
import type { TaskStatus } from "@/lib/types/dev-types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev tasks disabled" }, { status: 503 });
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

  return NextResponse.json(normalizeTask(data));
}

export async function PATCH(request: Request, { params }: RouteParams) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev tasks disabled" }, { status: 503 });
  }

  const { id } = await params;
  const body = await request.json();
  const updateData: Record<string, unknown> = {};

  if (body.title !== undefined) updateData.title = body.title?.trim() || body.title;
  if (body.description !== undefined) updateData.description = body.description ?? "";
  if (body.status !== undefined) {
    const valid: TaskStatus[] = ["todo", "in_progress", "testing", "completed"];
    if (!valid.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updateData.status = toDbStatus(body.status);
    if (body.status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }
  }
  if (body.priority !== undefined) updateData.priority = body.priority;
  if (body.tags !== undefined) updateData.tags = body.tags;
  if (body.due_date !== undefined) updateData.due_date = body.due_date;
  if (body.progress_percent !== undefined) updateData.progress_percent = body.progress_percent;
  if (body.assignee_name !== undefined) updateData.assignee_name = body.assignee_name;
  if (body.estimated_hours !== undefined) updateData.estimated_hours = body.estimated_hours;
  if (body.project_id !== undefined) updateData.project_id = body.project_id;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("dev_tasks")
    .update(updateData)
    .eq("id", Number(id))
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(normalizeTask(data));
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev tasks disabled" }, { status: 503 });
  }

  const { id } = await params;

  const { error } = await supabase.from("dev_tasks").delete().eq("id", Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
