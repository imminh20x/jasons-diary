-- Blog database schema (run in Supabase Dashboard → SQL Editor)

-- 1. Posts table
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

CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);

-- 2. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- 3. Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Replace REPLACE_WITH_ADMIN_EMAIL with your Supabase Auth admin email before running.
CREATE OR REPLACE FUNCTION public.is_blog_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT coalesce(auth.jwt() ->> 'email', '') = 'REPLACE_WITH_ADMIN_EMAIL';
$$;

DROP POLICY IF EXISTS "Allow public read access to published posts" ON public.posts;
CREATE POLICY "Allow public read access to published posts"
ON public.posts
FOR SELECT
USING (is_published = true);

DROP POLICY IF EXISTS "Allow authenticated read access to all posts" ON public.posts;
DROP POLICY IF EXISTS "Allow admin read access to all posts" ON public.posts;
CREATE POLICY "Allow admin read access to all posts"
ON public.posts
FOR SELECT
USING (is_published = true OR public.is_blog_admin());

DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.posts;
DROP POLICY IF EXISTS "Allow admin insert access" ON public.posts;
CREATE POLICY "Allow admin insert access"
ON public.posts
FOR INSERT
WITH CHECK (public.is_blog_admin());

DROP POLICY IF EXISTS "Allow authenticated update access" ON public.posts;
DROP POLICY IF EXISTS "Allow admin update access" ON public.posts;
CREATE POLICY "Allow admin update access"
ON public.posts
FOR UPDATE
USING (public.is_blog_admin());

DROP POLICY IF EXISTS "Allow authenticated delete access" ON public.posts;
DROP POLICY IF EXISTS "Allow admin delete access" ON public.posts;
CREATE POLICY "Allow admin delete access"
ON public.posts
FOR DELETE
USING (public.is_blog_admin());

-- 4. Post tags registry (admin autocomplete)
CREATE TABLE IF NOT EXISTS public.post_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT post_tags_name_key_unique UNIQUE (name_key)
);

CREATE INDEX IF NOT EXISTS idx_post_tags_name ON public.post_tags(name);

ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read access to post tags" ON public.post_tags;
DROP POLICY IF EXISTS "Allow admin read access to post tags" ON public.post_tags;
CREATE POLICY "Allow admin read access to post tags"
ON public.post_tags
FOR SELECT
USING (public.is_blog_admin());

DROP POLICY IF EXISTS "Allow authenticated insert access to post tags" ON public.post_tags;
DROP POLICY IF EXISTS "Allow admin insert access to post tags" ON public.post_tags;
CREATE POLICY "Allow admin insert access to post tags"
ON public.post_tags
FOR INSERT
WITH CHECK (public.is_blog_admin());
