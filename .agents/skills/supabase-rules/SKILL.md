---
name: supabase-rules
description: SQL queries and configuration needed to establish the blog database, storage, and security policies (RLS).
---

# Supabase Database Setup & Security (RLS)

This skill guide provides the step-by-step SQL queries and configuration needed to establish the blog database, storage, and security policies.

## 1. SQL Database Setup
Copy and run the following script in the **SQL Editor** on the Supabase Dashboard:

```sql
-- 1. Create the posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    thumbnail_url TEXT,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);

-- 3. Create a function and trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 5. Define policies for posts table
-- Policy: Allow everyone (anon and authenticated) to read published posts
CREATE POLICY "Allow public read access to published posts" 
ON public.posts 
FOR SELECT 
USING (is_published = true);

-- Policy: Allow authenticated users (admin) to read unpublished draft posts
CREATE POLICY "Allow authenticated read access to all posts" 
ON public.posts 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users (admin) to insert new posts
CREATE POLICY "Allow authenticated insert access" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users (admin) to update existing posts
CREATE POLICY "Allow authenticated update access" 
ON public.posts 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users (admin) to delete posts
CREATE POLICY "Allow authenticated delete access" 
ON public.posts 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- 6. Post tags registry (admin autocomplete)
CREATE TABLE IF NOT EXISTS public.post_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT post_tags_name_key_unique UNIQUE (name_key)
);

CREATE INDEX IF NOT EXISTS idx_post_tags_name ON public.post_tags(name);

ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access to post tags"
ON public.post_tags
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert access to post tags"
ON public.post_tags
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
```

## 2. Storage Setup (Images Bucket)
For uploading blog thumbnails or post images:
1.  Go to **Storage** on the Supabase Sidebar.
2.  Click **New Bucket** and name it `blog-images`.
3.  Set the bucket to **Public** (so readers can view the images via URL).
4.  Go to **Policies** (under Storage) and create policies:
    *   **Select Policy**: Allow anyone (anon) to select/read files.
        *   Allowed operation: `SELECT`
        *   Target: `public`
    *   **Insert/Update/Delete Policy**: Only authenticated users (you, the Admin) can upload, update, or delete.
        *   Allowed operations: `INSERT`, `UPDATE`, `DELETE`
        *   Target: `authenticated` role (`auth.role() = 'authenticated'`)

## 3. Connecting React with Supabase Client
In the React application, initialize the Supabase client:

```javascript
// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase env variables are missing. Using mock backend fallback.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
```
