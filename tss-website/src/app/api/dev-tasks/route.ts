import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { normalizeTask, toDbStatus } from "@/lib/dev/status-utils";
import type { TaskStatus } from "@/lib/types/dev-types";

export async function GET(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev mode disabled" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  let query = supabase
    .from("dev_tasks")
    .select("*")
    .eq("project_id", Number(projectId))
    .order("created_at", { ascending: false });

  const status = searchParams.get("status");
  if (status) {
    query = query.eq("status", toDbStatus(status as TaskStatus));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map((t) => normalizeTask(t)));
}

export async function POST(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev mode disabled" }, { status: 503 });
  }

  const body = await request.json();
  const uiStatus = (body.status ?? "todo") as TaskStatus;

  const { data, error } = await supabase
    .from("dev_tasks")
    .insert({
      title: body.title,
      description: body.description ?? "",
      status: toDbStatus(uiStatus),
      priority: body.priority ?? "medium",
      tags: body.tags ?? [],
      due_date: body.due_date ?? null,
      progress_percent: body.progress_percent ?? 0,
      assignee_name: body.assignee_name ?? null,
      estimated_hours: body.estimated_hours ?? null,
      project_id: body.project_id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(normalizeTask(data), { status: 201 });
}
