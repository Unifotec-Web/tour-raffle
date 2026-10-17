const { chromium } = require('playwright-core');
const { execFileSync } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const current = process.env.CURRENT_URL || 'http://127.0.0.1:3000';
const original = process.env.ORIGINAL_URL || 'http://127.0.0.1:3001';
const output = process.env.VISUAL_OUTPUT_DIR || '/tmp/tour-raffle-m2-browser';
fs.mkdirSync(output, { recursive: true });
execFileSync('.venv/bin/python', ['-m', 'scripts.reset_browser_db'], {
  cwd: path.join(__dirname, '..', 'backend'), env: { ...process.env, APP_ENV: 'test' }, encoding: 'utf8',
});

async function signup(page, email) {
  await page.goto(`${current}/sign-up`);
  await page.getByPlaceholder('Enter your full name').fill('Browser Member');
  await page.locator('form input[name="email"]').fill(email);
  await page.getByPlaceholder('Create a strong password').fill('LongPassword123!');
  await page.locator('select').selectOption({ label: 'Ghana' });
  await page.locator('#terms').check();
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.waitForURL('**/sign-in?registered=1');
}

async function login(page, email) {
  await page.goto(`${current}/sign-in`);
  await page.locator('form input[name="email"]').fill(email);
  await page.getByPlaceholder('Enter your password').fill('LongPassword123!');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL('**/dashboard');
}

async function redeem(page, code, expected) {
  await page.goto(`${current}/dashboard/entries/register?code=${encodeURIComponent(code)}`);
  await page.waitForFunction(value => document.querySelector('input[placeholder="Enter your coupon code"]')?.value === value, code);
  await page.getByRole('button', { name: 'Check Code' }).click();
  if (expected === 'confirmed') await page.getByText('Entry Confirmed!').waitFor();
  else await page.getByRole('alert').getByText(expected).waitFor();
}

async function progress(page) {
  return page.evaluate(async () => (await fetch('/api/v1/campaigns/featured/progress')).json());
}

