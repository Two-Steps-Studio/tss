// Przekieruj /games do launchera
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/", import.meta.url || "http://localhost:3000"));
}

export default function HomePage() {
  return null;
}
