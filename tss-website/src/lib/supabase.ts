import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Export a flag to check if Supabase is configured
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null;
