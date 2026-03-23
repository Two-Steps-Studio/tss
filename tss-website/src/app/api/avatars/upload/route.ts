import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const userId = (form.get("userId") as string) || "";
  const username = (form.get("username") as string) || "";

  if (!file) {
    return NextResponse.json({ error: "Brak pliku" }, { status: 400 });
  }
  if (!userId) {
    return NextResponse.json({ error: "Brak userId" }, { status: 400 });
  }

  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const exists = (buckets || []).some((b: any) => b.name === "avatars");
  if (!exists) {
    const { error: createError } = await supabaseAdmin.storage.createBucket("avatars", {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    });
    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }
  }

  const path = `${userId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabaseAdmin.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicData } = supabaseAdmin.storage.from("avatars").getPublicUrl(path);
  const url = publicData.publicUrl;

  await supabaseAdmin.from("profiles").upsert({
    id: userId,
    username,
    avatar_url: url,
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, url });
}
