/* eslint-disable */
import { supabase, isMockMode } from '../supabaseClient';

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

const INITIAL_MOCK_POSTS: Post[] = [
  {
    id: "mock-post-1",
    title: "Designing for the Modern Web: Glassmorphism and Depth",
    slug: "designing-for-the-modern-web",
    summary: "Explore the aesthetic choices behind high-end premium web applications, from smooth backdrop filters to subtle glowing borders.",
    content: `# Designing for the Modern Web: Glassmorphism and Depth

In today's digital landscape, modern premium design is defined by subtle cues of depth, hierarchy, and tactile feedback. One of the most popular patterns is **Glassmorphism**.

## What is Glassmorphism?
Glassmorphism combines frosted-glass backgrounds with rich gradients to create a sense of vertical layers.

\`\`\`css
.card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
\`\`\`

## Key Guidelines:
1. **Contrast**: Always ensure readable contrast between text and blurred background.
2. **Subtlety**: Keep the border thin (e.g. 1px) and the background opacity low (e.g. 5-10%).
3. **Layering**: Stack cards carefully to maintain proper spatial depth.`,
    thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
    tags: ["Design", "CSS", "Frontend"],
    is_published: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: "mock-post-2",
    title: "Mastering React 19 Server Actions & Suspense",
    slug: "mastering-react-19-server-actions",
    summary: "An in-depth look into the new capabilities of React 19, including server-first behaviors and asynchronous form handling.",
    content: `# Mastering React 19 Server Actions & Suspense

React 19 introduces a streamlined approach to mutating data and handling transitions. By integrating form states directly with server-side executions, developers can write cleaner code with fewer manual loaders.

## Key Enhancements
* **Server Actions**: Native async mutations directly inside elements.
* **useActionState**: Easily handle loading and error states for forms.
* **Document Metadata**: Native support for HTML tags like \`<title>\` and \`<meta>\` directly inside component trees.

Here is a quick look at a form utilizing the new capabilities:

\`\`\`tsx
import { useActionState } from 'react';

function Form() {
  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    // Perform mutations...
  }, null);
}
\`\`\`

With these improvements, React applications are faster and more intuitive to build.`,
    thumbnail_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
    tags: ["React", "JavaScript", "Tech"],
    is_published: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  }
];

// Helper to initialize local storage mock posts
const getMockPosts = (): Post[] => {
  const postsStr = localStorage.getItem('mock_posts');
  if (!postsStr) {
    localStorage.setItem('mock_posts', JSON.stringify(INITIAL_MOCK_POSTS));
    return INITIAL_MOCK_POSTS;
  }
  try {
    return JSON.parse(postsStr);
  } catch (e) {
    console.error("Failed to parse mock posts from localStorage, resetting", e);
    localStorage.setItem('mock_posts', JSON.stringify(INITIAL_MOCK_POSTS));
    return INITIAL_MOCK_POSTS;
  }
};

const saveMockPosts = (posts: Post[]) => {
  localStorage.setItem('mock_posts', JSON.stringify(posts));
};

export const fetchPosts = async (options?: { includeDrafts?: boolean }): Promise<{ data: Post[] | null; error: any }> => {
  try {
    if (isMockMode) {
      const posts = getMockPosts();
      const filtered = options?.includeDrafts ? posts : posts.filter(p => p.is_published);
      // Sort by created_at desc
      const sorted = filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      return { data: sorted, error: null };
    } else {
      let query = supabase.from('posts').select('*');
      if (!options?.includeDrafts) {
        query = query.eq('is_published', true);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      return { data: data as Post[], error };
    }
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const fetchPostBySlug = async (slug: string): Promise<{ data: Post | null; error: any }> => {
  try {
    if (isMockMode) {
      const posts = getMockPosts();
      const post = posts.find(p => p.slug === slug);
      if (!post) {
        return { data: null, error: { message: `Post with slug "${slug}" not found` } };
      }
      return { data: post, error: null };
    } else {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      return { data: data as Post, error };
    }
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const createPost = async (post: Omit<Post, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<{ data: Post | null; error: any }> => {
  try {
    // Basic validation
    if (!post.title || !post.title.trim()) {
      return { data: null, error: { message: "Title is required." } };
    }
    if (!post.content || !post.content.trim()) {
      return { data: null, error: { message: "Content is required." } };
    }
    if (!post.slug || !post.slug.trim()) {
      return { data: null, error: { message: "Slug is required." } };
    }

    if (isMockMode) {
      const posts = getMockPosts();
      if (posts.some(p => p.slug === post.slug)) {
        return { data: null, error: { message: `A post with slug "${post.slug}" already exists.` } };
      }
      const newPost: Post = {
        ...post,
        id: post.id || `mock-post-${Date.now()}`,
        tags: post.tags || [],
        is_published: post.is_published ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      posts.push(newPost);
      saveMockPosts(posts);
      return { data: newPost, error: null };
    } else {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          ...post,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      return { data: data as Post, error };
    }
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const updatePost = async (id: string, post: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Post | null; error: any }> => {
  try {
    if (isMockMode) {
      const posts = getMockPosts();
      const index = posts.findIndex(p => p.id === id);
      if (index === -1) {
        return { data: null, error: { message: "Post not found." } };
      }

      if (post.slug && posts.some(p => p.slug === post.slug && p.id !== id)) {
        return { data: null, error: { message: `A post with slug "${post.slug}" already exists.` } };
      }

      const updatedPost: Post = {
        ...posts[index],
        ...post,
        updated_at: new Date().toISOString()
      };
      posts[index] = updatedPost;
      saveMockPosts(posts);
      return { data: updatedPost, error: null };
    } else {
      const { data, error } = await supabase
        .from('posts')
        .update({
          ...post,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      return { data: data as Post, error };
    }
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const deletePost = async (id: string): Promise<{ data: { id: string } | null; error: any }> => {
  try {
    if (isMockMode) {
      const posts = getMockPosts();
      const filtered = posts.filter(p => p.id !== id);
      saveMockPosts(filtered);
      return { data: { id }, error: null };
    } else {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      if (error) return { data: null, error };
      return { data: { id }, error: null };
    }
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const uploadImage = async (file: File): Promise<{ data: { url: string } | null; error: any }> => {
  try {
    // 1. Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { data: null, error: { message: 'Invalid file format. Please upload JPEG, PNG, or WEBP.' } };
    }

    const maxSizeBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeBytes) {
      return { data: null, error: { message: 'File size exceeds the 2MB limit.' } };
    }

    if (isMockMode) {
      // Offline fallback: Convert file to Base64 data URL so it persists inside LocalStorage
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      return { data: { url }, error: null };
    } else {
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
    }
  } catch (err: any) {
    return { data: null, error: err };
  }
};
