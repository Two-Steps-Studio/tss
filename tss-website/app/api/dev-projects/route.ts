import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Pobierz wszystkie projekty
export async function GET() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev mode disabled" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("dev_projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// Stwórz nowy projekt
export async function POST(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev mode disabled" }, { status: 503 });
  }

  const { name, description, color, columns, settings, planned_end_date } = await request.json();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("dev_projects")
    .insert({
      name,
      description,
      color: color || "#ffcb2f",
      columns: columns || [],
      settings: settings || {},
      planned_end_date: planned_end_date ?? null,
      owner_id: user?.id ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// Usuń projekt
export async function DELETE(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev mode disabled" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = parseInt(searchParams.get("id") || "");

  // Usuń wszystkie zadania z projektu
  await supabase
    .from("dev_tasks")
    .delete()
    .eq("project_id", projectId);

  // Usuń kolumny projektu
  await supabase
    .from("dev_project_columns")
    .delete()
    .eq("project_id", projectId);

  // Usuń projekt
  const { error } = await supabase
    .from("dev_projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
