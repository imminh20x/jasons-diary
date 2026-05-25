import type { SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseEnv } from './supabaseConfig';

let client: SupabaseClient | undefined;
let clientPromise: Promise<SupabaseClient> | undefined;

export async function getSupabase(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  if (client) {
    return client;
  }

  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => {
      client = createClient(supabaseEnv.url, supabaseEnv.anonKey);
      return client;
    });
  }

  return clientPromise;
}
