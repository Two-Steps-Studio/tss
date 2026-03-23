import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json([]);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Unexpected news error:', err);
    return NextResponse.json([]);
  }
}

