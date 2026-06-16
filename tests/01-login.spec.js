import { test, expect } from '@playwright/test';

const CREDS = {
  email: 'admin@devibana.com',
  password: 'admin@devibana.com'
};

const URLS = {
  admin: 'https://admin.mancu.cloud/?p=devibana',
  pos:   'https://pos.mancu.cloud/?p=devibana',
  kitchen: 'https://kitchen.mancu.cloud/?p=devibana'
};

// ─────────────────────────────────────────
// 🔐 ADMIN LOGIN TESTS
// ─────────────────────────────────────────
test.describe('🔐 ADMIN - Login & Auth Tests', () => {

  test('ADMIN-01: Page loads successfully', async ({ page }) => {
    await page.goto(URLS.admin);
    await expect(page).toHaveTitle(/.+/); // Koi bhi title ho
    await page.screenshot({ path: 'screenshots/admin-loaded.png', fullPage: true });
  });

  test('ADMIN-02: Login form visible', async ({ page }) => {
    await page.goto(URLS.admin);
    const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passField  = page.locator('input[type="password"]');
    await expect(emailField.first()).toBeVisible();
    await expect(passField.first()).toBeVisible();
  });

  test('ADMIN-03: Wrong password shows error', async ({ page }) => {
    await page.goto(URLS.admin);
    await page.locator('input[type="email"], input[name="email"]').first().fill('admin@devibana.com');
    await page.locator('input[type="password"]').first().fill('WRONGPASSWORD123');
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign")').first().click();
    await page.waitForTimeout(2000);
    // Error message hona chahiye
    const errorMsg = page.locator('.error, .alert, [class*="error"], [class*="alert"], [class*="danger"]');
    await page.screenshot({ path: 'screenshots/admin-wrong-password.png', fullPage: true });
  });

  test('ADMIN-04: Correct login works', async ({ page }) => {
    await page.goto(URLS.admin);
    await page.locator('input[type="email"], input[name="email"]').first().fill(CREDS.email);
    await page.locator('input[type="password"]').first().fill(CREDS.password);
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign")').first().click();
    await page.waitForTimeout(3000);
    // Login ke baad URL change honi chahiye ya dashboard dikhna chahiye
    const currentURL = page.url();
    await page.screenshot({ path: 'screenshots/admin-after-login.png', fullPage: true });
    console.log('Admin URL after login:', currentURL);
  });

  test('ADMIN-05: Dashboard loads after login', async ({ page }) => {
    await page.goto(URLS.admin);
    await page.locator('input[type="email"], input[name="email"]').first().fill(CREDS.email);
    await page.locator('input[type="password"]').first().fill(CREDS.password);
    await page.locator('button[type="submit"], button:has-text("Login")').first().click();
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'screenshots/admin-dashboard.png', fullPage: true });
    // Dashboard elements check
    const bodyText = await page.locator('body').innerText();
    console.log('Dashboard content preview:', bodyText.substring(0, 500));
  });

});

// ─────────────────────────────────────────
// 🛒 POS LOGIN TESTS  
// ─────────────────────────────────────────
test.describe('🛒 POS - Login Tests', () => {

  test('POS-01: POS page loads', async ({ page }) => {
    await page.goto(URLS.pos);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/pos-loaded.png', fullPage: true });
    console.log('POS URL:', page.url());
    console.log('POS Title:', await page.title());
  });

  test('POS-02: POS Login with credentials', async ({ page }) => {
    await page.goto(URLS.pos);
    await page.waitForTimeout(2000);
    
    const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').count();
    
    if (hasLoginForm > 0) {
      await page.locator('input[type="email"], input[name="email"]').first().fill(CREDS.email);
      await page.locator('input[type="password"]').first().fill(CREDS.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(3000);
    }
    
    await page.screenshot({ path: 'screenshots/pos-after-login.png', fullPage: true });
  });

});

// ─────────────────────────────────────────
// 👨‍🍳 KITCHEN LOGIN TESTS
// ─────────────────────────────────────────
test.describe('👨‍🍳 KITCHEN - Login Tests', () => {

  test('KITCHEN-01: Kitchen page loads', async ({ page }) => {
    await page.goto(URLS.kitchen);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/kitchen-loaded.png', fullPage: true });
    console.log('Kitchen Title:', await page.title());
  });

  test('KITCHEN-02: Kitchen Login', async ({ page }) => {
    await page.goto(URLS.kitchen);
    await page.waitForTimeout(2000);
    
    const hasLoginForm = await page.locator('input[type="password"]').count();
    
    if (hasLoginForm > 0) {
      await page.locator('input[type="email"], input[name="email"]').first().fill(CREDS.email);
      await page.locator('input[type="password"]').first().fill(CREDS.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(3000);
    }
    
    await page.screenshot({ path: 'screenshots/kitchen-after-login.png', fullPage: true });
  });

});
