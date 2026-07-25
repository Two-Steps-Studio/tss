import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
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

  let query = supabase
    .from("dev_tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (projectId) {
    query = query.eq("project_id", Number(projectId));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return empty array if no tasks exist (handles PGRST116 case)
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev tasks disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { title, description, status = "todo", priority = "medium", tags, due_date, assignee_name, estimated_hours, project_id } = await request.json();

  const { data, error } = await supabase
    .from("dev_tasks")
    .insert({
      project_id,
      title,
      description,
      status,
      priority,
      tags,
      due_date,
      assignee_name,
      estimated_hours,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
