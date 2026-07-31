import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface NewsItem {
  id: string;
  title: string;
  content: string;
  published_at: string;
  author?: string;
}

export async function GET() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    const errorMessage = process.env.NODE_ENV === 'development'
      ? 'Supabase service unavailable - check configuration'
      : 'Service temporarily unavailable';
    return NextResponse.json({ error: errorMessage }, { status: 503 });
  }

  try {
    // Pobieranie newsów z bazy
    const { data: news, error } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Supabase error:', error);
      const errorMessage = process.env.NODE_ENV === 'development'
        ? `Database error: ${error.message}`
        : 'Failed to load news';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json(news || []);
  } catch (err: any) {
    console.error('Unexpected news error:', err);
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `Unexpected error: ${err.message}`
      : 'Failed to load news';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
