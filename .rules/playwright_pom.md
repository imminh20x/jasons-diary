# Playwright Page Object Model (POM) Rules & Guidelines

This document outlines the architecture, coding patterns, and conventions for structuring Page Object Models (POM) in our Playwright E2E testing suite. 

POM is a design pattern that creates an abstraction layer over your application's UI, separating **what a user does** (actions) from **how the UI is structured** (selectors/HTML).

---

## 1. Core Mandates for POM

To keep our test suite maintainable and reliable, all Page Objects must adhere to these strict rules:

| Rule | Requirement | Why? |
| :--- | :--- | :--- |
| **Actions, Not Locators** | POM classes should expose public methods for high-level user actions (e.g., `login()`, `createPost()`). Do not make tests chain raw locator updates. | Keeps tests readable and decouples them from minor UI layout changes. |
| **No Assertions** | **Never** include `expect()` assertions inside page object methods. Tests own all assertions. | Allows the same page action to be used in both success and failure test paths. |
| **Statelessness** | Do not cache states (e.g., counters, arrays, input values) in page object properties. The browser DOM is the single source of truth. | Prevents stale data bugs when the DOM changes independently. |
| **Locator Isolation** | Declare locators as `readonly` properties in the constructor or as dynamic getters. | Prevents tests from overriding locators. |
| **Constructor Signature** | Constructors must only accept the Playwright `Page` instance (or a `Locator` for Component Objects). | Ensures simple instantiation and easy fixture integration. |

---

## 2. Structural Patterns

### A. Basic Page Object (Class)
For standard pages (e.g., Login, Settings), define actions and readonly locators.

```typescript
// tests/pages/login.page.ts
import { type Page, type Locator } from '@playwright/test';
import { DashboardPage } from './dashboard.page';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Mật khẩu');
    this.submitButton = page.getByRole('button', { name: /đăng nhập/i });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  // Returns next page object if navigation is expected
  async loginAs(email: string, pass: string): Promise<DashboardPage> {
    await this.usernameInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
    await this.page.waitForURL('/admin');
    return new DashboardPage(this.page);
  }

  async loginExpectingError(email: string, pass: string) {
    await this.usernameInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
  }
}
```

### B. Component Objects (Composition)
For elements appearing across multiple pages (e.g., Header, Footer, Modals), create Component Objects. 
*   **Rule**: Component Objects accept a root `Locator` instead of a `Page` to scope query selection to the component's subtree.

```typescript
// tests/components/footer.component.ts
import { type Locator } from '@playwright/test';

export class FooterComponent {
  readonly githubLink: Locator;
  readonly emailLink: Locator;

  constructor(private readonly root: Locator) {
    this.githubLink = root.getByRole('link', { name: /github/i });
    this.emailLink = root.getByRole('link', { name: /mail/i });
  }

  async clickGithub() {
    await this.githubLink.click();
  }
}

// Composition inside a Page Object:
export class HomePage {
  readonly footer: FooterComponent;

  constructor(private readonly page: Page) {
    this.footer = new FooterComponent(page.getByRole('contentinfo'));
  }
}
```

### C. Getter Pattern for Dynamic Locators
If a locator relies on dynamic text or elements added after page load, use a method or getter to query the DOM fresh.

```typescript
// tests/pages/dashboard.page.ts
export class DashboardPage {
  constructor(private readonly page: Page) {}

  // Dynamic row finder
  postRow(title: string): Locator {
    return this.page.getByRole('row').filter({ hasText: title });
  }

  async deletePost(title: string) {
    const row = this.postRow(title);
    await row.getByRole('button', { name: /xóa/i }).click();
    await row.waitFor({ state: 'hidden' });
  }
}
```

---

## 3. Fixture Injection

Instead of manually instantiating page objects in every test, register them as Playwright fixtures. This simplifies test dependencies and cleanup.

```typescript
// tests/fixtures/base.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

type Pages = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from '@playwright/test';
```

**Usage in test files**:
```typescript
import { test, expect } from './fixtures/base';

test('login navigation flow', async ({ loginPage, page }) => {
  await loginPage.goto();
  await loginPage.loginAs('admin@blog.com', 'password123');
  await expect(page).toHaveURL('/admin');
});
```

---

## 4. Anti-Patterns to Avoid

*   ❌ **God Page Object**: Avoid merging different pages or sub-panels into a single huge POM class (e.g., `AppPage` containing login, dashboard, settings, and profile features). Split by routes/features.
*   ❌ **Nested Base Class Inheritance**: Avoid deep chains like `class AdminDashboard extends AuthenticatedDashboard extends PublicLayout extends BasePage`. Use **Composition** (embedding components) instead of inheritance.
*   ❌ **Exposing Raw Action Locators**: Do not let tests interact with elements directly when a user behavior exists (e.g., doing `loginPage.emailInput.fill('...')` in a spec file instead of calling `loginPage.login(...)`).
