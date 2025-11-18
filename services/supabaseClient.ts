import { createClient } from '@supabase/supabase-js';

// --- Environment Variables ---
// These are automatically injected by the environment.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
