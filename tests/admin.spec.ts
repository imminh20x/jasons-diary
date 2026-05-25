import { test, expect } from './fixtures/base';
import { TEST_ADMIN } from './constants/auth';

test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.removeItem('admin_authenticated');
    });
  });

  test('should redirect unauthenticated users to login page', async ({ page, adminPage }) => {
    await adminPage.goto();
    await expect(page).toHaveURL('/login');

    await page.goto('/admin/new');
    await expect(page).toHaveURL('/login');
  });

  test('should show error with invalid credentials and log in successfully with valid ones', async ({ page, loginPage }) => {
    await loginPage.goto();

    await loginPage.login('wrong@example.com', 'wrongpassword');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Invalid email or password');

    await loginPage.login(TEST_ADMIN.email, TEST_ADMIN.password);

    await expect(page).toHaveURL('/admin');
  });

  test('should allow creating a post with preview, validation, and auto-slug generation', async ({ page, loginPage, adminPage }) => {
    await loginPage.goto();
    await loginPage.login(TEST_ADMIN.email, TEST_ADMIN.password);
    await expect(page).toHaveURL('/admin');

    const editPostPage = await adminPage.clickNewPost();

    await editPostPage.titleInput.fill('Playwright Test Article');
    await expect(editPostPage.slugInput).toHaveValue('playwright-test-article');

    await editPostPage.contentInput.fill('## Subheading\nThis is **bold** text.');
    await editPostPage.fillTags('Playwright, E2E');

    await expect(editPostPage.previewPane.getByRole('heading', { name: 'Playwright Test Article' })).toBeVisible();
    await expect(editPostPage.previewPane.getByRole('heading', { name: 'Subheading' })).toBeVisible();
    await expect(editPostPage.previewPane.locator('strong', { hasText: 'bold' })).toBeVisible();

    await editPostPage.statusSelect.selectOption('published');
    await expect(editPostPage.statusSelect).toHaveValue('published');

    const updatedAdminPage = await editPostPage.savePost();

    const tableRow = updatedAdminPage.postRow('Playwright Test Article');
    await expect(tableRow).toBeVisible();
    await expect(tableRow).toContainText('Published');

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Playwright Test Article' })).toBeVisible();
  });

  test('should allow editing and deleting a post', async ({ page, loginPage, adminPage }) => {
    await loginPage.goto();
    await loginPage.login(TEST_ADMIN.email, TEST_ADMIN.password);
    await expect(page).toHaveURL('/admin');

    const editPostPage = await adminPage.clickNewPost();
    await editPostPage.fillPostDetails(
      'E2E Edit Target',
      '## Original\nInitial body content.',
      'E2E',
      'published',
    );
    await editPostPage.savePost();

    const targetRow = adminPage.postRow('E2E Edit Target');
    await expect(targetRow).toBeVisible();

    const editButton = targetRow.getByTestId(/^btn-edit-post-/);
    const testId = await editButton.getAttribute('data-testid');
    const postId = testId?.replace('btn-edit-post-', '');
    expect(postId).toBeTruthy();

    await editButton.click();
    await page.waitForURL(new RegExp(`/admin/edit/${postId}`));

    await editPostPage.titleInput.fill('E2E Edit Target Updated');
    const updatedAdminPage = await editPostPage.savePost();

    await expect(updatedAdminPage.postsTable).toContainText('E2E Edit Target Updated');

    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Are you sure you want to delete');
      await dialog.accept();
    });

    await updatedAdminPage.deletePost(postId!);

    await expect(updatedAdminPage.postsTable).not.toContainText('E2E Edit Target Updated');

    await page.goto('/');
    await expect(page.locator('body')).not.toContainText('E2E Edit Target Updated');
  });
});
