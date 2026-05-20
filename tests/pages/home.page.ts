import { type Page, type Locator } from '@playwright/test';
import { PostDetailPage } from './post-detail.page';
import { AboutPage } from './about.page';

export class HomePage {
  readonly page: Page;
  readonly logoText: Locator;
  readonly header: Locator;
  readonly footer: Locator;
  readonly homeNavLink: Locator;
  readonly adminNavLink: Locator;
  readonly aboutNavLink: Locator;
  readonly themeToggleBtn: Locator;
  readonly postsList: Locator;
  readonly searchInput: Locator;
  readonly footerEmail: Locator;
  readonly footerPhone: Locator;
  readonly footerGithub: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logoText = page.getByRole('heading', { level: 1 });
    this.header = page.getByRole('banner');
    this.footer = page.getByRole('contentinfo');
    this.homeNavLink = page.getByTestId('nav-link-home');
    this.adminNavLink = page.getByTestId('nav-link-admin');
    this.aboutNavLink = page.getByTestId('nav-link-about');
    this.themeToggleBtn = page.getByTestId('btn-theme-toggle');
    this.postsList = page.getByTestId('blog-posts-list');
    this.searchInput = page.getByTestId('input-search');
    this.footerEmail = page.getByTestId('footer-email');
    this.footerPhone = page.getByTestId('footer-phone');
    this.footerGithub = page.getByTestId('footer-social-github');
  }

  async goto() {
    await this.page.goto('/');
  }

  async searchFor(query: string) {
    await this.searchInput.fill(query);
  }

  async clickCategory(category: string) {
    const pill = this.page.getByTestId(`category-pill-${category}`);
    await pill.click();
  }

  async clickFirstPost(): Promise<PostDetailPage> {
    const firstCard = this.page.locator('[data-testid^="card-post-"]').first();
    const titleLink = firstCard.locator('.featured-title a, .card-title a').first();
    await titleLink.click();
    await this.page.waitForURL(/\/post\/.+/);
    return new PostDetailPage(this.page);
  }

  async clickAboutLink(): Promise<AboutPage> {
    await this.aboutNavLink.click();
    await this.page.waitForURL('/about');
    return new AboutPage(this.page);
  }

  allCards(): Locator {
    return this.postsList.locator('article.card');
  }
}
