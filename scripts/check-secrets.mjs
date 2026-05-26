import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

const FORBIDDEN_PATTERNS = [
  { label: 'Gmail address', pattern: /imminh20x@gmail\.com/i },
  { label: 'Personal phone', pattern: /\+84899690883|899\s*690\s*883/i },
  { label: 'Supabase publishable key', pattern: /sb_publishable_[A-Za-z0-9_]+/ },
  {
    label: 'Supabase project URL',
    pattern: /https:\/\/(?!your-project-id)[a-z0-9]{8,}\.supabase\.co/i,
  },
  { label: 'Service role key', pattern: /service_role/i, skipMarkdown: true },
  { label: 'Private Supabase JWT', pattern: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/ },
];

function getTrackedFiles() {
  return execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

const files = getTrackedFiles();
const violations = [];

for (const relativePath of files) {
  if (relativePath === 'scripts/check-secrets.mjs') {
    continue;
  }

  const absolutePath = resolve(ROOT, relativePath);
  if (!existsSync(absolutePath)) {
    continue;
  }

  const content = readFileSync(absolutePath, 'utf8');

  for (const { label, pattern, skipMarkdown } of FORBIDDEN_PATTERNS) {
    if (skipMarkdown && relativePath.endsWith('.md')) {
      continue;
    }

    if (pattern.test(content)) {
      violations.push({ file: relativePath, label });
    }
  }
}

if (violations.length > 0) {
  console.error('Secret / personal-data check failed:\n');
  for (const violation of violations) {
    console.error(`- ${violation.label} found in ${violation.file}`);
  }
  console.error('\nRemove sensitive values from tracked files and store them in .env instead.');
  process.exit(1);
}

console.log('✓  No known sensitive patterns in tracked git files.');
