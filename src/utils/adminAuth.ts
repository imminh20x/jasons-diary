import type { User } from '@supabase/supabase-js';

export function isAdminAuthenticated(supabaseUser: User | null): boolean {
  return Boolean(supabaseUser);
}
