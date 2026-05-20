import { type Page, type Locator } from '@playwright/test';
import { AdminPage } from './admin.page';

export class EditPostPage {
  readonly titleInput: Locator;
  readonly slugInput: Locator;
  readonly tagsInput: Locator;
  readonly contentInput: Locator;
  readonly statusSelect: Locator;
  readonly saveButton: Locator;
  readonly previewPane: Locator;

  constructor(private readonly page: Page) {
    this.titleInput = page.getByTestId('input-post-title');
    this.slugInput = page.getByLabel(/slug/i);
    this.tagsInput = page.getByTestId('input-post-tags');
    this.contentInput = page.getByTestId('textarea-post-content');
    this.statusSelect = page.getByLabel(/status|trạng thái/i);
    this.saveButton = page.getByTestId('btn-post-publish');
    this.previewPane = page.locator('.preview-pane');
  }

  async fillPostDetails(title: string, content: string, tags: string, status?: string) {
    await this.titleInput.fill(title);
    await this.contentInput.fill(content);
    await this.tagsInput.fill(tags);
    if (status) {
      await this.statusSelect.selectOption(status);
    }
  }

  async savePost(): Promise<AdminPage> {
    await this.saveButton.click();
    await this.page.waitForURL('/admin');
    return new AdminPage(this.page);
  }
}
