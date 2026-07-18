import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

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

  const { status } = await params;

  // Map API statuses to DB statuses (pending = todo, in_progress = doing, completed = done)
  const statusMap: Record<string, string> = {
    todo: "pending",
    in_progress: "in_progress",
    completed: "completed",
  };

  const dbStatus = statusMap[status] || status;

  const { data, error } = await supabase
    .from("dev_tasks")
    .select("*")
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
  const validStatuses = ["todo", "in_progress", "completed"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const body = await request.json();
  const { title, description, priority = 0, estimated_hours = 0, created_by = null } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
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
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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

  const { error } = await supabase
    .from("dev_tasks")
    .delete()
    .eq("id", Number(id))
    .eq("status", status);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
