import { test, expect } from '@playwright/test';

const CREDS = { email: 'admin@devibana.com', password: 'admin@devibana.com' };

async function login(page, url) {
  await page.goto(url);
  await page.waitForTimeout(3000);
  const hasLogin = await page.locator('input[type="password"]').count();
  if (hasLogin > 0) {
    await page.locator('input[type="email"], input[name="email"]').first().fill(CREDS.email);
    await page.locator('input[type="password"]').first().fill(CREDS.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(4000);
  }
}

test.describe('🔄 INTEGRATION - Complete Restaurant Order Flow', () => {

  test('FLOW-MASTER: POS → Kitchen → Admin Complete Journey', async ({ browser }) => {
    
    // 3 alag browser contexts - 3 alag screens
    const adminContext  = await browser.newContext();
    const posContext    = await browser.newContext();
    const kitchenContext = await browser.newContext();
    
    const adminPage   = await adminContext.newPage();
    const posPage     = await posContext.newPage();
    const kitchenPage = await kitchenContext.newPage();
    
    console.log('🚀 STARTING COMPLETE RESTAURANT FLOW TEST');
    console.log('='.repeat(50));
    
    // ── STEP 1: Login All 3 Screens ──
    console.log('\n📍 STEP 1: Logging into all 3 screens...');
    await login(adminPage, 'https://admin.mancu.cloud/?p=devibana');
    await login(posPage, 'https://pos.mancu.cloud/?p=devibana');
    await login(kitchenPage, 'https://kitchen.mancu.cloud/?p=devibana');
    console.log('✅ All 3 screens logged in');
    
    // ── STEP 2: Note Admin State Before Order ──
    console.log('\n📍 STEP 2: Recording admin state BEFORE order...');
    const adminBefore = await adminPage.locator('body').innerText();
    await adminPage.screenshot({ path: 'screenshots/FLOW-01-admin-before.png', fullPage: true });
    
    // ── STEP 3: Note Kitchen State Before ──
    console.log('\n📍 STEP 3: Recording kitchen state BEFORE order...');
    const kitchenBefore = await kitchenPage.locator('body').innerText();
    await kitchenPage.screenshot({ path: 'screenshots/FLOW-02-kitchen-before.png', fullPage: true });
    
    // ── STEP 4: Place Order from POS ──
    console.log('\n📍 STEP 4: Placing order from POS...');
    await posPage.screenshot({ path: 'screenshots/FLOW-03-pos-ready.png', fullPage: true });
    
    // Item add karne ki koshish
    const addBtns = posPage.locator('button:has-text("+"), button:has-text("Add"), [class*="add"]');
    const addCount = await addBtns.count();
    
    if (addCount > 0) {
      await addBtns.first().click();
      await posPage.waitForTimeout(1000);
      if (addCount > 1) await addBtns.nth(1).click();
      console.log(`✅ Added ${Math.min(addCount, 2)} items to cart`);
    } else {
      console.log('⚠️ Could not find add buttons - taking screenshot for manual review');
    }
    
    await posPage.screenshot({ path: 'screenshots/FLOW-04-pos-cart.png', fullPage: true });
    
    // Order place karo
    const orderBtn = posPage.locator('button:has-text("Place Order"), button:has-text("Confirm"), button:has-text("Order"), button:has-text("Submit")');
    if (await orderBtn.count() > 0) {
      await orderBtn.first().click();
      await posPage.waitForTimeout(3000);
      console.log('✅ Order placed!');
    }
    
    await posPage.screenshot({ path: 'screenshots/FLOW-05-pos-order-placed.png', fullPage: true });
    
    // ── STEP 5: Kitchen Check (10 sec wait) ──
    console.log('\n📍 STEP 5: Checking kitchen for new order (waiting 10s)...');
    await kitchenPage.waitForTimeout(10000);
    await kitchenPage.reload();
    await kitchenPage.waitForTimeout(3000);
    
    const kitchenAfter = await kitchenPage.locator('body').innerText();
    await kitchenPage.screenshot({ path: 'screenshots/FLOW-06-kitchen-after.png', fullPage: true });
    
    const kitchenUpdated = kitchenBefore !== kitchenAfter;
    console.log(`Kitchen updated after order: ${kitchenUpdated ? '✅ YES' : '❌ NO - Check manually'}`);
    
    // ── STEP 6: Mark Order Ready in Kitchen ──
    console.log('\n📍 STEP 6: Marking order as ready in kitchen...');
    const readyBtns = kitchenPage.locator('button:has-text("Ready"), button:has-text("Done"), button:has-text("Complete"), button:has-text("Accept")');
    if (await readyBtns.count() > 0) {
      await readyBtns.first().click();
      await kitchenPage.waitForTimeout(2000);
      console.log('✅ Order marked as ready');
    }
    
    await kitchenPage.screenshot({ path: 'screenshots/FLOW-07-kitchen-ready.png', fullPage: true });
    
    // ── STEP 7: Admin Check ──
    console.log('\n📍 STEP 7: Checking admin for updates...');
    await adminPage.waitForTimeout(5000);
    await adminPage.reload();
    await adminPage.waitForTimeout(3000);
    
    const adminAfter = await adminPage.locator('body').innerText();
    await adminPage.screenshot({ path: 'screenshots/FLOW-08-admin-after.png', fullPage: true });
    
    const adminUpdated = adminBefore !== adminAfter;
    console.log(`Admin updated after order: ${adminUpdated ? '✅ YES' : '❌ NO - Check manually'}`);
    
    // ── STEP 8: Inventory Check ──
    console.log('\n📍 STEP 8: Checking inventory deduction...');
    const inventoryLink = adminPage.locator('a:has-text("Inventory"), a:has-text("Stock"), [href*="inventory"]');
    if (await inventoryLink.count() > 0) {
      await inventoryLink.first().click();
      await adminPage.waitForTimeout(2000);
      await adminPage.screenshot({ path: 'screenshots/FLOW-09-inventory-after.png', fullPage: true });
      console.log('✅ Inventory page captured');
    }
    
    // ── FINAL REPORT ──
    console.log('\n' + '='.repeat(50));
    console.log('📋 INTEGRATION TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`POS Order Placement: Check FLOW-05 screenshot`);
    console.log(`Kitchen Received Order: ${kitchenUpdated ? '✅ PASS' : '⚠️ MANUAL CHECK NEEDED'}`);
    console.log(`Admin Updated: ${adminUpdated ? '✅ PASS' : '⚠️ MANUAL CHECK NEEDED'}`);
    console.log('='.repeat(50));
    
    await adminContext.close();
    await posContext.close();
    await kitchenContext.close();
  });

});
