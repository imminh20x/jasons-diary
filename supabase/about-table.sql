-- Create About Profile table (run in Supabase Dashboard → SQL Editor)
CREATE TABLE IF NOT EXISTS public.about_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lang TEXT UNIQUE NOT NULL, -- 'vi' or 'en'
    avatar_url TEXT,
    eyebrow TEXT,
    name TEXT,
    title TEXT,
    bio TEXT,
    skills JSONB,
    jobs JSONB,
    certs JSONB,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.about_profile ENABLE ROW LEVEL SECURITY;

-- 1. Allow public select access to the about profile
DROP POLICY IF EXISTS "Allow public read access to about profile" ON public.about_profile;
CREATE POLICY "Allow public read access to about profile"
ON public.about_profile
FOR SELECT
USING (true);

-- 2. Allow admin insert access (wrapped in select subquery for caching performance)
DROP POLICY IF EXISTS "Allow admin insert access to about profile" ON public.about_profile;
CREATE POLICY "Allow admin insert access to about profile"
ON public.about_profile
FOR INSERT
WITH CHECK ((select public.is_blog_admin()));

-- 3. Allow admin update access
DROP POLICY IF EXISTS "Allow admin update access to about profile" ON public.about_profile;
CREATE POLICY "Allow admin update access to about profile"
ON public.about_profile
FOR UPDATE
USING ((select public.is_blog_admin()));

-- 4. Allow admin delete access
DROP POLICY IF EXISTS "Allow admin delete access to about profile" ON public.about_profile;
CREATE POLICY "Allow admin delete access to about profile"
ON public.about_profile
FOR DELETE
USING ((select public.is_blog_admin()));
