import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createClient();

    // Pobierz najnowsze statystyki Discorda z bazy danych
    const { data: discordStats, error: dsError } = await supabase
      .from('discord_stats')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    // Pobierz całkowitą liczbę użytkowników z bazy (nie z Discorda)
    const { count: totalProfiles } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Zwróć dane w poprawnym formacie
    const response: any = {
      online_users: discordStats?.online_users || 0,
      total_members: totalProfiles || 0,
      messages_today: discordStats?.messages_today || 0,
      active_channels: discordStats?.active_channels || 0,
      recorded_at: discordStats?.recorded_at || new Date().toISOString(),
    };

    if (dsError) {
      console.error('Supabase error:', dsError);
    }

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('Unexpected stats error:', err);
    return NextResponse.json({
      online_users: 0,
      total_members: 0,
      messages_today: 0,
      active_channels: 0,
      recorded_at: new Date().toISOString()
    });
  }
}

