import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

const supabaseUrl = process.env.SUPABASE_URL || '';
// In a secure Node environment, we should use the Service Role Key to safely bypass RLS.
// Fallback to Anon Key if the Service Key isn't provided yet.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL and Key are missing in environment variables.');
}

if (supabaseKey === process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('✅ Supabase initialized with SERVICE_ROLE_KEY (Bypassing RLS)');
} else {
  console.warn('⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is missing! Using Anon Key. Database writes may fail if RLS is enabled.');
}

// Service Role Client (for admin tasks, bypassing RLS)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// Anon Client (strictly for authentication/login, so it doesn't mutate the Service Role client's JWT)
const anonKey = process.env.SUPABASE_ANON_KEY || '';
export const supabaseAuth = createClient(supabaseUrl, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
