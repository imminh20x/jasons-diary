import { test, expect } from './fixtures/base';
import { TEST_ADMIN } from './constants/auth';

test.describe('Create Blog Post Flow E2E', () => {
  test.beforeEach(async ({ page, loginPage, adminPage }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.removeItem('admin_authenticated');
    });

    await loginPage.goto();
    await loginPage.login(TEST_ADMIN.email, TEST_ADMIN.password);
    await expect(page).toHaveURL('/admin');

    await adminPage.clickNewPost();
  });

  test('should support auto-generating slug and manually overriding it', async ({ editPostPage }) => {
    await editPostPage.titleInput.fill('Visual Regression Testing Guide');
    await expect(editPostPage.slugInput).toHaveValue('visual-regression-testing-guide');

    await editPostPage.slugInput.fill('visual-testing-tips');

    await editPostPage.titleInput.fill('Visual Regression Testing Guide V2');
    await expect(editPostPage.slugInput).toHaveValue('visual-testing-tips');
  });

  test('should render live markdown preview dynamically', async ({ editPostPage }) => {
    await editPostPage.titleInput.fill('Markdown Features');
    await editPostPage.contentInput.fill('# Main Header\n- Item 1\n- Item 2\n\n**Bold Text**');

    const preview = editPostPage.previewPane;
    await expect(preview.getByRole('heading', { name: 'Markdown Features', level: 1 })).toBeVisible();
    await expect(preview.getByRole('heading', { name: 'Main Header', level: 1 })).toBeVisible();
    await expect(preview.getByRole('listitem').first()).toHaveText('Item 1');
    await expect(preview.locator('strong')).toHaveText('Bold Text');
  });

  test('should trigger validation alert if required fields are missing', async ({ page, editPostPage }) => {
    let alertMessage = '';
    page.on('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await editPostPage.saveButton.click();
    expect(alertMessage).toContain('Title, slug, and content are required');
  });

  test('should successfully publish a new article and display it publicly', async ({ page, editPostPage }) => {
    await editPostPage.fillPostDetails(
      'Automated Playwright Audits',
      '## a11y & Performance\nThis article shows how to run axe audits.',
      'QA, Playwright',
      'published'
    );

    const adminDashboard = await editPostPage.savePost();

    const postRow = adminDashboard.postRow('Automated Playwright Audits');
    await expect(postRow).toBeVisible();
    await expect(postRow).toContainText('Published');

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Automated Playwright Audits' })).toBeVisible();
  });
});
