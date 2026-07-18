import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Pobierz kolumny dla danego projektu
export async function GET(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev mode disabled" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = parseInt(searchParams.get("projectId") || "1");

  const { data, error } = await supabase
    .from("dev_project_columns")
    .select("*")
    .eq("project_id", projectId)
    .order("position");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// Stwórz nową kolumnę
export async function POST(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev mode disabled" }, { status: 503 });
  }

  const { project_id, name, color, icon, settings } = await request.json();

  const { data, error } = await supabase
    .from("dev_project_columns")
    .insert({
      project_id,
      name,
      color: color || "#3b82f6",
      icon: icon || null,
      settings: settings || {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// Usuń kolumnę
export async function DELETE(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev mode disabled" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const columnId = parseInt(searchParams.get("id") || "");

  const { error } = await supabase
    .from("dev_project_columns")
    .delete()
    .eq("id", columnId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Zaktualizuj kolumnę
export async function PATCH(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev mode disabled" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const columnId = parseInt(searchParams.get("id") || "");
  const { name, color, icon, position, settings } = await request.json();

  const { data, error } = await supabase
    .from("dev_project_columns")
    .update({
      name: name,
      color: color,
      icon: icon,
      position,
      settings,
    })
    .eq("id", columnId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
