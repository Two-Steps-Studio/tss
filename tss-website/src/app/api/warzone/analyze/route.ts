import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // Forward request to Warzone Analyzer
    const { analysisId } = await request.json();

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Brak analysisId' },
        { status: 400 }
      );
    }

    // Call Warzone Analyzer API
    const res = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ analysisId }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || 'Błąd Warzone Analyzer' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[WARZONE] Error:', err);
    return NextResponse.json(
      { error: 'Warzone Analyzer niedostępny' },
      { status: 503 }
    );
  }
}
