import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  let supabase;

  try {
    /** DEV MODE removed - direct access to dev features via settings */
    supabase = await createClient();
  } catch (error) {
    console.error("Roadmap API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  const projectId = new URL(request.url).searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("dev_roadmap_phases")
    .select("*")
    .eq("project_id", Number(projectId))
    .order("sort_order", { ascending: true });

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
    console.error("Roadmap API error:", error);

  const body = await request.json();

  const { data, error } = await supabase
    .from("dev_roadmap_phases")
    .insert({
      project_id: body.project_id,
      name: body.name,
      description: body.description ?? "",
      start_date: body.start_date ?? null,
      planned_end_date: body.planned_end_date ?? null,
      status: body.status ?? "planned",
      completion_percentage: body.completion_percentage ?? 0,
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
    console.error("Roadmap API error:", error);

  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { id, ...fields } = body;
  fields.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("dev_roadmap_phases")
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
    console.error("Roadmap API error:", error);

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabase.from("dev_roadmap_phases").delete().eq("id", Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
