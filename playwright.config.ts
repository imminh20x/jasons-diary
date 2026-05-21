import { defineConfig, devices } from '@playwright/test';

const testPublicEnv = {
  VITE_CONTACT_EMAIL: 'you@example.com',
  VITE_CONTACT_PHONE: '+10000000000',
  VITE_GITHUB_URL: 'https://github.com/your-username',
  VITE_LINKEDIN_URL: 'https://linkedin.com/in/your-username',
};

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
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
