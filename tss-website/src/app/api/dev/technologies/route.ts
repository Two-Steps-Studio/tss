import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { CreateTechnologyData, UpdateTechnologyData, DevTechnology } from "@/lib/types/dev-types";

export async function GET(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev technologies disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  let query = supabase
    .from("dev_technologies")
    .select("*")
    .order("sort_order", { ascending: true });

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
      { error: "Dev technologies disabled - contact administrator" },
      { status: 503 }
    );
  }

  const body: CreateTechnologyData = await request.json();
  const { project_id, name, icon_slug, version, category, description, sort_order } = body;

  // Get max sort_order for this project if not provided
  let finalSortOrder = sort_order;
  if (!finalSortOrder) {
    const { data: existingTechs } = await supabase
      .from("dev_technologies")
      .select("sort_order")
      .eq("project_id", project_id)
      .order("sort_order", { ascending: false })
      .limit(1);
    
    finalSortOrder = existingTechs && existingTechs.length > 0 ? existingTechs[0].sort_order + 1 : 0;
  }

  const { data, error } = await supabase
    .from("dev_technologies")
    .insert({
      project_id,
      name,
      icon_slug,
      version,
      category,
      description,
      sort_order: finalSortOrder,
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
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev technologies disabled - contact administrator" },
      { status: 503 }
    );
  }

  const body: UpdateTechnologyData & { id?: number } = await request.json();
  const { id, ...updateData } = body;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("dev_technologies")
    .update(updateData)
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
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev technologies disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("dev_technologies")
    .delete()
    .eq("id", Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
