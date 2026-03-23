import { createBrowserClient } from '@supabase/ssr';

// --- TSS HARDLINK CONFIG (Ensures connection even if .env fails to load in Turbopack) ---
const HARDLINK_URL = "https://zkwkfhdyqwotijjhsegj.supabase.co";
const HARDLINK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprd2tmaGR5cXdvdGlqamhzZWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzAyNDcsImV4cCI6MjA4OTYwNjI0N30.bONJjId21B0mAJN_wlYuuXJaO48hQnXcDHN8r5jpxts";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || HARDLINK_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || HARDLINK_KEY;

// Clear legacy persistence if url changes (Prevents 'kerxwyiw' sessions from leaking into 'zkwk')
if (typeof window !== 'undefined') {
    const lastUrl = localStorage.getItem('tss_last_supabase_url');
    if (lastUrl && lastUrl !== supabaseUrl) {
        console.warn("Project mismatch detected! Cleaning local session...");
        localStorage.clear(); 
        sessionStorage.clear();
    }
    localStorage.setItem('tss_last_supabase_url', supabaseUrl);
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
