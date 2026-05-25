function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env for Playwright admin tests.`);
  }
  return value;
}

export const TEST_ADMIN = {
  email: requireEnv('TEST_ADMIN_EMAIL', process.env.VITE_CONTACT_EMAIL),
  password: requireEnv('TEST_ADMIN_PASSWORD'),
} as const;
