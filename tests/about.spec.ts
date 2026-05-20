import { test, expect } from './fixtures/base';
import { SITE } from './constants/site';

test.describe('About Me Portfolio Page E2E', () => {
  test.beforeEach(async ({ aboutPage }) => {
    await aboutPage.goto();
  });

  test('should display name, title, bio, and visual profile container', async ({ aboutPage }) => {
    await expect(aboutPage.nameHeading).toBeVisible();
    await expect(aboutPage.nameHeading).toHaveText(SITE.authorName);
    await expect(aboutPage.page.locator('.about-title')).toHaveText(SITE.authorTitle);
    await expect(aboutPage.page.getByText(/QA\/QC field/i)).toBeVisible();
    await expect(aboutPage.avatarImage).toBeVisible();
  });

  test('should contain valid and working contact details and social links', async ({ aboutPage }) => {
    await expect(aboutPage.emailLink).toBeVisible();
    await expect(aboutPage.emailLink).toHaveAttribute('href', SITE.email);

    await expect(aboutPage.githubLink).toBeVisible();
    await expect(aboutPage.githubLink).toHaveAttribute('href', SITE.github);

    await expect(aboutPage.linkedinLink).toBeVisible();
    await expect(aboutPage.linkedinLink).toHaveAttribute('href', SITE.linkedin);
  });

  test('should show skills grid containing AI, QA, and SQL categories', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'AI', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'QA & QC' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'SQL', exact: true })).toBeVisible();

    await expect(page.getByText('Playwright E2E')).toBeVisible();
    await expect(page.getByText('PostgreSQL')).toBeVisible();
    await expect(page.getByText('MCP')).toBeVisible();
  });

  test('should display professional journey timeline', async ({ page }) => {
    await expect(page.getByText('Experience', { exact: true })).toBeVisible();
    await expect(page.locator('.timeline').getByText('TripOTA Company')).toBeVisible();
    await expect(page.locator('.timeline-role').filter({ hasText: 'QA/QC Engineer' }).first()).toBeVisible();
    await expect(page.getByText('Can Tho University')).toBeVisible();
    await expect(page.getByText('Software Engineering')).toBeVisible();
  });
});
