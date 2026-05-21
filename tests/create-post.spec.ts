import { test, expect } from './fixtures/base';

test.describe('Create Blog Post Flow E2E', () => {
  test.beforeEach(async ({ page, loginPage, adminPage }) => {
    // 1. Reset state
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.removeItem('admin_authenticated');
      window.localStorage.removeItem('aura_blog_posts');
      window.localStorage.removeItem('aura_blog_post_tags');
    });

    // 2. Log in
    await loginPage.goto();
    await loginPage.login('admin@blog.com', 'password');
    await expect(page).toHaveURL('/admin');

    // 3. Go to new post page
    await adminPage.clickNewPost();
  });

  test('should support auto-generating slug and manually overriding it', async ({ editPostPage }) => {
    // Type title and check slug updates automatically
    await editPostPage.titleInput.fill('Visual Regression Testing Guide');
    await expect(editPostPage.slugInput).toHaveValue('visual-regression-testing-guide');

    // Overriding slug manually
    await editPostPage.slugInput.fill('visual-testing-tips');
    
    // Type more title and slug should NOT update anymore
    await editPostPage.titleInput.fill('Visual Regression Testing Guide V2');
    await expect(editPostPage.slugInput).toHaveValue('visual-testing-tips');
  });

  test('should render live markdown preview dynamically', async ({ editPostPage }) => {
    await editPostPage.titleInput.fill('Markdown Features');
    await editPostPage.contentInput.fill('# Main Header\n- Item 1\n- Item 2\n\n**Bold Text**');

    // Verify preview contents
    const preview = editPostPage.previewPane;
    await expect(preview.getByRole('heading', { name: 'Markdown Features', level: 1 })).toBeVisible();
    await expect(preview.getByRole('heading', { name: 'Main Header', level: 1 })).toBeVisible();
    await expect(preview.getByRole('listitem').first()).toHaveText('Item 1');
    await expect(preview.locator('strong')).toHaveText('Bold Text');
  });

  test('should trigger validation alert if required fields are missing', async ({ page, editPostPage }) => {
    let alertMessage = '';
    page.on('dialog', async dialog => {
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

    // Verify it is on the dashboard list
    const postRow = adminDashboard.postRow('Automated Playwright Audits');
    await expect(postRow).toBeVisible();
    await expect(postRow).toContainText('Published');

    // Verify it is on the visitor homepage
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Automated Playwright Audits' })).toBeVisible();
  });
});
