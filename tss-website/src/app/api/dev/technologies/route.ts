import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  let supabase;

  try {
    /** DEV MODE removed - direct access to dev features via settings */
    supabase = await createClient();
  } catch (error) {
    console.error("Technologies API error:", error);

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  let query = supabase
    .from("dev_project_technologies")
    .select("*")
    .eq("project_id", Number(projectId))
    .order("sort_order", { ascending: true });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  let supabase;

  try {
    /** DEV MODE removed - direct access to dev features via settings */
    supabase = await createClient();
  } catch (error) {
    console.error("Technologies API error:", error);
  const body = await request.json();

  const { data, error } = await supabase
    .from("dev_project_technologies")
    .insert({
      project_id: body.project_id,
      name: body.name,
      icon_slug: body.icon_slug ?? null,
      version: body.version ?? null,
      category: body.category ?? "other",
      description: body.description ?? "",
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  let supabase;

  try {
    /** DEV MODE removed - direct access to dev features via settings */
    supabase = await createClient();
  } catch (error) {
    console.error("Technologies API error:", error);

  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { id, ...fields } = body;

  const { data, error } = await supabase
    .from("dev_project_technologies")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  let supabase;

  try {
    /** DEV MODE removed - direct access to dev features via settings */
    supabase = await createClient();
  } catch (error) {
    console.error("Technologies API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabase.from("dev_project_technologies").delete().eq("id", Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
