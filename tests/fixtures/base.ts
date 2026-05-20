import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { AdminPage } from '../pages/admin.page';
import { EditPostPage } from '../pages/edit-post.page';
import { HomePage } from '../pages/home.page';
import { AboutPage } from '../pages/about.page';
import { PostDetailPage } from '../pages/post-detail.page';

type Pages = {
  loginPage: LoginPage;
  adminPage: AdminPage;
  editPostPage: EditPostPage;
  homePage: HomePage;
  aboutPage: AboutPage;
  postDetailPage: PostDetailPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },
  editPostPage: async ({ page }, use) => {
    await use(new EditPostPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  aboutPage: async ({ page }, use) => {
    await use(new AboutPage(page));
  },
  postDetailPage: async ({ page }, use) => {
    await use(new PostDetailPage(page));
  },

  // Setup diagnostic monitoring as an auto-use fixture
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('app_language', 'en');
      window.localStorage.setItem('app_theme', 'light');
    });

    const consoleMessages: string[] = [];
    const pageErrors: Error[] = [];
    const failedRequests: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      // Ignore normal expected warnings or browser warnings
      if (text.includes('Supabase env variables are missing') || text.includes('[locatorjs]')) {
        return;
      }
      if (msg.type() === 'error') {
        consoleMessages.push(`[${msg.type().toUpperCase()}] ${text}`);
      }
    });

    page.on('pageerror', err => {
      pageErrors.push(err);
    });

    page.on('response', response => {
      const status = response.status();
      if (status >= 400) {
        failedRequests.push(`${response.url()} (Status ${status})`);
      }
    });

    await use(page);

    // Assert diagnostics in teardown
    expect(pageErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(consoleMessages).toEqual([]);
  }
});

export { expect } from '@playwright/test';
