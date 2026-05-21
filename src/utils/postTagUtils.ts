export function normalizePostTag(tag: string): string {
  return tag.trim().replace(/\s+/g, ' ');
}

export function postTagKey(tag: string): string {
  return normalizePostTag(tag).toLowerCase();
}

export function searchPostTags(
  query: string,
  selectedTags: string[],
  availableTags: string[]
): string[] {
  const selectedKeys = new Set(selectedTags.map((tag) => postTagKey(tag)));
  const normalizedQuery = query.trim().toLowerCase();

  return availableTags.filter((tag) => {
    if (selectedKeys.has(postTagKey(tag))) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return tag.toLowerCase().includes(normalizedQuery);
  });
}

export function mergeUniquePostTags(existingTags: string[], incomingTags: string[]): string[] {
  const byKey = new Map(existingTags.map((tag) => [postTagKey(tag), normalizePostTag(tag)]));

  for (const tag of incomingTags) {
    const normalized = normalizePostTag(tag);
    if (!normalized) {
      continue;
    }

    const key = postTagKey(normalized);
    if (!byKey.has(key)) {
      byKey.set(key, normalized);
    }
  }

  return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b));
}
