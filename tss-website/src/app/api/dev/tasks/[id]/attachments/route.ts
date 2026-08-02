import { NextResponse } from "next/server";

// This file is a placeholder - the full implementation needs to handle:
// 1. multipart/form-data for direct image uploads (File) or JSON urls
// 2. Bypass RLS restrictions on task attachments table creation
// Run migration first, then use this route pattern per-task attachment POST/DELETE

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ error: "Not implemented yet" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ error: "Not implemented yet" }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Not implemented yet" }, { status: 501 });
}
