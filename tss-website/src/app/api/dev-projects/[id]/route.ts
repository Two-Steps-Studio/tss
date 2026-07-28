import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { UpdateProjectData } from "@/lib/types/dev-types";
import { checkProjectPermission, logActivity } from "@/lib/dev-permissions";

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
  const projectId = Number(id);

  // Check if user has permission to edit project
  const permissionCheck = await checkProjectPermission(projectId, 'edit_project');
  if (!permissionCheck.hasAccess) {
    return NextResponse.json({ error: permissionCheck.error || "Insufficient permissions" }, { status: 403 });
  }

  // Handle archiving/restoring
  if (body.status === 'archived' || body.status === 'active') {
    const archiveCheck = await checkProjectPermission(projectId, 'manage_settings');
    if (!archiveCheck.hasAccess) {
      return NextResponse.json({ error: "Only owners and admins can archive/restore projects" }, { status: 403 });
    }
  }

  const { data, error } = await supabase
    .from("dev_projects")
    .update(body)
    .eq("id", projectId)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Log activity
  if (body.status === 'archived') {
    await logActivity(projectId, 'project_archived', 'project', projectId);
  } else if (body.status === 'active') {
    await logActivity(projectId, 'project_restored', 'project', projectId);
  } else {
    await logActivity(projectId, 'project_updated', 'project', projectId);
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
  const projectId = Number(id);

  // Check if user has permission to delete project
  const permissionCheck = await checkProjectPermission(projectId, 'delete_project');
  if (!permissionCheck.hasAccess) {
    return NextResponse.json({ error: permissionCheck.error || "Only project owners can delete projects" }, { status: 403 });
  }

  // Soft delete the project
  const { error } = await supabase
    .from("dev_projects")
    .update({
      status: 'deleted',
      deleted_at: new Date().toISOString()
    })
    .eq("id", projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await logActivity(projectId, 'project_deleted', 'project', projectId);

  return NextResponse.json({ success: true });
}
