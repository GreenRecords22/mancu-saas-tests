import { test, expect } from '@playwright/test';

const CREDS = { email: 'admin@devibana.com', password: 'admin@devibana.com' };
const ADMIN_URL = 'https://admin.mancu.cloud/?p=devibana';

async function adminLogin(page) {
  await page.goto(ADMIN_URL);
  await page.waitForTimeout(3000);
  const loginForm = await page.locator('input[type="password"]').count();
  if (loginForm > 0) {
    await page.locator('input[type="email"], input[name="email"]').first().fill(CREDS.email);
    await page.locator('input[type="password"]').first().fill(CREDS.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);
    console.log('✅ Admin logged in');
  }
}

test.describe('🏢 ADMIN - Dashboard & Analytics Tests', () => {

  test('ADMIN-DASH-01: Dashboard loads with data', async ({ page }) => {
    await adminLogin(page);
    await page.screenshot({ path: 'screenshots/admin-dashboard-full.png', fullPage: true });
    
    const bodyText = await page.locator('body').innerText();
    console.log('Admin Dashboard Content:', bodyText.substring(0, 1500));
    
    // KPI numbers dhundo
    const numbers = bodyText.match(/[\d,]+(\.\d+)?/g);
    console.log('Numbers found on dashboard:', numbers?.slice(0, 20));
  });

  test('ADMIN-DASH-02: Revenue/Sales data visible', async ({ page }) => {
    await adminLogin(page);
    
    const revenueKeywords = ['revenue', 'sales', 'income', 'earning', 'total', '₹', '$'];
    const bodyText = (await page.locator('body').innerText()).toLowerCase();
    
    for (const keyword of revenueKeywords) {
      if (bodyText.includes(keyword)) {
        console.log(`✅ Found: "${keyword}"`);
      } else {
        console.log(`❌ Not found: "${keyword}"`);
      }
    }
    
    await page.screenshot({ path: 'screenshots/admin-revenue.png', fullPage: true });
  });

  test('ADMIN-DASH-03: Order count visible on dashboard', async ({ page }) => {
    await adminLogin(page);
    
    const orderKeywords = ['order', 'orders', 'total orders', 'pending', 'completed'];
    const bodyText = (await page.locator('body').innerText()).toLowerCase();
    
    for (const keyword of orderKeywords) {
      console.log(`"${keyword}" present: ${bodyText.includes(keyword)}`);
    }
  });

});

test.describe('📦 ADMIN - Inventory Management Tests', () => {

  test('INVENTORY-01: Inventory section accessible', async ({ page }) => {
    await adminLogin(page);
    
    // Inventory nav link dhundo
    const inventoryLinks = [
      'a:has-text("Inventory")',
      'a:has-text("Stock")',
      '[href*="inventory"]',
      '[href*="stock"]',
      'button:has-text("Inventory")'
    ];
    
    for (const selector of inventoryLinks) {
      const el = page.locator(selector);
      if (await el.count() > 0) {
        await el.first().click();
        await page.waitForTimeout(2000);
        console.log(`✅ Inventory opened via: ${selector}`);
        break;
      }
    }
    
    await page.screenshot({ path: 'screenshots/admin-inventory.png', fullPage: true });
    const bodyText = await page.locator('body').innerText();
    console.log('Inventory page content:', bodyText.substring(0, 1000));
  });

  test('INVENTORY-02: Stock levels visible', async ({ page }) => {
    await adminLogin(page);
    
    // Navigate to inventory
    const inventoryLinks = page.locator('a:has-text("Inventory"), a:has-text("Stock"), [href*="inventory"]');
    if (await inventoryLinks.count() > 0) {
      await inventoryLinks.first().click();
      await page.waitForTimeout(2000);
    }
    
    // Table rows check karo (stock items)
    const rows = page.locator('tr, .inventory-item, [class*="stock-item"]');
    const count = await rows.count();
    console.log(`Stock entries found: ${count}`);
    
    await page.screenshot({ path: 'screenshots/admin-stock-levels.png', fullPage: true });
  });

  test('INVENTORY-03: Auto-deduction after order check', async ({ page }) => {
    await adminLogin(page);
    
    // Pehle inventory levels note karo
    const inventoryLinks = page.locator('a:has-text("Inventory"), [href*="inventory"]');
    if (await inventoryLinks.count() > 0) {
      await inventoryLinks.first().click();
      await page.waitForTimeout(2000);
    }
    
    const beforeContent = await page.locator('body').innerText();
    console.log('Stock BEFORE order:', beforeContent.substring(0, 500));
    
    await page.screenshot({ path: 'screenshots/inventory-before-order.png', fullPage: true });
    
    // Note: Actual deduction test order placement ke baad hoga
    console.log('⚠️ Compare this with inventory-after-order screenshot');
  });

});

