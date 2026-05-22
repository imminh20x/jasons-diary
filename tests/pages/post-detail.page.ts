import { type Page, type Locator } from '@playwright/test';
import { HomePage } from './home.page';

export class PostDetailPage {
  readonly heading: Locator;
  readonly toc: Locator;
  readonly tocHeading: Locator;
  readonly tocItems: Locator;
  readonly backButton: Locator;
  readonly authorName: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 }).first();
    this.toc = page.getByRole('complementary');
    this.tocHeading = this.toc.getByRole('heading', { name: /Table of Contents|Mục lục/i });
    this.tocItems = this.toc.locator('.toc-item');
    this.backButton = page.getByTestId('link-back-articles');
    this.authorName = page.locator('.post-header-author-row .author-name');
  }

  async clickBack(): Promise<HomePage> {
    await this.backButton.click();
    await this.page.waitForURL('/');
    return new HomePage(this.page);
  }
}
