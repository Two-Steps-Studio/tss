import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: Request) {
  // Check if Supabase is configured
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      error: 'Newsletter subscription is disabled - contact administrator'
    }, { status: 503 });
  }

  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('newsletter_subs')
      .insert([{ email }]);

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Already subscribed' }, { status: 200 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
