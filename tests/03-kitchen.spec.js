import { test, expect } from '@playwright/test';

const CREDS = { email: 'admin@devibana.com', password: 'admin@devibana.com' };

async function loginIfRequired(page, url) {
  await page.goto(url);
  await page.waitForTimeout(3000);
  const loginForm = await page.locator('input[type="password"]').count();
  if (loginForm > 0) {
    await page.locator('input[type="email"], input[name="email"]').first().fill(CREDS.email);
    await page.locator('input[type="password"]').first().fill(CREDS.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(4000);
  }
}

test.describe('👨‍🍳 KITCHEN - Order Management Tests', () => {

  test('KITCHEN-01: Kitchen screen loads properly', async ({ page }) => {
    await loginIfRequired(page, 'https://kitchen.mancu.cloud/?p=devibana');
    await page.screenshot({ path: 'screenshots/kitchen-main.png', fullPage: true });
    
    const bodyText = await page.locator('body').innerText();
    console.log('Kitchen Content:', bodyText.substring(0, 800));
  });

  test('KITCHEN-02: Orders visible in kitchen', async ({ page }) => {
    await loginIfRequired(page, 'https://kitchen.mancu.cloud/?p=devibana');
    
    // Order cards ya list dhundo
    const orderSelectors = [
      '[class*="order"]',
      '[class*="ticket"]',
      '[class*="card"]',
      '.order',
      '.ticket'
    ];
    
    for (const selector of orderSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`Found ${count} elements with selector: ${selector}`);
      }
    }
    
    await page.screenshot({ path: 'screenshots/kitchen-orders.png', fullPage: true });
  });

  test('KITCHEN-03: Can mark order as preparing', async ({ page }) => {
    await loginIfRequired(page, 'https://kitchen.mancu.cloud/?p=devibana');
    
    const preparingBtns = [
      'button:has-text("Start")',
      'button:has-text("Preparing")',
      'button:has-text("Accept")',
      'button:has-text("Begin")',
      '[class*="preparing"]',
      '[class*="accept"]'
    ];
    
    for (const selector of preparingBtns) {
      const btn = page.locator(selector);
      const count = await btn.count();
      if (count > 0) {
        console.log(`Found preparing button: ${selector}`);
        await btn.first().click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/kitchen-preparing.png', fullPage: true });
        break;
      }
    }
    
    console.log('All buttons on kitchen screen:');
    const allBtns = page.locator('button');
    const btnCount = await allBtns.count();
    for (let i = 0; i < Math.min(btnCount, 15); i++) {
      const text = await allBtns.nth(i).innerText();
      if (text.trim()) console.log(`  Button: "${text.trim()}"`);
    }
  });

  test('KITCHEN-04: Can mark order as ready/completed', async ({ page }) => {
    await loginIfRequired(page, 'https://kitchen.mancu.cloud/?p=devibana');
    
    const readyBtns = [
      'button:has-text("Ready")',
      'button:has-text("Done")',
      'button:has-text("Complete")',
      'button:has-text("Served")',
      '[class*="ready"]',
      '[class*="complete"]',
      '[class*="done"]'
    ];
    
    for (const selector of readyBtns) {
      const btn = page.locator(selector);
      if (await btn.count() > 0) {
        await btn.first().click();
        await page.waitForTimeout(2000);
        console.log(`✅ Order marked ready using: ${selector}`);
        await page.screenshot({ path: 'screenshots/kitchen-order-ready.png', fullPage: true });
        break;
      }
    }
  });

  test('KITCHEN-05: Real-time update check (30 sec observation)', async ({ page }) => {
    await loginIfRequired(page, 'https://kitchen.mancu.cloud/?p=devibana');
    
    const initialContent = await page.locator('body').innerText();
    
    // 30 seconds wait - naya order aaya ki nahi
    await page.waitForTimeout(30000);
    
    const updatedContent = await page.locator('body').innerText();
    
    const hasChanged = initialContent !== updatedContent;
    console.log(`Real-time update detected: ${hasChanged}`);
    
    await page.screenshot({ path: 'screenshots/kitchen-realtime.png', fullPage: true });
  });

});
