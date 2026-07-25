import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { CreateFileData, DevProjectFile } from "@/lib/types/dev-types";

export async function GET(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev files disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  let query = supabase
    .from("dev_project_files")
    .select("*")
    .order("created_at", { ascending: false });

  if (projectId) {
    query = query.eq("project_id", Number(projectId));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev files disabled - contact administrator" },
      { status: 503 }
    );
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: CreateFileData = await request.json();
  const { project_id, name, storage_path, file_url, category, size_bytes, mime_type } = body;

  const { data, error } = await supabase
    .from("dev_project_files")
    .insert({
      project_id,
      name,
      storage_path,
      file_url,
      category,
      size_bytes,
      mime_type,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev files disabled - contact administrator" },
      { status: 503 }
    );
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("dev_project_files")
    .delete()
    .eq("id", Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
