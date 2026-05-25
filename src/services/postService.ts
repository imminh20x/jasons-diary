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

export async function getPosts(options?: { includeDrafts?: boolean }): Promise<BlogPost[]> {
  const { data, error } = await fetchPosts(options);
  if (error || !data) {
    return [];
  }
  return data.map(mapDbPostToBlogPost);
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

  if (post.id) {
    const { data, error } = await updatePost(post.id, payload);
    if (error || !data) {
      return null;
    }
    return mapDbPostToBlogPost(data);
  }

  const { data, error } = await createPost(payload);
  if (error || !data) {
    return null;
  }
  return mapDbPostToBlogPost(data);
}

export async function deletePost(id: string): Promise<boolean> {
  const { error } = await deleteDbPost(id);
  return !error;
}
