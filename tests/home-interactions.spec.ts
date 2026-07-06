import { test, expect } from './fixtures/base';

test.describe('Home Page Interactions', () => {
  test('should toggle dark/light mode', async ({ homePage, page }) => {
    await homePage.goto();

    // The theme button should be visible
    await expect(homePage.themeToggleBtn).toBeVisible();

    // Check initial html class for theme (it might be empty or 'light'/'dark')
    // Let's assume it toggles 'dark' class on HTML element or 'data-theme'
    const htmlElement = page.locator('html');
    const initialClass = await htmlElement.getAttribute('class') || '';

    // Click the toggle
    await homePage.themeToggleBtn.click();

    // Check that the class changed
    await expect(htmlElement).not.toHaveClass(initialClass);
  });

  test('should have language switcher', async ({ page, homePage }) => {
    await homePage.goto();

    // Check if EN and VI language buttons are present
    const enButton = page.getByRole('button', { name: 'EN', exact: true });
    const viButton = page.getByRole('button', { name: 'VI', exact: true });

    await expect(enButton).toBeVisible();
    await expect(viButton).toBeVisible();

    // Assuming click on EN changes url to include /en or changes some text
    // Just a basic interaction check for now
    await enButton.click();
  });
});
