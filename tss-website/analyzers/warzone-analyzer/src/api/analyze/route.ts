import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { analysisId } = await request.json();

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Brak analysisId' },
        { status: 400 }
      );
    }

    // Get analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('warzone_analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Nie znaleziono analizy' },
        { status: 404 }
      );
    }

    // Trigger analysis pipeline
    const analysisType = 'all'; // or specific: 'aim', 'movement', etc.
    const videoUrl = analysis.filename;

    // Simulate analysis processing (in reality, call Docker container)
    const [aimStats, movementStats, positioningStats, decisionStats] = await Promise.all([
      callAimAnalyzer(analysisType, videoUrl),
      callMovementAnalyzer(analysisType, videoUrl),
      callPositioningAnalyzer(analysisType, videoUrl),
      callDecisionAnalyzer(analysisType, videoUrl),
    ]);

    // Update analysis with results
    const { error: updateError } = await supabase
      .from('warzone_analyses')
      .update({
        status: 'completed',
        aim_stats: aimStats,
        movement_stats: movementStats,
        positioning_stats: positioningStats,
        decision_stats: decisionStats,
        completed_at: new Date().toISOString(),
      })
      .eq('id', analysisId)
      .select()
      .single();

    if (updateError) {
      console.error('[ANALYZE] Update error:', updateError);
      return NextResponse.json(
        { error: 'Błąd aktualizacji' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysisId,
      results: {
        aim: aimStats,
        movement: movementStats,
        positioning: positioningStats,
        decision: decisionStats,
      },
    });
  } catch (err) {
    console.error('[ANALYZE] Error:', err);
    return NextResponse.json(
      { error: 'Nieznany błąd' },
      { status: 500 }
    );
  }
}

// Mock functions - replace with actual Docker container calls
async function callAimAnalyzer(type: string, videoUrl: string) {
  return { fps: 60, avg_reaction_time: 180, accuracy: 92.5 };
}

async function callMovementAnalyzer(type: string, videoUrl: string) {
  return { positions: [], heatmaps: [] };
}

async function callPositioningAnalyzer(type: string, videoUrl: string) {
  return { rotation_stats: {}, positioning_score: 85 };
}

async function callDecisionAnalyzer(type: string, videoUrl: string) {
  return { mistakes: [], decisions: [] };
}
