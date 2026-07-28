import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { UpdateMemberData } from "@/lib/types/dev-types";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev module disabled - contact administrator" },
      { status: 503 }
    );
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberId = parseInt(params.id);
  const body: UpdateMemberData = await request.json();
  const { role, permissions } = body;

  // Get the member to check project ownership
  const { data: member, error: memberError } = await supabase
    .from("dev_project_members")
    .select("project_id, user_id")
    .eq("id", memberId)
    .single();

  if (memberError || !member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Check if current user is owner of the project
  const { data: project, error: projectError } = await supabase
    .from("dev_projects")
    .select("owner_id")
    .eq("id", member.project_id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.owner_id !== user.id) {
    return NextResponse.json({ error: "Only project owners can update member roles" }, { status: 403 });
  }

  // Prevent removing owner role from the project owner
  if (member.user_id === project.owner_id && role !== 'owner') {
    return NextResponse.json({ error: "Cannot change project owner's role" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("dev_project_members")
    .update({
      role,
      permissions,
    })
    .eq("id", memberId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "Dev module disabled - contact administrator" },
      { status: 503 }
    );
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberId = parseInt(params.id);

  // Get the member to check project ownership
  const { data: member, error: memberError } = await supabase
    .from("dev_project_members")
    .select("project_id, user_id")
    .eq("id", memberId)
    .single();

  if (memberError || !member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Check if current user is owner of the project
  const { data: project, error: projectError } = await supabase
    .from("dev_projects")
    .select("owner_id")
    .eq("id", member.project_id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.owner_id !== user.id) {
    return NextResponse.json({ error: "Only project owners can remove members" }, { status: 403 });
  }

  // Prevent removing the project owner
  if (member.user_id === project.owner_id) {
    return NextResponse.json({ error: "Cannot remove project owner" }, { status: 400 });
  }

  const { error } = await supabase
    .from("dev_project_members")
    .delete()
    .eq("id", memberId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
