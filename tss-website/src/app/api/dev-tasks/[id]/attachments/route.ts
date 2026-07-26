import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev tasks disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { id } = await params;

  const { data, error } = await supabase
    .from("dev_task_attachments")
    .select("*")
    .eq("task_id", Number(id))
    .order("uploaded_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: Request, { params }: RouteParams) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev tasks disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const { file_name, file_url, file_size, mime_type } = body;

  if (!file_name || !file_url) {
    return NextResponse.json({ error: "file_name and file_url are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("dev_task_attachments")
    .insert({
      task_id: Number(id),
      file_name,
      file_url,
      file_size,
      mime_type,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev tasks disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const attachmentId = searchParams.get("attachmentId");

  if (!attachmentId) {
    return NextResponse.json({ error: "attachmentId is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("dev_task_attachments")
    .delete()
    .eq("id", Number(attachmentId))
    .eq("task_id", Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
