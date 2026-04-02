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
  try {
    const supabase = await createClient();

    // Pobieranie newsów z bazy
    const { data: news, error } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Supabase error:', error);
      // Zwracamy puste dane w przypadku błędu
      return NextResponse.json([]);
    }

    return NextResponse.json(news || []);
  } catch (err: any) {
    console.error('Unexpected news error:', err);
    return NextResponse.json([]);
  }
}
