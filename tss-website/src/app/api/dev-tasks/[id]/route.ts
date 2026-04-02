import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

interface Params {
  id: string;
}

export async function GET(
  request: Request,
  { id }: Params
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dev_tasks")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request, { id }: Params) {
  const supabase = await createClient();
  const { title, description, status, assigned_to } = await request.json();

  const { data, error } = await supabase
    .from("dev_tasks")
    .update({ title, description, status, assigned_to })
    .eq("id", Number(id))
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request, { id }: Params) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("dev_tasks")
    .delete()
    .eq("id", Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
