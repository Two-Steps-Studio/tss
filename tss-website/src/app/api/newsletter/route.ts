import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { error } = await supabase
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
