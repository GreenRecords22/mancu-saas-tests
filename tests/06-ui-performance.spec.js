import { test, expect } from '@playwright/test';

const URLS = {
  admin: 'https://admin.mancu.cloud/?p=devibana',
  pos: 'https://pos.mancu.cloud/?p=devibana',
  kitchen: 'https://kitchen.mancu.cloud/?p=devibana'
};

test.describe('⚡ PERFORMANCE - Page Load Speed Tests', () => {

  test('PERF-01: Admin load time', async ({ page }) => {
    const start = Date.now();
    await page.goto(URLS.admin);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;
    
    console.log(`Admin load time: ${loadTime}ms`);
    if (loadTime < 3000) console.log('✅ FAST (< 3s)');
    else if (loadTime < 5000) console.log('⚠️ ACCEPTABLE (3-5s)');
    else console.log('❌ SLOW (> 5s) - Needs optimization');
    
    expect(loadTime).toBeLessThan(15000); // 15s max
  });

  test('PERF-02: POS load time', async ({ page }) => {
    const start = Date.now();
    await page.goto(URLS.pos);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;
    console.log(`POS load time: ${loadTime}ms`);
  });

  test('PERF-03: Kitchen load time', async ({ page }) => {
    const start = Date.now();
    await page.goto(URLS.kitchen);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;
    console.log(`Kitchen load time: ${loadTime}ms`);
  });

});

test.describe('📱 MOBILE - Responsive Design Tests', () => {

  test('MOBILE-01: Admin mobile view', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 }, // iPhone size
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
    });
    const page = await context.newPage();
    await page.goto(URLS.admin);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/mobile-admin.png', fullPage: true });
    
    // Horizontal scroll check
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    if (bodyWidth > viewportWidth + 20) {
      console.log(`❌ Horizontal scroll detected! Body: ${bodyWidth}px, Viewport: ${viewportWidth}px`);
    } else {
      console.log('✅ No horizontal scroll - mobile responsive');
    }
    
    await context.close();
  });

  test('MOBILE-02: POS mobile view', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 }
    });
    const page = await context.newPage();
    await page.goto(URLS.pos);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/mobile-pos.png', fullPage: true });
    await context.close();
  });

  test('MOBILE-03: Kitchen tablet view', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 } // iPad
    });
    const page = await context.newPage();
    await page.goto(URLS.kitchen);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/tablet-kitchen.png', fullPage: true });
    await context.close();
  });

});

test.describe('🔒 SECURITY - Basic Security Tests', () => {

  test('SEC-01: No sensitive data in URL', async ({ page }) => {
    await page.goto(URLS.admin);
    const url = page.url();
    const hasSensitiveData = url.includes('password') || url.includes('token') || url.includes('secret');
    console.log(`Sensitive data in URL: ${hasSensitiveData ? '❌ YES - Security Issue!' : '✅ Clean'}`);
  });

  test('SEC-02: HTTPS check', async ({ page }) => {
    for (const [name, url] of Object.entries(URLS)) {
      const isHttps = url.startsWith('https://');
      console.log(`${name} HTTPS: ${isHttps ? '✅' : '❌'}`);
    }
  });

  test('SEC-03: Unauthorized access prevention', async ({ page }) => {
    // Bina login ke admin page access karne ki koshish
    await page.goto(URLS.admin);
    await page.waitForTimeout(3000);
    const url = page.url();
    const hasLoginForm = await page.locator('input[type="password"]').count();
    
    console.log(`Login form present: ${hasLoginForm > 0 ? '✅ Protected' : '⚠️ Check manually'}`);
    await page.screenshot({ path: 'screenshots/security-unauth.png', fullPage: true });
  });

});
