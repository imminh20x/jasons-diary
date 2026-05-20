import { type Page, type Locator } from '@playwright/test';
import { AdminPage } from './admin.page';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByPlaceholder(/email/i).or(page.getByTestId('input-login-email'));
    this.passwordInput = page.getByPlaceholder(/password/i).or(page.getByTestId('input-login-password'));
    this.submitButton = page.getByRole('button', { name: /sign in|đăng nhập/i }).or(page.getByTestId('btn-login-submit'));
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, pass: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
  }

  async loginAs(email: string, pass: string): Promise<AdminPage> {
    await this.login(email, pass);
    await this.page.waitForURL('/admin');
    return new AdminPage(this.page);
  }
}
