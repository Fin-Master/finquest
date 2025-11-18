import { createClient } from '@supabase/supabase-js';

// --- Environment Variables ---
// These are automatically injected by the environment.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log("url: ", supabaseUrl, "Anon: ", supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
