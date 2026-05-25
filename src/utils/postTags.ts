import { fetchPostTags as fetchPostTagsFromDb, registerPostTags as registerPostTagsInDb } from '../services/db';
import { mergeUniquePostTags, normalizePostTag, postTagKey } from './postTagUtils';

export { normalizePostTag, postTagKey, searchPostTags } from './postTagUtils';

export async function loadPostTags(): Promise<string[]> {
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

  const rows = mergeUniquePostTags([], tags).map((name) => ({
    name,
    name_key: postTagKey(name),
  }));

  const { error } = await registerPostTagsInDb(rows);
  if (error) {
    throw error;
  }
}
