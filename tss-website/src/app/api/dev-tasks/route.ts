import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev tasks disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("dev_tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return empty array if no tasks exist (handles PGRST116 case)
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev tasks disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { title, description, status = "todo", assigned_to } = await request.json();

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
