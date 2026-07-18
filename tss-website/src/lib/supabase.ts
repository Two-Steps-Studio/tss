import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fix Turbopack hardlink issues - disable via env var
const hardlinkConfig = {
  // Enable hardlink fallback for Turbopack issues
  hardlinks: process.env.NEXT_PUBLIC_SUPABASE_USE_HARDLINKS === 'true',
};

// Export a flag to check if Supabase is configured
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createBrowserClient(supabaseUrl, supabaseAnonKey, {
      // Turbopack fix: use hardlink config to avoid fetch errors
      ...hardlinkConfig,
    })
  : null;

/**
 * Session expiry configuration
 * - access_token: 15-60 minutes (default)
 * - refresh_token: 7-30 days (default)
 * - auto-renewal enabled for seamless sessions
 * - Session expiry can be controlled via Supabase Dashboard
 * - Default: 24 hours for access tokens in production
 */
export const SESSION_EXPIRY_HOURS = parseInt(process.env.SUPABASE_SESSION_EXPIRY || '24', 10);

/**
 * Session security settings
 */
export const SESSION_SECURITY = {
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 15,
  requireEmailVerification: true,
  sessionTimeoutMinutes: SESSION_EXPIRY_HOURS * 60,
};
