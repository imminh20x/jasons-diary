import { type Page, type Locator } from '@playwright/test';

export class AboutPage {
  readonly page: Page;
  readonly nameHeading: Locator;
  readonly avatarImage: Locator;
  readonly emailLink: Locator;
  readonly facebookLink: Locator;
  readonly githubLink: Locator;
  readonly linkedinLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameHeading = page.getByTestId('about-name');
    this.avatarImage = page.locator('.about-avatar-img');
    this.emailLink = page.getByTestId('btn-contact-email');
    this.facebookLink = page.getByTestId('link-facebook');
    this.githubLink = page.getByTestId('link-github');
    this.linkedinLink = page.getByTestId('link-linkedin');
  }

  async goto() {
    await this.page.goto('/about');
  }
}
