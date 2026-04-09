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
      { online_users: 0, member_count: 0, site_accounts: 0 },
      { status: 503 }
    );
  }

  try {
    // Pobierz najnowsze statystyki Discorda z bazy danych
    const { data: discordStats, error: dsError } = await supabase
      .from('discord_stats')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    // Pobierz całkowitą liczbę użytkowników z bazy profiles (nie z Discorda)
    const { count: siteAccounts } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Zwróć dane w nowym formacie
    const response: any = {
      online_users: discordStats?.online_users || 0,
      member_count: discordStats?.member_count || 0,
      site_accounts: siteAccounts || 0,
    };

    if (dsError) {
      console.error('Supabase error:', dsError);
    }

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('Unexpected stats error:', err);
    return NextResponse.json({
      online_users: 0,
      member_count: 0,
      site_accounts: 0,
    });
  }
}

