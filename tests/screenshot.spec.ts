import { test, expect } from '@playwright/test';

test('screenshot login page', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  // Wait for the page to load completely (you can adjust this based on your app's behavior)
  await page.waitForLoadState('networkidle'); 
  await page.screenshot({ path: 'output/login-page.png', fullPage: true });
});
