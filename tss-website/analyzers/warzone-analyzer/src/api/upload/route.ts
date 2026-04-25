import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const formData = await request.formData();
    const video = formData.get('video') as File;
    const userId = formData.get('userId') as string;

    if (!video) {
      return NextResponse.json(
        { error: 'Brak wideo' },
        { status: 400 }
      );
    }

    // Generate unique video ID
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const filename = `${videoId}_${video.name}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('warzone_videos')
      .upload(filename, video, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[UPLOAD] Error:', uploadError);
      return NextResponse.json(
        { error: 'Błąd uploadu: ' + uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from('warzone_videos')
      .getPublicUrl(filename);

    // Create analysis record in database
    const { data: analysis, error: analysisError } = await supabase
      .from('warzone_analyses')
      .insert({
        user_id: userId || null,
        video_id: videoId,
        filename: filename,
        duration_seconds: video.size / (video.type.includes('video/mp4') ? 4000000 : 8000000), // estimate
        status: 'queued',
      })
      .select()
      .single();

    if (analysisError) {
      console.error('[UPLOAD] DB Error:', analysisError);
      return NextResponse.json(
        { error: 'Błąd bazy danych' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      videoId,
      filename,
      url: publicUrl.publicData,
      analysisId: analysis?.id,
    });
  } catch (err) {
    console.error('[UPLOAD] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Nieznany błąd' },
      { status: 500 }
    );
  }
}
