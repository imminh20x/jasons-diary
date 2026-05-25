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

const cacheKey = (options?: { includeDrafts?: boolean }): PostsCacheKey =>
  options?.includeDrafts ? 'all' : 'published';

export function getCachedPosts(options?: { includeDrafts?: boolean }): BlogPost[] | undefined {
  return postsCache.get(cacheKey(options));
}

export function invalidatePostsCache(): void {
  postsCache.clear();
  postsInflight.clear();
}

export async function getPosts(options?: { includeDrafts?: boolean }): Promise<BlogPost[]> {
  const key = cacheKey(options);
  const cached = postsCache.get(key);
  if (cached) {
    return cached;
  }

  const inflight = postsInflight.get(key);
  if (inflight) {
    return inflight;
  }

  const request = fetchPosts(options)
    .then(({ data, error }) => {
      const posts = error || !data ? [] : data.map(mapDbPostToBlogPost);
      postsCache.set(key, posts);
      postsInflight.delete(key);
      return posts;
    })
    .catch((err) => {
      postsInflight.delete(key);
      throw err;
    });

  postsInflight.set(key, request);
  return request;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const { data, error } = await fetchPostBySlug(slug);
  if (error || !data) {
    return undefined;
  }
  return mapDbPostToBlogPost(data);
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