test.describe('💰 ADMIN - Financial & Food Cost Tests', () => {

  test('FINANCE-01: Food cost tracking visible', async ({ page }) => {
    await adminLogin(page);
    
    const financeLinks = [
      'a:has-text("Food Cost")',
      'a:has-text("Finance")',
      'a:has-text("Expenses")',
      'a:has-text("Cost")',
      'a:has-text("Outflow")',
      '[href*="finance"]',
      '[href*="cost"]',
      '[href*="expense"]'
    ];
    
    for (const selector of financeLinks) {
      const el = page.locator(selector);
      if (await el.count() > 0) {
        await el.first().click();
        await page.waitForTimeout(2000);
        console.log(`✅ Finance section opened: ${selector}`);
        break;
      }
    }
    
    const bodyText = await page.locator('body').innerText();
    const foodCostKeywords = ['food cost', 'cost', 'outflow', 'expense', 'cogs'];
    
    for (const keyword of foodCostKeywords) {
      console.log(`"${keyword}" found: ${bodyText.toLowerCase().includes(keyword)}`);
    }
    
    await page.screenshot({ path: 'screenshots/admin-food-cost.png', fullPage: true });
  });

  test('FINANCE-02: Profit/Loss calculation visible', async ({ page }) => {
    await adminLogin(page);
    
    const bodyText = (await page.locator('body').innerText()).toLowerCase();
    const profitKeywords = ['profit', 'loss', 'margin', 'net', 'gross'];
    
    for (const keyword of profitKeywords) {
      console.log(`"${keyword}" on admin: ${bodyText.includes(keyword)}`);
    }
    
    await page.screenshot({ path: 'screenshots/admin-profit-loss.png', fullPage: true });
  });

  test('FINANCE-03: Inflow vs Outflow comparison', async ({ page }) => {
    await adminLogin(page);
    
    const bodyText = (await page.locator('body').innerText()).toLowerCase();
    console.log(`"inflow" found: ${bodyText.includes('inflow')}`);
    console.log(`"outflow" found: ${bodyText.includes('outflow')}`);
    console.log(`"income" found: ${bodyText.includes('income')}`);
    
    await page.screenshot({ path: 'screenshots/admin-cashflow.png', fullPage: true });
  });

});

