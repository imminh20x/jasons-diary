import {
  createPost,
  deletePost as deleteDbPost,
  fetchPostById,
  fetchPostBySlug,
  fetchPosts,
  updatePost,
} from './db';
import { mapBlogPostToDbPayload, mapDbPostToBlogPost } from './postMappers';
import type { BlogPost, SaveBlogPostInput } from '../types/post';

export type { BlogPost, SaveBlogPostInput } from '../types/post';

type PostsCacheKey = 'published' | 'all';

const postsCache = new Map<PostsCacheKey, BlogPost[]>();
const postsInflight = new Map<PostsCacheKey, Promise<BlogPost[]>>();
const postsBySlugCache = new Map<string, BlogPost>();
const postBySlugInflight = new Map<string, Promise<BlogPost | undefined>>();

const SESSION_PUBLISHED_POSTS_KEY = 'blog_published_posts_v1';

const cacheKey = (options?: { includeDrafts?: boolean }): PostsCacheKey =>
  options?.includeDrafts ? 'all' : 'published';

const stripContentForListCache = (posts: BlogPost[]): Omit<BlogPost, 'content'>[] =>
  posts.map((post) => {
    const { content: _ignored, ...rest } = post;
    return rest;
  });

const restorePostsFromListCache = (posts: Omit<BlogPost, 'content'>[]): BlogPost[] =>
  posts.map((post) => ({ ...post, content: '' }));

const indexPostsInSlugCache = (posts: BlogPost[]): void => {
  posts.forEach((post) => {
    postsBySlugCache.set(post.slug, post);
  });
};

const hydratePublishedPostsFromSession = (): void => {
  if (postsCache.has('published') || typeof sessionStorage === 'undefined') {
    return;
  }

  try {
    const raw = sessionStorage.getItem(SESSION_PUBLISHED_POSTS_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw) as Omit<BlogPost, 'content'>[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return;
    }

    const posts = restorePostsFromListCache(parsed);
    postsCache.set('published', posts);
    indexPostsInSlugCache(posts);
  } catch {
    sessionStorage.removeItem(SESSION_PUBLISHED_POSTS_KEY);
  }
};

const persistPublishedPostsToSession = (posts: BlogPost[]): void => {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  try {
    sessionStorage.setItem(
      SESSION_PUBLISHED_POSTS_KEY,
      JSON.stringify(stripContentForListCache(posts)),
    );
  } catch {
    // Ignore quota errors — in-memory cache still works for this session.
  }
};

hydratePublishedPostsFromSession();

export function getCachedPosts(options?: { includeDrafts?: boolean }): BlogPost[] | undefined {
  return postsCache.get(cacheKey(options));
}

export function getCachedPostBySlug(slug: string): BlogPost | undefined {
  const cached = postsBySlugCache.get(slug);
  if (cached && cached.content !== '') {
    return cached;
  }

  for (const key of ['published', 'all'] as PostsCacheKey[]) {
    const posts = postsCache.get(key);
    const found = posts?.find((post) => post.slug === slug);
    if (found && found.content !== '') {
      postsBySlugCache.set(slug, found);
      return found;
    }
  }

  return undefined;
}

export function invalidatePostsCache(): void {
  postsCache.clear();
  postsInflight.clear();
  postsBySlugCache.clear();
  postBySlugInflight.clear();
  sessionStorage.removeItem(SESSION_PUBLISHED_POSTS_KEY);
}

const fetchAndCachePosts = async (key: PostsCacheKey, options?: { includeDrafts?: boolean }): Promise<BlogPost[]> => {
  const { data, error } = await fetchPosts(options);
  const posts = error || !data ? [] : data.map(mapDbPostToBlogPost);
  postsCache.set(key, posts);
  indexPostsInSlugCache(posts);

  if (key === 'published') {
    persistPublishedPostsToSession(posts);
  }

  return posts;
};

export async function getPosts(options?: { includeDrafts?: boolean; revalidate?: boolean }): Promise<BlogPost[]> {
  const key = cacheKey(options);
  const cached = postsCache.get(key);

  if (cached && !options?.revalidate) {
    return cached;
  }

  const inflight = postsInflight.get(key);
  if (inflight) {
    return inflight;
  }

  const request = fetchAndCachePosts(key, options)
    .finally(() => {
      postsInflight.delete(key);
    });

  postsInflight.set(key, request);
  return request;
}

export function prefetchPublishedPosts(): Promise<BlogPost[]> {
  const cached = postsCache.get('published');
  if (cached?.length) {
    void getPosts({ revalidate: true });
    return Promise.resolve(cached);
  }

  return getPosts();
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const cached = getCachedPostBySlug(slug);
  if (cached) {
    return cached;
  }

  const inflight = postBySlugInflight.get(slug);
  if (inflight) {
    return inflight;
  }

  const request = fetchPostBySlug(slug)
    .then(({ data, error }) => {
      postBySlugInflight.delete(slug);
      if (error || !data) {
        return undefined;
      }
      const post = mapDbPostToBlogPost(data);
      postsBySlugCache.set(slug, post);
      return post;
    })
    .catch((err) => {
      postBySlugInflight.delete(slug);
      throw err;
    });

  postBySlugInflight.set(slug, request);
  return request;
}

export async function getPostById(id: string): Promise<BlogPost | undefined> {
  const { data, error } = await fetchPostById(id);
  if (error || !data) {
    return undefined;
  }
  return mapDbPostToBlogPost(data);
}

export async function savePost(post: SaveBlogPostInput): Promise<BlogPost | null> {
  const payload = mapBlogPostToDbPayload(post);

  let saved: BlogPost | null = null;

  if (post.id) {
    const { data, error } = await updatePost(post.id, payload);
    if (error || !data) {
      return null;
    }
    saved = mapDbPostToBlogPost(data);
  } else {
    const { data, error } = await createPost(payload);
    if (error || !data) {
      return null;
    }
    saved = mapDbPostToBlogPost(data);
  }

  invalidatePostsCache();
  return saved;
}

export async function deletePost(id: string): Promise<boolean> {
  const { error } = await deleteDbPost(id);
  if (error) {
    return false;
  }

  invalidatePostsCache();
  return true;
}
