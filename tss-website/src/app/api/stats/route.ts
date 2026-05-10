import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { online_users: 0, member_count: 0, messages_today: 0 },
      { status: 503 }
    );
  }

  try {
    // Pobierz najnowsze statystyki z discord_stats
    const { data: discordStats, error: dsError } = await supabase
      .from('discord_stats')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (dsError) {
      console.error('Discord stats error:', dsError);
    }

    // Zwróć wszystkie pola z discord_stats
    const response: any = {
      online_users: discordStats.online_users || 0,
      member_count: discordStats.member_count || discordStats.online_users || 0,
      messages_today: discordStats.messages_today || 0,
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('Unexpected stats error:', err);
    return NextResponse.json({
      online_users: 0,
      total_members: 0,
      messages_today: 0,
    });
  }
}

