import { getSupabase } from '../supabaseClient';

export interface AboutProfile {
  id?: string;
  lang: string;
  avatar_url?: string;
  eyebrow?: string;
  name?: string;
  title?: string;
  bio?: string;
  skills?: any; // JSONB
  jobs?: any;   // JSONB
  certs?: any;  // JSONB
  updated_at?: string;
}

/**
 * Fetches the about profile for a specific language from Supabase.
 * Returns null if the record doesn't exist, the table isn't created, or on failure.
 */
export async function fetchAboutProfile(lang: string): Promise<AboutProfile | null> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('about_profile')
      .select('*')
      .eq('lang', lang)
      .maybeSingle();

    if (error) {
      // Log warning rather than crashing; this helps gracefully fall back to local i18n
      console.warn('Supabase fetch about_profile failed or table does not exist:', error.message);
      return null;
    }
    return data as AboutProfile;
  } catch (err: any) {
    console.warn('Failed to fetch about profile from database:', err.message || err);
    return null;
  }
}

/**
 * Upserts the about profile for a specific language in Supabase.
 */
export async function saveAboutProfile(
  profile: Omit<AboutProfile, 'id' | 'updated_at'>
): Promise<AboutProfile | null> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('about_profile')
      .upsert(
        {
          ...profile,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'lang' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error saving about profile:', error);
      throw error;
    }
    return data as AboutProfile;
  } catch (err: any) {
    console.error('Failed to save about profile in database:', err.message || err);
    throw err;
  }
}
