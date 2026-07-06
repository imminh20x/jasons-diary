---
title: "Playwright Fixtures: Cách Chúng Thực Sự Hoạt Động"
slug: "playwright-fixtures-simply-explained"
summary: "Tìm hiểu cách Playwright Fixtures hoạt động — từ việc thay thế beforeEach, cú pháp test.extend, hàm use(), đến worker-scoped fixtures. Giải thích đơn giản, dễ hiểu kèm ví dụ thực tế."
tags: ["playwright", "testing", "automation", "fixtures", "typescript"]
status: "draft"
coverImage: ""
author: "Jason"
---

Nếu bạn đang bắt đầu viết test với Playwright, chắc hẳn bạn đã gặp khái niệm **Fixtures** — một tính năng mạnh mẽ nhưng thường bị hiểu nhầm là phức tạp. Bài viết này được lấy cảm hứng từ video [Playwright Fixtures: How They Actually Work](https://youtu.be/EO2WufLMuh0) của Artem Bondar, giúp bạn hiểu rõ fixtures từ gốc rễ.

## Vấn Đề Với beforeEach

Khi viết test, cách phổ biến nhất để setup dữ liệu hoặc trạng thái là dùng `beforeEach`:

```typescript
import { test, expect } from '@playwright/test';

let adminPage;
let userToken;
let database;

test.beforeEach(async ({ page }) => {
  adminPage = new AdminPage(page);
  userToken = await getAuthToken();
  database = await connectDatabase();
  await database.seed();
});

test('should display dashboard', async ({ page }) => {
  // Chỉ cần adminPage, nhưng userToken và database cũng bị khởi tạo
  await adminPage.navigate();
  await expect(page.locator('.dashboard')).toBeVisible();
});

test('should show user profile', async ({ page }) => {
  // Chỉ cần userToken, nhưng adminPage và database cũng bị khởi tạo
  await page.goto(`/profile?token=${userToken}`);
  await expect(page.locator('.profile-name')).toBeVisible();
});
```

**Vấn đề rõ ràng:**

- Mọi test đều phải chạy qua toàn bộ setup, kể cả khi không cần.
- Khi test suite lớn dần, `beforeEach` trở nên cồng kềnh, khó bảo trì.
- Khó biết test nào thực sự phụ thuộc vào setup nào.

## Fixtures Là Gì?

Fixtures là cơ chế **dependency injection** của Playwright. Thay vì khởi tạo mọi thứ trong `beforeEach`, bạn khai báo từng "fixture" riêng biệt — mỗi fixture chịu trách nhiệm cho một resource cụ thể. Test chỉ nhận những fixtures mà nó yêu cầu.

Thực ra, bạn đã dùng fixtures mà không biết! Khi bạn viết:

```typescript
test('my test', async ({ page, context, browser }) => {
  // page, context, browser — đều là built-in fixtures
});
```

`page`, `context`, `browser` — tất cả đều là **built-in fixtures** của Playwright. Chúng được tự động tạo khi test cần và tự động dọn dẹp sau khi test hoàn thành.

## Tạo Custom Fixtures Với test.extend

Để tạo fixtures của riêng bạn, sử dụng `test.extend()`:

```typescript
// fixtures.ts
import { test as base, expect } from '@playwright/test';
import { AdminPage } from './pages/AdminPage';
import { UserAPI } from './api/UserAPI';

// Định nghĩa kiểu cho các fixtures
type MyFixtures = {
  adminPage: AdminPage;
  userAPI: UserAPI;
  testUser: { email: string; token: string };
};

// Extend base test với custom fixtures
export const test = base.extend<MyFixtures>({
  adminPage: async ({ page }, use) => {
    const adminPage = new AdminPage(page);
    await adminPage.navigate();
    await use(adminPage);
    // Cleanup sau khi test kết thúc (nếu cần)
  },

  userAPI: async ({}, use) => {
    const api = new UserAPI();
    await api.initialize();
    await use(api);
    await api.dispose();
  },

  testUser: async ({ userAPI }, use) => {
    // Fixture có thể phụ thuộc fixture khác!
    const user = await userAPI.createTestUser();
    await use(user);
    await userAPI.deleteUser(user.email);
  },
});

export { expect };
```

Sau đó, trong file test, import `test` từ file fixtures thay vì từ `@playwright/test`:

```typescript
// admin.spec.ts
import { test, expect } from './fixtures';

test('admin dashboard loads correctly', async ({ adminPage }) => {
  // Chỉ adminPage fixture được khởi tạo
  await expect(adminPage.heading).toBeVisible();
});

test('can create new user', async ({ adminPage, testUser }) => {
  // adminPage VÀ testUser được khởi tạo (userAPI cũng được tạo vì testUser phụ thuộc nó)
  await adminPage.searchUser(testUser.email);
  await expect(adminPage.userList).toContainText(testUser.email);
});
```

## Hiểu Hàm use() — Trái Tim Của Fixtures

Hàm `use()` là điểm mấu chốt. Nó chia fixture thành hai phần:

```typescript
adminPage: async ({ page }, use) => {
  // ═══ SETUP ═══
  // Code ở đây chạy TRƯỚC mỗi test
  const adminPage = new AdminPage(page);
  await adminPage.navigate();
  console.log('🟢 Setup: Admin page created');

  await use(adminPage);  // ← Test chạy tại đây

  // ═══ TEARDOWN ═══
  // Code ở đây chạy SAU mỗi test
  console.log('🔴 Teardown: Cleaning up');
  await adminPage.clearAllData();
},
```

**Luồng thực thi:**

```
1. Setup    → Tạo AdminPage, navigate
2. use()    → Truyền adminPage vào test, test bắt đầu chạy
3. Test     → Test sử dụng adminPage
4. Teardown → Dọn dẹp sau khi test kết thúc
```

Điều quan trọng: `use()` giống như một "điểm tạm dừng". Playwright sẽ chờ test hoàn thành trước khi tiếp tục chạy code phía sau `use()`.

## Worker-Scoped Fixtures

Mặc định, mọi fixture đều có scope là `test` — nghĩa là chúng được tạo mới cho **mỗi test**. Nhưng đôi khi, bạn có resource "đắt đỏ" mà không cần tạo lại liên tục.

### Worker là gì?

Khi chạy test song song, Playwright tạo nhiều **worker** (tiến trình). Mỗi worker chạy một nhóm test tuần tự. Ví dụ với 10 test và 3 worker:

```
Worker 1: test1, test4, test7, test10
Worker 2: test2, test5, test8
Worker 3: test3, test6, test9
```

### Khai báo Worker-Scoped Fixture

```typescript
import { test as base } from '@playwright/test';

type WorkerFixtures = {
  dbConnection: DatabaseConnection;
  sharedConfig: AppConfig;
};

export const test = base.extend<{}, WorkerFixtures>({
  // Worker-scoped: tạo 1 lần cho mỗi worker
  dbConnection: [async ({}, use) => {
    console.log('🔌 Connecting to database...');
    const db = await Database.connect();
    
    await use(db);
    
    console.log('🔌 Disconnecting from database...');
    await db.disconnect();
  }, { scope: 'worker' }],

  sharedConfig: [async ({}, use) => {
    const config = await loadConfig();
    await use(config);
  }, { scope: 'worker' }],
});
```

**Lưu ý cú pháp:** Worker-scoped fixtures sử dụng tuple `[function, options]` thay vì chỉ function. Và generic thứ hai của `extend<TestFixtures, WorkerFixtures>` là nơi khai báo kiểu.

### So sánh Test Scope vs Worker Scope

| Đặc điểm | Test Scope (mặc định) | Worker Scope |
|---|---|---|
| **Tạo mới** | Mỗi test | Mỗi worker |
| **Chia sẻ** | Không | Giữa các test trong cùng worker |
| **Use case** | Page, context, dữ liệu test riêng | DB connection, API client, config |
| **Isolation** | Cao — không ảnh hưởng lẫn nhau | Thấp hơn — cần cẩn thận |

## Fixtures Tự Động (Auto Fixtures)

Đôi khi bạn muốn fixture luôn chạy mà không cần test khai báo nó. Ví dụ: tự động chụp screenshot khi test fail.

```typescript
export const test = base.extend<{ autoScreenshot: void }>({
  autoScreenshot: [async ({ page }, use, testInfo) => {
    await use();
    
    // Tự động chụp screenshot nếu test fail
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshot = await page.screenshot();
      await testInfo.attach('failure-screenshot', {
        body: screenshot,
        contentType: 'image/png',
      });
    }
  }, { auto: true }],
});
```

Với `auto: true`, fixture này sẽ chạy cho **mọi test** mà không cần destructure trong tham số test.

## Fixture Dependencies — Chuỗi Phụ Thuộc

Một trong những tính năng mạnh nhất: fixtures có thể phụ thuộc lẫn nhau.

```typescript
export const test = base.extend<{
  auth: AuthHelper;
  adminUser: User;
  adminPage: AdminDashboard;
}>({
  auth: async ({}, use) => {
    const auth = new AuthHelper();
    await use(auth);
  },

  adminUser: async ({ auth }, use) => {
    // Phụ thuộc vào auth fixture
    const user = await auth.loginAsAdmin();
    await use(user);
    await auth.logout();
  },

  adminPage: async ({ page, adminUser }, use) => {
    // Phụ thuộc vào page (built-in) VÀ adminUser (custom)
    const dashboard = new AdminDashboard(page);
    await dashboard.open(adminUser.token);
    await use(dashboard);
  },
});
```

Playwright tự động phân tích dependency graph và khởi tạo fixtures theo đúng thứ tự. Teardown chạy theo thứ tự ngược lại.

## Best Practices

### ✅ Nên làm

- **Giữ fixtures đơn giản và rõ ràng** — mỗi fixture chỉ nên chịu trách nhiệm một việc.
- **Đặt tên mô tả** — `authenticatedPage` tốt hơn `page2`.
- **Luôn cleanup trong teardown** — tránh resource leak.
- **Dùng worker scope cho resource đắt đỏ** — database connections, server startup.

### ❌ Không nên làm

- **Không lạm dụng fixtures** — nếu setup đơn giản, `beforeEach` vẫn ổn.
- **Không tạo fixtures quá phức tạp** — nếu fixture có hàng chục dòng logic, hãy extract thành class riêng.
- **Không dùng worker scope cho mutable state** — các test có thể ảnh hưởng lẫn nhau.
- **Tránh "magic" quá nhiều** — code test nên dễ đọc, dễ hiểu. Nếu người mới nhìn vào không hiểu fixture làm gì, bạn đã làm quá phức tạp.

## Kết Luận

Playwright Fixtures là một công cụ mạnh mẽ để quản lý setup/teardown trong test automation. Điểm mấu chốt:

1. **Fixtures = Dependency Injection** — test chỉ nhận những gì nó cần.
2. **Hàm `use()`** chia fixture thành setup và teardown rõ ràng.
3. **Worker-scoped fixtures** tiết kiệm thời gian cho resource đắt đỏ.
4. **Fixture dependencies** cho phép xây dựng chuỗi setup phức tạp nhưng dễ quản lý.

Hãy bắt đầu với những fixtures đơn giản, sau đó mở rộng khi cần. Đừng cố "fixture hóa" mọi thứ ngay từ đầu — giữ cho test dễ đọc luôn là ưu tiên hàng đầu.

---

*Tham khảo: [Playwright Fixtures: How They Actually Work (Simply Explained)](https://youtu.be/EO2WufLMuh0) — Artem Bondar*