async function capture(page, url, route, width, name) {
  await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
  await page.goto(`${url}${route}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  const file = path.join(output, `${name}-${route.replaceAll('/', '_')}-${width}.png`);
  await page.screenshot({ path: file, fullPage: true });
  const geometry = await page.evaluate(() => {
    const selectors = ['h1', '.shadow-card', 'table', 'thead', 'input', 'button', '.shadow-progress'];
    return selectors.flatMap(selector => [...document.querySelectorAll(selector)].slice(0, 3).map(element => {
      const rect = element.getBoundingClientRect();
      return { selector, x: Math.round(rect.x), y: Math.round(rect.y + scrollY), width: Math.round(rect.width), height: Math.round(rect.height) };
    }));
  });
  return { file, size: await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight })), geometry };
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined, args: ['--no-sandbox'] });
  try {
    const ownerContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const otherContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const emptyContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const owner = await ownerContext.newPage();
    const other = await otherContext.newPage();
    const empty = await emptyContext.newPage();
    const suffix = Date.now();
    const ownerEmail = `m2-owner-${suffix}@example.com`;
    const otherEmail = `m2-other-${suffix}@example.com`;
    const emptyEmail = `m2-empty-${suffix}@example.com`;
    await signup(owner, ownerEmail);
    await signup(other, otherEmail);
    await signup(empty, emptyEmail);
    const fixture = JSON.parse(execFileSync('.venv/bin/python', ['-m', 'scripts.seed_browser_cases', '--owner-email', ownerEmail, '--other-email', otherEmail], {
      cwd: path.join(__dirname, '..', 'backend'),
      env: { ...process.env, APP_ENV: 'test' }, encoding: 'utf8',
    }));
    await login(owner, ownerEmail);
    await login(other, otherEmail);
    await login(empty, emptyEmail);

    await empty.goto(`${current}/dashboard/coupons`);
    await empty.getByText('No coupons found.').waitFor();
    await empty.goto(`${current}/dashboard/entries`);
    await empty.getByText('No entries found.').waitFor();

    await owner.goto(`${current}/dashboard/coupons`);
    await owner.getByText(fixture.valid).waitFor();
    assert.equal(await owner.locator('tbody tr').count(), 5);
    await owner.goto(`${current}/dashboard/entries`);
    await owner.getByText(fixture.used).waitFor();
    assert.equal(await owner.locator('tbody tr').count(), 1);
    const before = await progress(owner);
    assert.equal(before.current_entries, 1);

    for (const width of process.env.SKIP_VISUAL ? [] : [1440, 390]) {
      for (const route of ['/dashboard/coupons', '/dashboard/entries', '/dashboard/entries/register', '/']) {
        const prior = await capture(owner, original, route, width, 'previous');
        const latest = await capture(owner, current, route, width, 'current');
        const result = { route, width, previous: prior, current: latest };
        fs.writeFileSync(path.join(output, `comparison-${route.replaceAll('/', '_')}-${width}.json`), JSON.stringify(result, null, 2));
        console.log(`visual ${route} ${width}: previous ${prior.size.width}x${prior.size.height}; current ${latest.size.width}x${latest.size.height}`);
        assert.equal(prior.size.width, latest.size.width, `horizontal overflow changed on ${route} at ${width}px`);
      }
    }
    if (process.env.VISUAL_ONLY) {
      console.log('Visual captures completed against the previous committed frontend.');
      return;
    }

    await redeem(owner, fixture.valid, 'confirmed');
    assert.equal((await progress(owner)).current_entries, 2);
    await owner.goto(`${current}/dashboard/coupons`);
    await owner.getByText(fixture.valid).waitFor();
    assert.match(await owner.locator('tr', { hasText: fixture.valid }).innerText(), /Redeemed/);
    await owner.goto(`${current}/dashboard/entries`);
    await owner.getByText(fixture.valid).waitFor();
    assert.equal(await owner.locator('tbody tr').count(), 2);
    await owner.goto(current);
    await owner.getByText('Valid Entries', { exact: true }).first().waitFor();
    await owner.getByText('2', { exact: true }).first().waitFor();

    await redeem(owner, fixture.valid, 'confirmed');
    await owner.getByText('This coupon was already registered.').waitFor();
    assert.equal((await progress(owner)).current_entries, 2);
    await redeem(owner, fixture.used, 'confirmed');
    await owner.getByText('This coupon was already registered.').waitFor();
    assert.equal((await progress(owner)).current_entries, 2);
    await redeem(owner, 'TRF-NOT-A-REAL-CODE', 'Coupon not found');
    await redeem(owner, fixture.expired, 'Coupon has expired');
    await redeem(owner, fixture.closed, 'Registration is closed');
    await redeem(owner, fixture.full, 'Campaign is full');

    await other.goto(`${current}/dashboard/coupons`);
    await other.getByText(fixture.other).waitFor();
    assert.equal(await other.getByText(fixture.valid).count(), 0);
    await other.goto(`${current}/dashboard/entries`);
    await other.getByText(fixture.other).waitFor();
    assert.equal(await other.getByText(fixture.valid).count(), 0);
    await redeem(other, fixture.valid, 'Coupon not found');
    const validation = await other.evaluate(async code => (await fetch('/api/v1/coupons/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })).status, fixture.valid);
    assert.equal(validation, 404);

    await owner.route('**/api/v1/users/me/coupons', async route => { await new Promise(resolve => setTimeout(resolve, 800)); await route.continue(); });
    await owner.goto(`${current}/dashboard/coupons`);
    await owner.getByText('Loading coupons...').waitFor();
    await owner.getByText(fixture.valid).waitFor();
    await owner.unroute('**/api/v1/users/me/coupons');
    await owner.route('**/api/v1/users/me/coupons', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
    await owner.goto(`${current}/dashboard/coupons`);
    await owner.getByRole('alert').getByText('Unable to load coupons.').waitFor();
    assert.equal(await owner.getByText('No coupons found.').count(), 0);
    await owner.unroute('**/api/v1/users/me/coupons');
    await owner.route('**/api/v1/users/me/entries', async route => { await new Promise(resolve => setTimeout(resolve, 800)); await route.continue(); });
    await owner.goto(`${current}/dashboard/entries`);
    await owner.getByText('Loading entries...').waitFor();
    await owner.getByText(fixture.valid).waitFor();
    await owner.unroute('**/api/v1/users/me/entries');
    await owner.route('**/api/v1/users/me/entries', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
    await owner.goto(`${current}/dashboard/entries`);
    await owner.getByRole('alert').getByText('Unable to load entries.').waitFor();
    assert.equal(await owner.getByText('No entries found.').count(), 0);
    await owner.unroute('**/api/v1/users/me/entries');
    await owner.route('**/api/v1/campaigns/featured/progress', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
    await owner.goto(current);
    await owner.getByText('Campaign progress is unavailable.').waitFor();
    await owner.unroute('**/api/v1/campaigns/featured/progress');
    await owner.route('**/api/v1/users/me/coupons', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }));
    await owner.goto(`${current}/dashboard/coupons`);
    await owner.getByRole('alert').getByText('Your session has expired.').waitFor();
    await owner.getByRole('link', { name: 'Sign in again' }).waitFor();
    await owner.unroute('**/api/v1/users/me/coupons');
    await owner.route('**/api/v1/coupons/redeem', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }));
    await redeem(owner, fixture.valid, 'Your session has expired.');
    await owner.getByRole('link', { name: 'Sign in again' }).waitFor();
    await owner.unroute('**/api/v1/coupons/redeem');
    await ownerContext.clearCookies();
    await owner.goto(`${current}/dashboard/coupons`);
    await owner.waitForURL('**/sign-in');
    console.log('Browser milestone 2 flow passed: member data, redemption, retries, errors, isolation, loading, empty, API failure, and expired session.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
