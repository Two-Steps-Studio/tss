import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create client if both credentials are available
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[supabase-admin] Missing Supabase credentials - admin functions disabled');
}

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Type guard to check if supabaseAdmin is initialized
export const isSupabaseAdminInitialized = !!supabaseAdmin;
