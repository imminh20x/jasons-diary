import { isMockMode } from '../supabaseConfig';
import { fetchPostTags as fetchPostTagsFromDb, registerPostTags as registerPostTagsInDb } from '../services/db';
import { mergeUniquePostTags, normalizePostTag, postTagKey } from './postTagUtils';

export { normalizePostTag, postTagKey, searchPostTags } from './postTagUtils';

const STORAGE_KEY = 'aura_blog_post_tags';

function getLocalPostTags(): string[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as string[];
    return mergeUniquePostTags([], parsed);
  } catch {
    return [];
  }
}

function saveLocalPostTags(tags: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
}

export async function loadPostTags(): Promise<string[]> {
  if (isMockMode) {
    return getLocalPostTags();
  }

  const { data, error } = await fetchPostTagsFromDb();
  if (error || !data) {
    return [];
  }

  return data.map((tag) => normalizePostTag(tag.name)).sort((a, b) => a.localeCompare(b));
}

export async function registerPostTags(tags: string[]): Promise<void> {
  if (tags.length === 0) {
    return;
  }

  if (isMockMode) {
    saveLocalPostTags(mergeUniquePostTags(getLocalPostTags(), tags));
    return;
  }

  const rows = mergeUniquePostTags([], tags).map((name) => ({
    name,
    name_key: postTagKey(name),
  }));

  const { error } = await registerPostTagsInDb(rows);
  if (error) {
    throw error;
  }
}

/** @deprecated Use loadPostTags() */
export function getPostTags(): string[] {
  return getLocalPostTags();
}
