-- Run once in Supabase SQL Editor if admin RLS still uses the placeholder email.
-- Replace REPLACE_WITH_ADMIN_EMAIL with your Supabase Auth admin email before running.

CREATE OR REPLACE FUNCTION public.is_blog_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT coalesce(auth.jwt() ->> 'email', '') = 'REPLACE_WITH_ADMIN_EMAIL';
$$;
