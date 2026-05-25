import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const ENV_PATH = resolve(ROOT, '.env');

const PLACEHOLDER_PATTERNS = [
  'your-project-id',
  'your-anon-public-api-key',
  'placeholder',
];

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = value;
  }
  return env;
}

function isPlaceholder(value) {
  if (!value) return true;
  const lower = value.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((p) => lower.includes(p));
}

function supabaseHeaders(anonKey) {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
  };
}

async function queryTable(baseUrl, anonKey, table) {
  const response = await fetch(`${baseUrl}/rest/v1/${table}?select=id&limit=1`, {
    headers: supabaseHeaders(anonKey),
  });

  if (response.ok) {
    return { ok: true };
  }

  let body = {};
  try {
    body = await response.json();
  } catch {
    body = { message: await response.text() };
  }

  return { ok: false, status: response.status, body };
}

const fileEnv = loadEnvFile(ENV_PATH);
const url = process.env.VITE_SUPABASE_URL ?? fileEnv.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? fileEnv.VITE_SUPABASE_ANON_KEY;

console.log('Supabase connection check\n');

if (!existsSync(ENV_PATH)) {
  console.log('⚠  No .env file found. Create .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

if (isPlaceholder(url) || isPlaceholder(anonKey)) {
  console.error('✗  VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing or still a placeholder.');
  console.error('   Get credentials: Supabase Dashboard → Project Settings → API');
  process.exit(1);
}

console.log(`→ Project URL: ${url}`);

const postsResult = await queryTable(url, anonKey, 'posts');

if (!postsResult.ok) {
  if (postsResult.body?.code === 'PGRST205' || postsResult.body?.message?.includes('posts')) {
    console.error('✗  Connected, but table "posts" not found.');
    console.error('   Run supabase/schema.sql in the Supabase SQL Editor.');
  } else if (postsResult.status === 401 || postsResult.status === 403) {
    console.error('✗  Auth failed. Check VITE_SUPABASE_ANON_KEY in .env.');
    console.error('   ', postsResult.body?.message ?? postsResult.status);
  } else {
    console.error('✗  Database error:', postsResult.body?.message ?? postsResult.status);
  }
  process.exit(1);
}

// Anon key cannot list all buckets (GET /storage/v1/bucket returns []).
// Probe the specific bucket via object list instead.
const bucketResponse = await fetch(`${url}/storage/v1/object/list/blog-images`, {
  method: 'POST',
  headers: {
    ...supabaseHeaders(anonKey),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ prefix: '', limit: 1, offset: 0 }),
});

if (bucketResponse.status === 404) {
  console.warn('⚠  Bucket "blog-images" not found. Run supabase/storage.sql.');
} else if (!bucketResponse.ok) {
  console.warn('⚠  Storage check skipped:', bucketResponse.status, await bucketResponse.text());
} else {
  console.log('→ Storage bucket "blog-images": OK');
}

console.log('✓  Supabase connection successful (posts table reachable).');

const postTagsResult = await queryTable(url, anonKey, 'post_tags');

if (!postTagsResult.ok) {
  if (postTagsResult.body?.code === 'PGRST205' || postTagsResult.body?.message?.includes('post_tags')) {
    console.warn('⚠  Table "post_tags" not found. Re-run supabase/schema.sql in the SQL Editor.');
  } else {
    console.warn('⚠  post_tags check skipped:', postTagsResult.body?.message ?? postTagsResult.status);
  }
} else {
  console.log('→ Table "post_tags": OK');
}

console.log('   Restart dev server (npm run dev) so Vite picks up .env changes.');
