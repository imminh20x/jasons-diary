import { test, expect } from './fixtures/base';

test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear local storage authentication state to run clean
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.removeItem('admin_authenticated');
      window.localStorage.removeItem('aura_blog_posts'); // Reset mock database
      window.localStorage.removeItem('aura_blog_post_tags');
    });
  });

  test('should redirect unauthenticated users to login page', async ({ page, adminPage }) => {
    // Attempt to access dashboard while logged out
    await adminPage.goto();
    await expect(page).toHaveURL('/login');

    // Attempt to access editor while logged out
    await page.goto('/admin/new');
    await expect(page).toHaveURL('/login');
  });

  test('should show error with invalid credentials and log in successfully with valid ones', async ({ page, loginPage }) => {
    await loginPage.goto();

    // Invalid credentials
    await loginPage.login('wrong@example.com', 'wrongpassword');

    // Verify error message
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Invalid email or password');

    // Valid credentials (admin@blog.com / password)
    await loginPage.login('admin@blog.com', 'password');

    // Redirect to admin dashboard
    await expect(page).toHaveURL('/admin');
  });

  test('should allow creating a post with preview, validation, and auto-slug generation', async ({ page, loginPage, adminPage }) => {
    // Log in first
    await loginPage.goto();
    await loginPage.login('admin@blog.com', 'password');
    await expect(page).toHaveURL('/admin');

    // Navigate to new post page
    const editPostPage = await adminPage.clickNewPost();

    // 1. Verify auto-slug generation
    await editPostPage.titleInput.fill('Playwright Test Article');
    await expect(editPostPage.slugInput).toHaveValue('playwright-test-article');

    // 2. Check preview rendering
    await editPostPage.contentInput.fill('## Subheading\nThis is **bold** text.');
    await editPostPage.fillTags('Playwright, E2E');
    
    // Preview should display the title and content
    await expect(editPostPage.previewPane.getByRole('heading', { name: 'Playwright Test Article' })).toBeVisible();
    await expect(editPostPage.previewPane.getByRole('heading', { name: 'Subheading' })).toBeVisible();
    await expect(editPostPage.previewPane.locator('strong', { hasText: 'bold' })).toBeVisible();

    // 3. Set status to published
    await editPostPage.statusSelect.selectOption('published');
    await expect(editPostPage.statusSelect).toHaveValue('published');

    // 4. Save and verify redirections and availability on home page
    const updatedAdminPage = await editPostPage.savePost();

    // Check that it's listed on dashboard and has 'Published' status
    const tableRow = updatedAdminPage.postRow('Playwright Test Article');
    await expect(tableRow).toBeVisible();
    await expect(tableRow).toContainText('Published');

    // Check that it's on public home page
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Playwright Test Article' })).toBeVisible();
  });

  test('should allow editing and deleting a post', async ({ page, loginPage, adminPage }) => {
    // Log in first
    await loginPage.goto();
    await loginPage.login('admin@blog.com', 'password');
    await expect(page).toHaveURL('/admin');

    // Edit the first post in the dashboard list (post-1)
    const editPostPage = await adminPage.editPost('post-1');

    // Modify title and content
    await editPostPage.titleInput.fill('Aura Aesthetics: Modified Title');
    const updatedAdminPage = await editPostPage.savePost();

    // Verify redirect and updated title
    await expect(updatedAdminPage.postsTable).toContainText('Aura Aesthetics: Modified Title');

    // Now delete post-1
    // Set up dialog handler
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure you want to delete');
      await dialog.accept();
    });

    await updatedAdminPage.deletePost('post-1');

    // Verify it is removed from dashboard
    await expect(updatedAdminPage.postsTable).not.toContainText('Aura Aesthetics: Modified Title');

    // Go to homepage and check it is gone
    await page.goto('/');
    await expect(page.locator('body')).not.toContainText('Aura Aesthetics: Modified Title');
  });
});
