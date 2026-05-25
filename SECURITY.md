# Security & data isolation

This document explains why cloning this repository does **not** give access to the original author's live blog data, and how to deploy your own isolated instance safely.

## What is NOT in GitHub

The repository intentionally excludes:

| Item | Where it lives instead |
|------|------------------------|
| Supabase URL & anon key | `.env` (gitignored) or Vercel env vars |
| Real contact email & phone | `VITE_CONTACT_*` in `.env` / Vercel |
| Social profile URLs | `VITE_GITHUB_URL`, etc. in `.env` / Vercel |
| Admin password | Supabase Auth (your own user) |
| Published posts & tags | Your Supabase project |
| `.playwright-mcp/` debug dumps | Local machine only (gitignored) |

Run `npm run check:secrets` before pushing to verify no known personal patterns remain in tracked files.

## What happens when someone clones this repo

1. They get **source code** only — no posts, credentials, or live data.
2. Without a `.env` file with valid Supabase credentials, the app **cannot load or save posts**.
3. Admin login uses **Supabase Auth** — they must create their own admin user in their own Supabase project.
4. To run the blog, they must create **their own** Supabase project, run the SQL migrations, and add credentials to `.env`.

**Cloning the repo does not connect to your Supabase, Vercel env, or any private data.**

## Production deployment (your instance)

### Vercel environment variables

Set these in Vercel → Project → Settings → Environment Variables (never commit them):

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_CONTACT_EMAIL=your-real-email@example.com
VITE_CONTACT_PHONE=+84...
VITE_GITHUB_URL=https://github.com/your-username
VITE_LINKEDIN_URL=https://linkedin.com/in/your-username
VITE_FACEBOOK_URL=https://facebook.com/your-profile
```

Redeploy after adding variables — Vite bakes env vars in at build time.

### Supabase Row Level Security

Before running `supabase/schema.sql`, replace `REPLACE_WITH_ADMIN_EMAIL` with the email of your Supabase Auth admin user.

RLS policies ensure:

- **Public** can read **published** posts only.
- **Only your admin email** can read drafts, insert, update, delete posts, and manage `post_tags`.
- Random authenticated Supabase users **cannot** modify your blog.

### Never commit

- `.env`, `.env.local`, or any file containing real API keys
- `service_role` keys (server-only; this frontend uses the **anon** key only)
- Personal phone/email in source code — use `VITE_*` env vars instead

## Reporting issues

If you believe sensitive data was accidentally committed, rotate your Supabase keys immediately in the Supabase dashboard and update Vercel env vars.
