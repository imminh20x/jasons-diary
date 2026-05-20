# Backend & Database Agent Rules & Guidelines

This document outlines specific guidelines and rules for the **Backend & Database Agent (BE)**.

## 1. Core Technical Mandates
*   **Database & Backend Service**: Supabase (PostgreSQL, Auth, and Storage).
*   **SDK**: `@supabase/supabase-js` client library.
*   **Environment Variables**:
    *   `VITE_SUPABASE_URL`: The Supabase project URL.
    *   `VITE_SUPABASE_ANON_KEY`: The Supabase anon/public API key.
    *   Variables must be loaded in a secure configuration module, verifying their existence at startup.

## 2. Database Schema Guidelines
*   **Tables & Naming**: Use snake_case for tables and column names (e.g., `posts`, `created_at`, `is_published`).
*   **Post Schema (Minimum)**:
    *   `id` (uuid, primary key, default: `gen_random_uuid()`)
    *   `title` (text, not null)
    *   `slug` (text, unique, not null)
    *   `content` (text, not null)
    *   `summary` (text)
    *   `thumbnail_url` (text)
    *   `tags` (text[] or JSONB, default: empty array)
    *   `is_published` (boolean, default: `false`)
    *   `created_at` (timestamptz, default: `now()`)
    *   `updated_at` (timestamptz, default: `now()`)
*   **SQL Scripts**: Provide clear SQL setup scripts including table creation, indexes (e.g. index on `slug`), and triggers for automatically updating `updated_at`.

## 3. Authentication & Authorization (Security)
*   **Row Level Security (RLS)**:
    *   RLS must be enabled on all tables (e.g., `ALTER TABLE posts ENABLE ROW LEVEL SECURITY;`).
    *   **Read Policy**: Anyone (anonymous users) can read published posts.
        *   `CREATE POLICY "Allow public read access to published posts" ON posts FOR SELECT USING (is_published = true);`
    *   **Admin Write Policy**: Only authenticated users can insert, update, or delete posts.
        *   `CREATE POLICY "Allow authenticated insert" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');`
        *   `CREATE POLICY "Allow authenticated update" ON posts FOR UPDATE USING (auth.role() = 'authenticated');`
        *   `CREATE POLICY "Allow authenticated delete" ON posts FOR DELETE USING (auth.role() = 'authenticated');`
*   **Auth State Management**: Create a robust React `AuthContext` to expose `user`, `session`, `login`, `logout`, and `loading` states.

## 4. Supabase Storage (Image Upload)
*   Create a bucket named `blog-images`.
*   Ensure RLS policies for storage are set: public read access to files, but authenticated-only upload/delete access.
*   Implement clean error handling for uploads, checking file sizes and types (prefer images under 2MB, formats: jpeg, png, webp).

## 5. Error Handling & Validation
*   All backend database requests must be wrapped in `try/catch` blocks.
*   Return standard response objects to the Frontend: `{ data, error }`.
*   Validate data input before sending to Supabase (e.g. ensure `title` and `content` are not empty, `slug` is URL-friendly).
