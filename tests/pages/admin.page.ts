import { type Page, type Locator } from '@playwright/test';
import { EditPostPage } from './edit-post.page';

export class AdminPage {
  readonly newPostButton: Locator;
  readonly postsTable: Locator;

  constructor(private readonly page: Page) {
    this.newPostButton = page.getByRole('button', { name: /viết bài mới|new post/i }).or(page.getByTestId('btn-new-post'));
    this.postsTable = page.getByRole('table');
  }

  async goto() {
    await this.page.goto('/admin');
  }

  async clickNewPost(): Promise<EditPostPage> {
    await this.newPostButton.click();
    await this.page.waitForURL('/admin/new');
    return new EditPostPage(this.page);
  }

  async editPost(slug: string): Promise<EditPostPage> {
    const editBtn = this.page.getByTestId(`btn-edit-post-${slug}`);
    await editBtn.click();
    await this.page.waitForURL(new RegExp(`/admin/edit/${slug}`));
    return new EditPostPage(this.page);
  }

  async deletePost(slug: string) {
    const deleteBtn = this.page.getByTestId(`btn-delete-post-${slug}`);
    await deleteBtn.click();
  }

  postRow(title: string): Locator {
    return this.page.getByRole('row').filter({ hasText: title });
  }
}
