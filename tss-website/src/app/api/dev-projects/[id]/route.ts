import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { UpdateProjectData } from "@/lib/types/dev-types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev projects disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { id } = await params;
  const body: UpdateProjectData = await request.json();

  const { data, error } = await supabase
    .from("dev_projects")
    .update(body)
    .eq("id", Number(id))
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev projects disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { id } = await params;

  const { error } = await supabase
    .from("dev_projects")
    .delete()
    .eq("id", Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
