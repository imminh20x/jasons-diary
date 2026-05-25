const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isPlaceholder = (val: string | undefined): boolean => {
  if (!val) return true;
  const lower = val.toLowerCase();
  return (
    lower.includes('your-project-id') ||
    lower.includes('your-anon-public-api-key') ||
    lower.includes('placeholder')
  );
};

export const isSupabaseConfigured =
  !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey);

export const supabaseEnv = {
  url: supabaseUrl ?? '',
  anonKey: supabaseAnonKey ?? '',
} as const;

if (!isSupabaseConfigured) {
  console.error(
    'Supabase is required. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, then restart the dev server.',
  );
}
