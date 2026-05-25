import { test, expect } from './fixtures/base';
import { SITE } from './constants/site';

test.describe('Visitor Flow', () => {
  test('should load the home page and check header/footer layout elements', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.logoText).toBeVisible();
    await expect(homePage.logoText).toHaveText(SITE.logo);
    await expect(homePage.header).toBeVisible();

    await expect(homePage.homeNavLink.first()).toBeVisible();
    await expect(homePage.aboutNavLink).toBeVisible();
    await expect(homePage.themeToggleBtn).toBeVisible();

    await expect(homePage.footer).toBeVisible();
    await expect(homePage.footer).toContainText(SITE.logo);
    await expect(homePage.footer).toContainText('Đỗ Cao Minh');

    await expect(homePage.footerEmail).toHaveAttribute('href', SITE.email);
    await expect(homePage.footerPhone).toHaveAttribute('href', SITE.phone);
    await expect(homePage.footerGithub).toHaveAttribute('href', SITE.github);
  });

  test('should filter posts using search bar', async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.postsList).toBeVisible();

    const initialCards = homePage.allCards();
    const initialCount = await initialCards.count();
    test.skip(initialCount === 0, 'No published posts in Supabase yet');

    const firstTitle = await initialCards.first().locator('.card-title, .featured-title').first().textContent();
    expect(firstTitle).toBeTruthy();

    const searchTerm = firstTitle!.trim().split(' ').slice(0, 2).join(' ');
    await homePage.searchFor(searchTerm);

    const filteredCards = homePage.allCards();
    expect(await filteredCards.count()).toBeGreaterThan(0);
    expect(await filteredCards.count()).toBeLessThanOrEqual(initialCount);

    await homePage.searchFor('');
    expect(await homePage.allCards().count()).toBe(initialCount);
  });

  test('should filter posts using category pills', async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.postsList).toBeVisible();

    const initialCount = await homePage.allCards().count();
    test.skip(initialCount === 0, 'No published posts in Supabase yet');

    const firstTag = await homePage.page.locator('.tag-pill').first().textContent();
    expect(firstTag).toBeTruthy();

    await homePage.clickCategory(firstTag!.trim().toLowerCase());

    const filteredCards = homePage.allCards();
    const filteredCount = await filteredCards.count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    await homePage.clickCategory('all');
    expect(await homePage.allCards().count()).toBe(initialCount);
  });

  test('should navigate to a post, check detail views, table of contents and back navigation', async ({ homePage }) => {
    await homePage.goto();

    const firstCard = homePage.page.locator('[data-testid^="card-post-"]').first();
    test.skip(await firstCard.count() === 0, 'No published posts in Supabase yet');

    const cardTitle = await firstCard.locator('.featured-title, .card-title').first().textContent();
    expect(cardTitle).not.toBeNull();

    const postDetailPage = await homePage.clickFirstPost();

    await expect(postDetailPage.heading).toBeVisible();
    await expect(postDetailPage.heading).toHaveText(cardTitle!.trim());

    await expect(postDetailPage.toc).toBeVisible();
    await expect(postDetailPage.tocHeading).toBeVisible();
    await expect(postDetailPage.tocItems.first()).toBeVisible();
    await expect(postDetailPage.authorName).toHaveText(SITE.authorShortName);

    const restoredHomePage = await postDetailPage.clickBack();
    await expect(restoredHomePage.postsList).toBeVisible();
  });

  test('should navigate to the About page and check portfolio details', async ({ page, homePage }) => {
    await homePage.goto();

    const aboutPage = await homePage.clickAboutLink();

    await expect(page).toHaveURL('/about');
    await expect(aboutPage.nameHeading).toBeVisible();
    await expect(aboutPage.nameHeading).toHaveText(SITE.authorName);

    await expect(aboutPage.emailLink).toBeVisible();
    await expect(aboutPage.emailLink).toHaveAttribute('href', SITE.email);
    await expect(aboutPage.githubLink).toHaveAttribute('href', SITE.github);
    await expect(aboutPage.linkedinLink).toHaveAttribute('href', SITE.linkedin);
  });

  test('should check responsiveness of page layouts', async ({ page, homePage }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await homePage.goto();
    await expect(homePage.postsList).toBeVisible();
    await expect(homePage.searchInput).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await homePage.goto();
    await expect(homePage.postsList).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await homePage.goto();
    await expect(homePage.postsList).toBeVisible();
    await expect(homePage.page.getByTestId('btn-mobile-menu')).toBeVisible();

    await expect(page.locator('.desktop-only')).toBeHidden();

    await homePage.page.getByTestId('btn-mobile-menu').click();

    const sidebarPanel = page.locator('.sidebar-panel');
    await expect(sidebarPanel).toHaveClass(/open/);

    const sidebarAboutLink = page.getByTestId('sidebar-link-about');
    await expect(sidebarAboutLink).toBeVisible();
    await expect(sidebarAboutLink).toHaveText('About');

    await page.getByTestId('btn-sidebar-close').click();
    await expect(sidebarPanel).not.toHaveClass(/open/);
  });
});
