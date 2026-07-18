import { NextResponse } from 'next/server';

export function GET() {
  // Przekieruj do launchera /
  return NextResponse.redirect(new URL('/', import.meta.url));
}
