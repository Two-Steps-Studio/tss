import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminInitialized } from "@/lib/supabase-admin";

// --- SECURITY: Validate file extension and mime type before upload ---
const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif"];
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

async function validateFile(file: File | null): Promise<{ valid: boolean; extension?: string; mime?: string }> {
  if (!file) return { valid: false };

  const extension = file.name.split(".").pop()?.toLowerCase();
  const mime = file.type || "";

  if (!ALLOWED_EXTENSIONS.includes(extension || "") || !ALLOWED_MIME_TYPES.includes(mime)) {
    return { valid: false };
  }

  // Banner — większy limit (15MB)
  if (file.size > 15 * 1024 * 1024) {
    return { valid: false };
  }

  return { valid: true, extension, mime };
}

export async function POST(req: Request) {
  if (!isSupabaseAdminInitialized || !supabaseAdmin) {
    return NextResponse.json({ error: "Banner upload is disabled - contact administrator" }, { status: 503 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const userId = (form.get("userId") as string) || "";

  if (!file) return NextResponse.json({ error: "Brak pliku" }, { status: 400 });
  if (!userId) return NextResponse.json({ error: "Brak userId" }, { status: 400 });

  const validation = await validateFile(file);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Nieprawidłowy typ pliku. Dozwolone: PNG, JPG, GIF, WEBP (max 15MB)" },
      { status: 400 }
    );
  }

  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const exists = (buckets || []).some((b: any) => b.name === "avatars");
  if (!exists) {
    const { error: createError } = await supabaseAdmin.storage.createBucket("avatars", {
      public: false,
      fileSizeLimit: 15 * 1024 * 1024,
      allowedMimeTypes: ALLOWED_MIME_TYPES,
    });
    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }
  }

  const path = `banners/${userId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabaseAdmin.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Bucket prywatny — tworzymy signed URL (1 rok)
  const { data: signedData, error: signedError } = await supabaseAdmin.storage
    .from("avatars")
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  if (signedError || !signedData?.signedUrl) {
    return NextResponse.json({ error: signedError?.message || "Failed to create signed URL" }, { status: 500 });
  }
  const url = signedData.signedUrl;

  await supabaseAdmin.from("profiles").upsert({
    id: userId,
    background: url,
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, url });
}
