import { defineConfig, devices } from '@playwright/test';

const testPublicEnv = {
  VITE_SUPABASE_URL: 'https://your-project-id.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'your-anon-public-api-key',
  VITE_CONTACT_EMAIL: 'you@example.com',
  VITE_CONTACT_PHONE: '+10000000000',
  VITE_GITHUB_URL: 'https://github.com/your-username',
  VITE_LINKEDIN_URL: 'https://linkedin.com/in/your-username',
  VITE_FACEBOOK_URL: '',
};

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5199',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5199 --strictPort',
    url: 'http://localhost:5199',
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      ...process.env,
      ...testPublicEnv,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
