import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Pobierz zadania dla danego projektu
export async function GET(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev mode disabled" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = parseInt(searchParams.get("projectId") || "1");
  const status = searchParams.get("status") || null;

  let query = supabase
    .from("dev_tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// Stwórz nowe zadanie
export async function POST(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev mode disabled" }, { status: 503 });
  }

  const { title, description, status = "pending", assigned_to, priority = "medium", tags = [], due_date, estimated_hours, custom_fields, project_id } = await request.json();

  const { data, error } = await supabase
    .from("dev_tasks")
    .insert({
      title,
      description: description || "",
      assigned_to: assigned_to || null,
      status,
      priority,
      tags: tags || [],
      due_date: due_date || null,
      estimated_hours: estimated_hours || null,
      custom_fields: custom_fields || {},
      project_id: project_id || 1,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
