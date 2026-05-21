const UNSPLASH_HOST = 'images.unsplash.com';

export function getOptimizedCoverImage(url: string, width = 800): string {
  if (url.startsWith('data:') || !url.includes(UNSPLASH_HOST)) {
    return url;
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    parsed.searchParams.set('q', '75');
    parsed.searchParams.set('w', String(width));
    return parsed.toString();
  } catch {
    return url;
  }
}
