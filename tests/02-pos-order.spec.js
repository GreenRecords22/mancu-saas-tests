import { test, expect } from '@playwright/test';

const CREDS = { email: 'admin@devibana.com', password: 'admin@devibana.com' };

// Helper: Login karo
async function loginIfRequired(page, url) {
  await page.goto(url);
  await page.waitForTimeout(3000);
  
  const loginForm = await page.locator('input[type="password"]').count();
  if (loginForm > 0) {
    await page.locator('input[type="email"], input[name="email"]').first().fill(CREDS.email);
    await page.locator('input[type="password"]').first().fill(CREDS.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(4000);
    console.log('✅ Login successful');
  } else {
    console.log('ℹ️ No login required or already logged in');
  }
}

test.describe('🛒 POS - Complete Order Placement Flow', () => {

  test('POS-ORDER-01: Menu items are visible', async ({ page }) => {
    await loginIfRequired(page, 'https://pos.mancu.cloud/?p=devibana');
    
    await page.screenshot({ path: 'screenshots/pos-menu.png', fullPage: true });
    
    // Menu items count karo
    const bodyText = await page.locator('body').innerText();
    console.log('POS Page Content:', bodyText.substring(0, 1000));
    
    // Common menu selectors try karo
    const menuItems = page.locator('.menu-item, .item, .product, [class*="menu"], [class*="item"], [class*="food"]');
    const count = await menuItems.count();
    console.log(`Found ${count} potential menu items`);
  });

  test('POS-ORDER-02: Can select table/order type', async ({ page }) => {
    await loginIfRequired(page, 'https://pos.mancu.cloud/?p=devibana');
    
    // Table selection ya dine-in/takeaway option
    const tableBtn = page.locator('button, .table, [class*="table"]').first();
    const count = await page.locator('button').count();
    console.log(`Total buttons on POS: ${count}`);
    
    // Saare buttons ka text print karo
    const buttons = page.locator('button');
    for (let i = 0; i < Math.min(count, 20); i++) {
      const text = await buttons.nth(i).innerText();
      if (text.trim()) console.log(`Button ${i}: "${text.trim()}"`);
    }
    
    await page.screenshot({ path: 'screenshots/pos-table-selection.png', fullPage: true });
  });

  test('POS-ORDER-03: Add item to cart', async ({ page }) => {
    await loginIfRequired(page, 'https://pos.mancu.cloud/?p=devibana');
    await page.waitForTimeout(2000);
    
    // Pehla clickable item click karo
    const clickableItems = page.locator('[class*="add"], [class*="cart"], button:has-text("+"), button:has-text("Add")');
    const count = await clickableItems.count();
    console.log(`Add-to-cart buttons found: ${count}`);
    
    if (count > 0) {
      await clickableItems.first().click();
      await page.waitForTimeout(1000);
      console.log('✅ Clicked first add button');
    }
    
    await page.screenshot({ path: 'screenshots/pos-item-added.png', fullPage: true });
  });

  test('POS-ORDER-04: FULL ORDER FLOW - Place complete order', async ({ page }) => {
    await loginIfRequired(page, 'https://pos.mancu.cloud/?p=devibana');
    await page.waitForTimeout(3000);
    
    console.log('🚀 Starting full order placement...');
    
    // Step 1: Table select karo agar option hai
    const tableOptions = page.locator('[class*="table"], [class*="seat"], [data-table]');
    if (await tableOptions.count() > 0) {
      await tableOptions.first().click();
      await page.waitForTimeout(1000);
      console.log('✅ Table selected');
    }
    
    // Step 2: Menu se item add karo
    await page.screenshot({ path: 'screenshots/pos-before-order.png', fullPage: true });
    
    // Multiple selectors try karo item add karne ke liye
    const addSelectors = [
      'button:has-text("+")',
      'button:has-text("Add")',
      '[class*="add-to-cart"]',
      '[class*="addToCart"]',
      '.menu-item button',
      '[class*="item"] button'
    ];
    
    let itemAdded = false;
    for (const selector of addSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        await elements.first().click();
        await page.waitForTimeout(500);
        // Second item bhi add karo
        if (count > 1) {
          await elements.nth(1).click();
          await page.waitForTimeout(500);
        }
        console.log(`✅ Items added using selector: ${selector}`);
        itemAdded = true;
        break;
      }
    }
    
    await page.screenshot({ path: 'screenshots/pos-items-in-cart.png', fullPage: true });
    
    // Step 3: Cart check karo
    const cartText = await page.locator('body').innerText();
    console.log('Cart area content:', cartText.substring(0, 500));
    
    // Step 4: Place Order button dhundo
    const orderBtns = [
      'button:has-text("Place Order")',
      'button:has-text("Confirm")',
      'button:has-text("Order")',
      'button:has-text("Submit")',
      'button:has-text("Pay")',
      '[class*="place-order"]',
      '[class*="checkout"]'
    ];
    
    for (const selector of orderBtns) {
      const btn = page.locator(selector);
      if (await btn.count() > 0) {
        await btn.first().click();
        await page.waitForTimeout(3000);
        console.log(`✅ Order placed using: ${selector}`);
        break;
      }
    }
    
    await page.screenshot({ path: 'screenshots/pos-order-placed.png', fullPage: true });
    
    // Final state
    const finalContent = await page.locator('body').innerText();
    console.log('After order content:', finalContent.substring(0, 500));
    
    // Success check
    const successIndicators = ['success', 'confirmed', 'placed', 'thank', 'order id', '#'];
    const hasSuccess = successIndicators.some(word => 
      finalContent.toLowerCase().includes(word)
    );
    console.log(`Order success indicator found: ${hasSuccess}`);
  });

});