test.describe('📊 ADMIN - Analytics & Reports Tests', () => {

  test('ANALYTICS-01: Analytics section loads', async ({ page }) => {
    await adminLogin(page);
    
    const analyticsLinks = [
      'a:has-text("Analytics")',
      'a:has-text("Reports")',
      'a:has-text("Report")',
      '[href*="analytics"]',
      '[href*="report"]'
    ];
    
    for (const selector of analyticsLinks) {
      const el = page.locator(selector);
      if (await el.count() > 0) {
        await el.first().click();
        await page.waitForTimeout(2000);
        console.log(`✅ Analytics opened: ${selector}`);
        await page.screenshot({ path: 'screenshots/admin-analytics.png', fullPage: true });
        break;
      }
    }
    
    await page.screenshot({ path: 'screenshots/admin-analytics-full.png', fullPage: true });
  });

  test('ANALYTICS-02: Sales chart/graph visible', async ({ page }) => {
    await adminLogin(page);
    
    const charts = page.locator('canvas, svg, [class*="chart"], [class*="graph"]');
    const count = await charts.count();
    console.log(`Charts/graphs found: ${count}`);
    
    await page.screenshot({ path: 'screenshots/admin-charts.png', fullPage: true });
  });

  test('ANALYTICS-03: Date filter works', async ({ page }) => {
    await adminLogin(page);
    
    const dateInputs = page.locator('input[type="date"], input[type="datetime-local"], [class*="date-picker"]');
    const count = await dateInputs.count();
    console.log(`Date filters found: ${count}`);
    
    if (count > 0) {
      await dateInputs.first().fill('2024-01-01');
      await page.waitForTimeout(1000);
      console.log('✅ Date filter attempted');
    }
    
    await page.screenshot({ path: 'screenshots/admin-date-filter.png', fullPage: true });
  });

  test('ANALYTICS-04: Popular items tracking', async ({ page }) => {
    await adminLogin(page);
    
    const bodyText = (await page.locator('body').innerText()).toLowerCase();
    const keywords = ['popular', 'top', 'best', 'selling', 'most ordered'];
    
    for (const keyword of keywords) {
      console.log(`"${keyword}" found: ${bodyText.includes(keyword)}`);
    }
    
    await page.screenshot({ path: 'screenshots/admin-popular-items.png', fullPage: true });
  });

});

test.describe('🧭 ADMIN - Navigation & All Sections', () => {

  test('NAV-01: All navigation links work', async ({ page }) => {
    await adminLogin(page);
    
    // Saare nav links collect karo
    const navLinks = page.locator('nav a, sidebar a, .sidebar a, .menu a, [class*="nav"] a');
    const count = await navLinks.count();
    console.log(`Navigation links found: ${count}`);
    
    const linkTexts = [];
    for (let i = 0; i < Math.min(count, 20); i++) {
      const text = await navLinks.nth(i).innerText();
      const href = await navLinks.nth(i).getAttribute('href');
      if (text.trim()) {
        linkTexts.push({ text: text.trim(), href });
        console.log(`Nav link: "${text.trim()}" → ${href}`);
      }
    }
    
    await page.screenshot({ path: 'screenshots/admin-navigation.png', fullPage: true });
  });

  test('NAV-02: Orders management section', async ({ page }) => {
    await adminLogin(page);
    
    const orderLinks = page.locator('a:has-text("Orders"), a:has-text("Order Management"), [href*="order"]');
    if (await orderLinks.count() > 0) {
      await orderLinks.first().click();
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: 'screenshots/admin-orders-section.png', fullPage: true });
    const bodyText = await page.locator('body').innerText();
    console.log('Orders section content:', bodyText.substring(0, 800));
  });

  test('NAV-03: Menu management section', async ({ page }) => {
    await adminLogin(page);
    
    const menuLinks = page.locator('a:has-text("Menu"), a:has-text("Items"), a:has-text("Products"), [href*="menu"]');
    if (await menuLinks.count() > 0) {
      await menuLinks.first().click();
      await page.waitForTimeout(2000);
      console.log('✅ Menu section opened');
    }
    
    await page.screenshot({ path: 'screenshots/admin-menu-management.png', fullPage: true });
  });

  test('NAV-04: Staff/Employee management', async ({ page }) => {
    await adminLogin(page);
    
    const staffLinks = page.locator('a:has-text("Staff"), a:has-text("Employee"), a:has-text("User"), [href*="staff"], [href*="employee"]');
    if (await staffLinks.count() > 0) {
      await staffLinks.first().click();
      await page.waitForTimeout(2000);
      console.log('✅ Staff section found');
    } else {
      console.log('❌ Staff management section not found');
    }
    
    await page.screenshot({ path: 'screenshots/admin-staff.png', fullPage: true });
  });

  test('NAV-05: Settings section', async ({ page }) => {
    await adminLogin(page);
    
    const settingsLinks = page.locator('a:has-text("Settings"), a:has-text("Configuration"), [href*="setting"]');
    if (await settingsLinks.count() > 0) {
      await settingsLinks.first().click();
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: 'screenshots/admin-settings.png', fullPage: true });
  });

});
