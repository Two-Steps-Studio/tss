import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST() {
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }
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
    return NextResponse.json({ ok: true, created: true });
  }
  return NextResponse.json({ ok: true, created: false });
}
