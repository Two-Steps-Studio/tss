import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dev_tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { title, description, status = "pending", assigned_to } = await request.json();

  const { data, error } = await supabase
    .from("dev_tasks")
    .insert({
      title,
      description,
      status,
      assigned_to,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function GET_BY_STATUS(request: Request, { params }: { params: { status: string } }) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dev_tasks")
    .select("*")
    .eq("status", params.status);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST_BY_STATUS(request: Request, { params }: { params: { status: string } }) {
  const supabase = await createClient();
  const { title, description, assigned_to } = await request.json();

  const { data, error } = await supabase
    .from("dev_tasks")
    .insert({
      title,
      description,
      status: params.status,
      assigned_to,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { title, description, status, assigned_to } = await request.json();

  const { data, error } = await supabase
    .from("dev_tasks")
    .update({ title, description, status, assigned_to })
    .eq("id", Number(params.id))
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("dev_tasks")
    .delete()
    .eq("id", Number(params.id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
