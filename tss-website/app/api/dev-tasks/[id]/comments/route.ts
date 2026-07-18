import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

interface RouteParams {
  params: Promise<{ id: string }>;
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
    .from("dev_task_comments")
    .select("*")
    .eq("task_id", Number(id))
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request, { params }: RouteParams) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Dev mode disabled" }, { status: 503 });
  }

  const { id } = await params;
  const body = await request.json();

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("dev_task_comments")
    .insert({
      task_id: Number(id),
      author_id: user?.id ?? null,
      author_name: body.author_name ?? user?.email ?? "Anonim",
      content: body.content,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
