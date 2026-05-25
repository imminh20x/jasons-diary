export type PostStatus = 'draft' | 'published';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string[];
  status: PostStatus;
  publishedAt: string;
  coverImage: string;
  author: string;
}

export type SaveBlogPostInput = Omit<BlogPost, 'publishedAt' | 'id'> & { id?: string };
