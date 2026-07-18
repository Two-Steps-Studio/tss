import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev mode disabled" }, { status: 503 });
  }

  const { id } = await params;
  const body = await request.json();
  const updateData: Record<string, unknown> = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.description_markdown !== undefined) updateData.description_markdown = body.description_markdown;
  if (body.color !== undefined) updateData.color = body.color;
  if (body.planned_end_date !== undefined) updateData.planned_end_date = body.planned_end_date;
  if (body.status !== undefined) updateData.status = body.status;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("dev_projects")
    .update(updateData)
    .eq("id", Number(id))
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function GET(_request: Request, { params }: RouteParams) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev mode disabled" }, { status: 503 });
  }

  const { id } = await params;

  const { data, error } = await supabase
    .from("dev_projects")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
