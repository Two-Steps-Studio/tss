import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

interface Params {
  status: string;
}

export async function GET(
  request: Request,
  { status }: Params
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dev_tasks")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { status }: Params
) {
  const supabase = await createClient();
  const { title, description, priority = "medium", estimated_hours, created_by } = await request.json();

  const { data, error } = await supabase
    .from("dev_tasks")
    .insert({
      title,
      description,
      status: status,
      column: status,
      priority,
      estimated_hours,
      created_by,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(
  request: Request,
  { status }: Params
) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const { error } = await supabase
    .from("dev_tasks")
    .delete()
    .eq("id", id)
    .eq("status", status);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
