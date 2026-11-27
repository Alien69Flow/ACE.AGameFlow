import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'placeholder-anon-key';

const isConfigured = !!(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

export const supabase: SupabaseClient<Database> = createClient<Database>(
  isConfigured ? SUPABASE_URL! : FALLBACK_URL,
  isConfigured ? SUPABASE_PUBLISHABLE_KEY! : FALLBACK_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: isConfigured,
    },
  }
);

export const isSupabaseConfigured = isConfigured;
