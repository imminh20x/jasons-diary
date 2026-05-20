import { createClient } from '@supabase/supabase-js';

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

// Check if variables are missing or contain placeholder values
export const isMockMode = isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey);

if (isMockMode) {
  console.warn("Supabase env variables are missing or placeholders. Using mock backend fallback.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
