import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseListo = !!(supabaseUrl && supabaseAnonKey);

if (!supabaseListo) {
  console.warn("Falta configurar Supabase en .env.local");
}

export const supabase = createClient(supabaseUrl || 'http://dummy.url', supabaseAnonKey || 'dummy', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});
