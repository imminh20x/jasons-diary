/* eslint-disable */
import { getSupabase } from '../supabaseClient';
import { normalizePostTag, postTagKey } from '../utils/postTagUtils';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  thumbnail_url?: string;
  tags?: string[];
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PostTag {
  id: string;
  name: string;
  name_key: string;
  created_at?: string;
}

export const fetchPosts = async (options?: { includeDrafts?: boolean }): Promise<{ data: Post[] | null; error: any }> => {
  try {
    const supabase = await getSupabase();
    let query = supabase.from('posts').select('*');
    if (!options?.includeDrafts) {
      query = query.eq('is_published', true);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data: data as Post[], error };
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const fetchPostById = async (id: string): Promise<{ data: Post | null; error: any }> => {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return { data: data as Post, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const fetchPostBySlug = async (slug: string): Promise<{ data: Post | null; error: any }> => {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    return { data: data as Post, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const createPost = async (post: Omit<Post, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<{ data: Post | null; error: any }> => {
  try {
    if (!post.title || !post.title.trim()) {
      return { data: null, error: { message: 'Title is required.' } };
    }
    if (!post.content || !post.content.trim()) {
      return { data: null, error: { message: 'Content is required.' } };
    }
    if (!post.slug || !post.slug.trim()) {
      return { data: null, error: { message: 'Slug is required.' } };
    }

    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        ...post,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (!error && post.tags?.length) {
      await registerPostTags(
        post.tags.map((tag) => ({
          name: normalizePostTag(tag),
          name_key: postTagKey(tag),
        })),
      );
    }

    return { data: data as Post, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const updatePost = async (id: string, post: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Post | null; error: any }> => {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .update({
        ...post,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (!error && post.tags?.length) {
      await registerPostTags(
        post.tags.map((tag) => ({
          name: normalizePostTag(tag),
          name_key: postTagKey(tag),
        })),
      );
    }

    return { data: data as Post, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const deletePost = async (id: string): Promise<{ data: { id: string } | null; error: any }> => {
  try {
    const supabase = await getSupabase();
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
    if (error) return { data: null, error };
    return { data: { id }, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const fetchPostTags = async (): Promise<{ data: PostTag[] | null; error: any }> => {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('post_tags')
      .select('*')
      .order('name', { ascending: true });

    return { data: data as PostTag[], error };
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const registerPostTags = async (
  tags: Array<Pick<PostTag, 'name' | 'name_key'>>,
): Promise<{ error: any }> => {
  try {
    if (tags.length === 0) {
      return { error: null };
    }

    const supabase = await getSupabase();
    const { error } = await supabase
      .from('post_tags')
      .upsert(tags, { onConflict: 'name_key', ignoreDuplicates: true });

    return { error };
  } catch (err: any) {
    return { error: err };
  }
};

export const uploadImage = async (file: File): Promise<{ data: { url: string } | null; error: any }> => {
  try {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { data: null, error: { message: 'Invalid file format. Please upload JPEG, PNG, or WEBP.' } };
    }

    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { data: null, error: { message: 'File size exceeds the 2MB limit.' } };
    }

    const supabase = await getSupabase();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    const { data } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    return { data: { url: data.publicUrl }, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
};
