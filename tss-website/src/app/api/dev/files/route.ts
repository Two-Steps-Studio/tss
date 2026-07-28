import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { CreateFileData, DevProjectFile } from "@/lib/types/dev-types";
import { checkProjectPermission, checkProjectMembership, logActivity } from "@/lib/dev-permissions";

export async function GET(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev files disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  // Check if user has access to the project
  const membershipCheck = await checkProjectMembership(Number(projectId));
  if (!membershipCheck.hasAccess) {
    return NextResponse.json({ error: membershipCheck.error }, { status: 403 });
  }

  let query = supabase
    .from("dev_project_files")
    .select("*")
    .order("created_at", { ascending: false });

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
      { error: "Dev files disabled - contact administrator" },
      { status: 503 }
    );
  }

  const body: CreateFileData = await request.json();
  const { project_id, name, storage_path, file_url, category, size_bytes, mime_type } = body;

  // Check if user has permission to manage files
  const permissionCheck = await checkProjectPermission(project_id, 'manage_files');
  if (!permissionCheck.hasAccess) {
    return NextResponse.json({ error: permissionCheck.error || "Insufficient permissions" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("dev_project_files")
    .insert({
      project_id,
      name,
      storage_path,
      file_url,
      category,
      size_bytes,
      mime_type,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await logActivity(project_id, 'file_uploaded', 'file', data?.id, { name, category });

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev files disabled - contact administrator" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  // Get the file to check project_id and permissions
  const { data: file } = await supabase
    .from("dev_project_files")
    .select("project_id, name")
    .eq("id", Number(id))
    .single();

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Check if user has permission to manage files
  const permissionCheck = await checkProjectPermission(file.project_id, 'manage_files');
  if (!permissionCheck.hasAccess) {
    return NextResponse.json({ error: permissionCheck.error || "Insufficient permissions" }, { status: 403 });
  }

  const { error } = await supabase
    .from("dev_project_files")
    .delete()
    .eq("id", Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await logActivity(file.project_id, 'file_deleted', 'file', Number(id), { name: file.name });

  return NextResponse.json({ success: true });
}
