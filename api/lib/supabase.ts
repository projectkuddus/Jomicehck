import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client for API routes
// Uses service role key for admin operations (only in API routes, never expose to client)

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn('Supabase URL not configured in API routes');
}

// Use service role key for server-side operations (bypasses RLS)
// Fallback to anon key if service key not available (will respect RLS)
const supabaseKey = supabaseServiceKey || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

