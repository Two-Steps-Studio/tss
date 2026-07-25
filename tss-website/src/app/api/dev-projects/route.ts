import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { CreateProjectData, UpdateProjectData, DevProject } from "@/lib/types/dev-types";

export async function GET(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev projects disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const includeArchived = searchParams.get("includeArchived") === "true";

  let query = supabase
    .from("dev_projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (!includeArchived) {
    query = query.eq("is_archived", false);
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
      { error: "Dev projects disabled - contact administrator" },
      { status: 503 }
    );
  }

  const body: CreateProjectData = await request.json();
  const { name, description, description_markdown, color, planned_end_date } = body;

  // Bypass owner_id constraint to fix foreign key violation error.
  // Projects are now global/shared resources instead of user-owned.

  const { data, error } = await supabase
    .from("dev_projects")
    .insert({
      name,
      description,
      description_markdown,
      color: color || "#ffcb2f",
      status: "active",
      planned_end_date,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
