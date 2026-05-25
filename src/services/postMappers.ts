import type { Post as DbPost } from './db';
import type { BlogPost, SaveBlogPostInput } from '../types/post';
import { SITE_AUTHOR } from '../constants/siteAuthor';

export const mapDbPostToBlogPost = (row: DbPost): BlogPost => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  summary: row.summary ?? '',
  content: row.content,
  tags: row.tags ?? [],
  status: row.is_published ? 'published' : 'draft',
  publishedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
  coverImage: row.thumbnail_url ?? '',
  author: SITE_AUTHOR.name,
});

export const mapBlogPostToDbPayload = (
  post: SaveBlogPostInput,
): Omit<DbPost, 'id' | 'created_at' | 'updated_at'> => ({
  title: post.title,
  slug: post.slug,
  summary: post.summary,
  content: post.content,
  tags: post.tags,
  thumbnail_url: post.coverImage || undefined,
  is_published: post.status === 'published',
});
