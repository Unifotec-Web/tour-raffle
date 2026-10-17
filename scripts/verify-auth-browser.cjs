const { chromium } = require('playwright-core');
const assert = require('assert');

const base = process.env.FRONTEND_URL || 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
    args: ['--no-sandbox'],
  });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${base}/dashboard`);
    await page.waitForURL('**/sign-in');
    const email = `browser-${Date.now()}@example.com`;
    await page.goto(`${base}/sign-up`);
    await page.getByPlaceholder('Enter your full name').fill('Browser Traveler');
    await page.locator('form input[name="email"]').fill(email);
    await page.getByPlaceholder('Create a strong password').fill('LongPassword123!');
    await page.locator('select').selectOption({ label: 'Ghana' });
    await page.locator('#terms').check();
    await page.getByRole('button', { name: 'Create Account' }).click();
    await page.waitForURL('**/sign-in?registered=1');
    await page.locator('form input[name="email"]').fill(email);
    await page.getByPlaceholder('Enter your password').fill('LongPassword123!');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.waitForURL('**/dashboard');
    const cookie = (await context.cookies()).find((item) => item.name === 'tour_raffle_session');
    assert(cookie && cookie.httpOnly && cookie.sameSite === 'Lax' && !cookie.secure);
    const checks = await page.evaluate(async () => ({
      session: (await fetch('/api/v1/auth/session')).status,
      admin: (await fetch('/api/v1/admin/me')).status,
    }));
    assert.deepEqual(checks, { session: 200, admin: 403 });
    await page.reload();
    assert(page.url().endsWith('/dashboard'));
    assert.equal(await page.evaluate(async () => (await fetch('/api/v1/auth/logout', { method: 'POST' })).status), 204);
    await page.goto(`${base}/dashboard`);
    await page.waitForURL('**/sign-in');
    console.log('Browser auth flow passed: registration, sign-in, session persistence, member/admin guards, logout.');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
