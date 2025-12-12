const axios = require('axios');
const { chromium } = require('playwright');

(async () => {
  const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';
  const APP_BASE = process.env.APP_BASE || 'http://localhost:3000';

  try {
    console.log('Logging in to API...');
    const loginResp = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@gmail.com',
      password: 'admin1234'
    }, { timeout: 5000 });

    const { token, user } = loginResp.data;
    if (!token) {
      console.error('No token returned from login');
      process.exit(2);
    }

    console.log('Launching headless browser...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();

    // Inject localStorage before any page loads so the app sees the auth token/user
    const storageScript = `
      window.localStorage.setItem('token', ${JSON.stringify(token)});
      window.localStorage.setItem('user', ${JSON.stringify(JSON.stringify(user))});
    `;
    await context.addInitScript(storageScript);

    const page = await context.newPage();

    // Capture browser console
    page.on('console', (msg) => {
      try {
        console.log(`[browser console] ${msg.type()}: ${msg.text()}`);
      } catch (e) {
        console.log('[browser console] (error reading message)');
      }
    });

    // Capture dialogs (confirm/alert) and print their messages
    page.on('dialog', async (dialog) => {
      console.log(`[dialog] type=${dialog.type()} message=${dialog.message()}`);
      await dialog.accept();
    });

    console.log('Navigating to admin facilities page...');
    await page.goto(`${APP_BASE}/admin/facilities`, { waitUntil: 'networkidle' });

    // Wait for facility cards to appear
    await page.waitForSelector('.card', { timeout: 8000 });

    const firstCard = page.locator('.card').first();
    const buttons = firstCard.locator('button');
    const deleteButton = buttons.nth(1);

    console.log('Clicking delete button on first facility (will accept confirm)...');
    await deleteButton.click();

    // Wait a bit for network and UI handling
    await page.waitForTimeout(1500);

    console.log('Finished - closing browser');
    await browser.close();

    console.log('Test completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err && (err.message || err));
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
    process.exit(1);
  }
})();
