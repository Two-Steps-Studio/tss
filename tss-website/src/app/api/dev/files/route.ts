import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { CreateFileData, DevProjectFile } from "@/lib/types/dev-types";
import { checkProjectPermission, checkProjectMembership, logActivity } from "@/lib/dev-permissions";
import { uploadDevFile, getProjectStorageUsage, deleteFile, FILE_SIZE_LIMITS, ensureBucketExists } from "@/lib/supabase-storage";

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

  // Ensure dev-files bucket exists
  const bucketResult = await ensureBucketExists('dev-files', { public: true });
  if (bucketResult.error) {
    console.error('[Dev Files] Bucket ensure error:', bucketResult.error);
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

  // Calculate storage usage
  const totalBytes = data?.reduce((sum, file) => sum + (file.size_bytes || 0), 0) || 0;

  return NextResponse.json({
    files: data || [],
    storageUsage: totalBytes,
    storageLimit: FILE_SIZE_LIMITS.DEV_PROJECT,
  });
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

  const contentType = request.headers.get('content-type');

  // Handle file upload (multipart/form-data)
  if (contentType?.includes('multipart/form-data')) {
    try {
      // Ensure dev-files bucket exists (create if missing)
      const bucketResult = await ensureBucketExists('dev-files', { public: true });
      if (bucketResult.error) {
        return NextResponse.json(
          { error: `Storage bucket 'dev-files' could not be created: ${bucketResult.error}` },
          { status: 503 }
        );
      }

      const formData = await request.formData();
      const file = formData.get('file') as File;
      const project_id = Number(formData.get('project_id'));
      const category = formData.get('category') as string;

      if (!file || !project_id) {
        return NextResponse.json({ error: "File and project_id are required" }, { status: 400 });
      }

      // Check permissions
      const permissionCheck = await checkProjectPermission(project_id, 'manage_files');
      if (!permissionCheck.hasAccess) {
        return NextResponse.json({ error: permissionCheck.error || "Insufficient permissions" }, { status: 403 });
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Check project storage limit
      const currentUsage = await getProjectStorageUsage(project_id);
      if (currentUsage + file.size > FILE_SIZE_LIMITS.DEV_PROJECT) {
        const usedMB = (currentUsage / (1024 * 1024)).toFixed(0);
        const limitMB = (FILE_SIZE_LIMITS.DEV_PROJECT / (1024 * 1024)).toFixed(0);
        return NextResponse.json(
          { error: `Storage limit exceeded. Current: ${usedMB}MB, Limit: ${limitMB}MB` },
          { status: 413 }
        );
      }

      // Upload file to Supabase Storage
      const { path, publicUrl } = await uploadDevFile(project_id, file, user.id);

      // Insert file record
      const { data, error } = await supabase
        .from("dev_project_files")
        .insert({
          project_id,
          name: file.name,
          storage_path: path,
          file_url: publicUrl,
          category: category || 'other',
          size_bytes: file.size,
          mime_type: file.type,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log activity
      await logActivity(project_id, 'file_uploaded', 'file', data?.id, { name: file.name, category });

      return NextResponse.json(data, { status: 201 });
    } catch (error) {
      console.error('[Dev Files] Upload error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Upload failed" },
        { status: 500 }
      );
    }
  }

  // Handle legacy URL-based file creation
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
    .select("project_id, name, storage_path")
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

  // Delete from storage if file exists
  if (file.storage_path) {
    try {
      // Ensure bucket exists before attempting delete
      const bucketResult = await ensureBucketExists('dev-files', { public: true });
      if (!bucketResult.error) {
        await deleteFile('dev-files', file.storage_path);
      }
    } catch (error) {
      console.error('[Dev Files] Storage delete error:', error);
      // Continue with database deletion even if storage deletion fails
    }
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
