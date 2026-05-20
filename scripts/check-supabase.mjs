import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

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

const fileEnv = loadEnvFile(ENV_PATH);
const url = process.env.VITE_SUPABASE_URL ?? fileEnv.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? fileEnv.VITE_SUPABASE_ANON_KEY;

console.log('Supabase connection check\n');

if (!existsSync(ENV_PATH)) {
  console.log('⚠  No .env file found. Copy .env.example to .env first.');
}

if (isPlaceholder(url) || isPlaceholder(anonKey)) {
  console.error('✗  VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing or still a placeholder.');
  console.error('   Get credentials: Supabase Dashboard → Project Settings → API');
  process.exit(1);
}

console.log(`→ Project URL: ${url}`);

const supabase = createClient(url, anonKey);

const { error: postsError } = await supabase.from('posts').select('id').limit(1);

if (postsError) {
  if (postsError.code === 'PGRST205' || postsError.message?.includes('posts')) {
    console.error('✗  Connected, but table "posts" not found.');
    console.error('   Run supabase/schema.sql in the Supabase SQL Editor.');
  } else {
    console.error('✗  Database error:', postsError.message);
  }
  process.exit(1);
}

const { data: buckets, error: storageError } = await supabase.storage.listBuckets();

if (storageError) {
  console.warn('⚠  Storage check skipped:', storageError.message);
} else {
  const hasBlogImages = buckets?.some((b) => b.name === 'blog-images' || b.id === 'blog-images');
  if (!hasBlogImages) {
    console.warn('⚠  Bucket "blog-images" not found. Run supabase/storage.sql.');
  } else {
    console.log('→ Storage bucket "blog-images": OK');
  }
}

console.log('✓  Supabase connection successful (posts table reachable).');
console.log('   Restart dev server (npm run dev) so Vite picks up .env changes.');
