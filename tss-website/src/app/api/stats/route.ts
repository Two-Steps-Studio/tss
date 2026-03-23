import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: discordStats, error: dsError } = await supabase
      .from('discord_stats')
      .select('*')
      .order('recorded_at', { ascending: false })
      .maybeSingle();

    const { count: totalProfiles, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (dsError) {
      console.error('Supabase error:', dsError);
    }

    return NextResponse.json({
      ...discordStats,
      total_members: totalProfiles || 0,
    });
  } catch (err: any) {
    console.error('Unexpected stats error:', err);
    return NextResponse.json({ 
      online_users: 0, 
      active_channels: 0, 
      recorded_at: new Date().toISOString() 
    });
  }
}

