import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  let supabase;

  try {
    /** DEV MODE removed - direct access to dev features via settings */
    supabase = await createClient();
  } catch (error) {
    console.error("Files API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  let query = supabase
    .from("dev_project_files")
    .select("*")
    .eq("project_id", Number(projectId))
    .order("created_at", { ascending: false });

  const category = searchParams.get("category");
  const search = searchParams.get("search");

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let files = data ?? [];
  if (search) {
    const q = search.toLowerCase();
    files = files.filter((f) => f.name.toLowerCase().includes(q));
  }

  return NextResponse.json(files);
}

export async function POST(request: Request) {
  let supabase;

  try {
    /** DEV MODE removed - direct access to dev features via settings */
    supabase = await createClient();
  } catch (error) {
    console.error("Files API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("dev_project_files")
    .insert({
      project_id: body.project_id,
      name: body.name,
      file_url: body.file_url ?? null,
      storage_path: body.storage_path ?? null,
      category: body.category ?? "other",
      size_bytes: body.size_bytes ?? null,
      mime_type: body.mime_type ?? null,
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
    /** DEV MODE removed - direct access to dev features via settings */
    supabase = await createClient();
  } catch (error) {
    console.error("Files API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabase.from("dev_project_files").delete().eq("id", Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
