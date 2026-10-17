const { chromium } = require('playwright-core');
const { execFileSync } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const current = process.env.CURRENT_URL || 'http://127.0.0.1:3000';
const previous = process.env.PREVIOUS_URL || 'http://127.0.0.1:3001';
const output = process.env.VISUAL_OUTPUT_DIR || '/tmp/tour-raffle-m3-browser';
fs.mkdirSync(output, { recursive: true });
const fixture = (module, args = []) => execFileSync('.venv/bin/python', ['-m', `scripts.${module}`, ...args], {
  cwd: path.join(root, 'backend'), env: { ...process.env, APP_ENV: 'test' }, encoding: 'utf8',
}).trim();

const navigate = (page, url) => page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
const hydrated = (page, selector = 'form') => page.waitForFunction(value => {
  const element = document.querySelector(value);
  return Boolean(element && Object.keys(element).some(key => key.startsWith('__reactFiber$')));
}, selector);

async function signup(page, email) {
  await navigate(page, `${current}/sign-up`);
  await hydrated(page);
  await page.getByPlaceholder('Enter your full name').fill('Campaign Browser');
  await page.locator('form input[name="email"]').fill(email);
  await page.getByPlaceholder('Create a strong password').fill('LongPassword123!');
  await page.locator('select').selectOption({ label: 'Ghana' });
  await page.locator('#terms').check();
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.waitForURL('**/sign-in?registered=1', { waitUntil: 'domcontentloaded' });
}

async function login(page, email) {
  await navigate(page, `${current}/sign-in`);
  await hydrated(page);
  await page.locator('form input[name="email"]').fill(email);
  await page.getByPlaceholder('Enter your password').fill('LongPassword123!');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL('**/dashboard', { waitUntil: 'domcontentloaded' });
}

async function capture(page, url, route, width, label) {
  await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
  await navigate(page, `${url}${route}`);
  if (label === 'current' && route === '/admin/campaigns') await page.getByText('No campaigns found.').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  const file = path.join(output, `${label}-${route.replaceAll('/', '_')}-${width}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return {
    file,
    size: await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight })),
    geometry: await page.evaluate(() => ['h1', '.shadow-card', 'table', 'thead', 'form'].flatMap(selector => [...document.querySelectorAll(selector)].slice(0, 2).map(element => {
      const rect = element.getBoundingClientRect();
      return { selector, x: Math.round(rect.x), y: Math.round(rect.y + scrollY), width: Math.round(rect.width), height: Math.round(rect.height) };
    }))),
  };
}

(async () => {
  fixture('reset_browser_db');
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined, args: ['--no-sandbox'] });
  try {
    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const memberContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const admin = await adminContext.newPage();
    const member = await memberContext.newPage();
    const suffix = Date.now();
    const adminEmail = `m3-admin-${suffix}@example.com`;
    const memberEmail = `m3-member-${suffix}@example.com`;
    await signup(admin, adminEmail);
    await signup(member, memberEmail);
    fixture('seed_admin_browser', ['--email', adminEmail]);
    await login(admin, adminEmail);
    await login(member, memberEmail);

    assert.equal(await member.evaluate(async () => (await fetch('/api/v1/admin/campaigns')).status), 403);
    await navigate(member, `${current}/admin/campaigns`);
    await member.waitForURL('**/sign-in');
    await login(member, memberEmail);
    await navigate(admin, `${current}/admin/campaigns`);
    await admin.getByText('No campaigns found.').waitFor();

    if (!process.env.SKIP_VISUAL) {
      for (const width of [1440, 390]) {
        for (const route of ['/admin/campaigns', '/admin/campaigns/create']) {
          const old = await capture(admin, previous, route, width, 'previous');
          const now = await capture(admin, current, route, width, 'current');
          fs.writeFileSync(path.join(output, `comparison-${route.replaceAll('/', '_')}-${width}.json`), JSON.stringify({ route, width, previous: old, current: now }, null, 2));
          console.log(`visual ${route} ${width}: previous ${old.size.width}x${old.size.height}; current ${now.size.width}x${now.size.height}`);
          assert.equal(old.size.width, now.size.width, `Horizontal overflow changed on ${route}`);
        }
      }
    }
    if (process.env.VISUAL_ONLY) {
      console.log('Visual captures completed against the previous committed frontend.');
      return;
    }

    await navigate(admin, `${current}/admin/campaigns/create`);
    await hydrated(admin);
    await admin.getByLabel('Campaign Name *').fill('Browser campaign');
    await admin.getByLabel('Description').fill('Browser fixture');
    await admin.getByLabel('Destination *').fill('Kenya');
    await admin.getByLabel('Prize Value *').fill('1000');
    await admin.getByLabel('Coupon Price *').fill('10');
    await admin.getByLabel('Entry Capacity *').fill('3');
    await admin.getByLabel('Winner Count *').fill('4');
    const day = offset => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
    await admin.getByLabel('Start Date *').fill(day(-1));
    await admin.getByLabel('End Date *').fill(day(2));
    await admin.getByLabel('Feature this campaign on the home page').check();
    await admin.getByRole('button', { name: 'Save Campaign' }).click();
    await admin.getByRole('alert').getByText('Winner count cannot exceed capacity').waitFor();
    await admin.getByLabel('Winner Count *').fill('1');
    await admin.route('**/api/v1/admin/campaigns', route => route.request().method() === 'POST' ? route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }) : route.continue());
    await admin.getByRole('button', { name: 'Save Campaign' }).click();
    await admin.getByRole('alert').getByText('The campaign request could not be completed.').waitFor();
    await admin.unroute('**/api/v1/admin/campaigns');
    await admin.getByRole('button', { name: 'Save Campaign' }).click();
    await admin.waitForURL(/\/admin\/campaigns\/[0-9a-f-]{36}$/, { waitUntil: 'domcontentloaded' });
    const campaignId = admin.url().split('/').pop();
    await admin.getByText('Current status:').waitFor();
    await admin.getByRole('button', { name: 'Open', exact: true }).click();
    await admin.getByText('Campaign is now open.').waitFor();

    await navigate(admin, `${current}/admin/campaigns`);
    await admin.getByText('Browser campaign').waitFor();
    assert.match(await admin.locator('tr', { hasText: 'Browser campaign' }).innerText(), /Open/);
    await admin.getByPlaceholder('Search campaigns...').fill('missing');
    await admin.getByText('No campaigns found.').waitFor();
    await admin.getByPlaceholder('Search campaigns...').fill('Browser');
    await admin.getByText('Browser campaign').waitFor();

    const codes = fixture('seed_campaign_coupon', ['--owner-email', memberEmail, '--campaign-id', campaignId, '--count', '2']).split('\n');
    for (const code of codes) {
      await navigate(member, `${current}/dashboard/entries/register?code=${encodeURIComponent(code)}`);
      await member.waitForFunction(value => document.querySelector('input[placeholder="Enter your coupon code"]')?.value === value, code);
      await member.getByRole('button', { name: 'Check Code' }).click();
      await member.getByText('Entry Confirmed!').waitFor();
    }
    await navigate(admin, `${current}/admin/campaigns/${campaignId}`);
    await hydrated(admin);
    await admin.getByText('2 / 3 entries').waitFor();
    assert(await admin.getByLabel('Prize Value *').isDisabled());
    await admin.getByLabel('Campaign Name *').fill('Browser campaign updated');
    await admin.getByLabel('Entry Capacity *').fill('1');
    await admin.getByRole('button', { name: 'Save Campaign' }).click();
    await admin.getByRole('alert').getByText('Capacity cannot be below confirmed entries').waitFor();
    await admin.getByLabel('Entry Capacity *').fill('2');
    await admin.getByRole('button', { name: 'Save Campaign' }).click();
    await admin.getByText('Campaign saved.').waitFor();
    await admin.getByText('2 / 2 entries').waitFor();
    await admin.getByText('Current status: Closed').waitFor();
    assert.equal(await admin.evaluate(async id => { const response = await fetch(`/api/v1/admin/campaigns/${id}`); return (await response.json()).status; }, campaignId), 'closed');

    await admin.route('**/api/v1/admin/campaigns', async route => { await new Promise(resolve => setTimeout(resolve, 800)); await route.continue(); });
    await navigate(admin, `${current}/admin/campaigns`);
    await admin.getByText('Loading campaigns...').waitFor();
    await admin.getByText('Browser campaign updated').waitFor();
    await admin.unroute('**/api/v1/admin/campaigns');
    await admin.route('**/api/v1/admin/campaigns', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
    await navigate(admin, `${current}/admin/campaigns`);
    await admin.getByRole('alert').getByText('The campaign request could not be completed.').waitFor();
    assert.equal(await admin.getByText('No campaigns found.').count(), 0);
    await admin.unroute('**/api/v1/admin/campaigns');
    await admin.route('**/api/v1/admin/campaigns', route => route.fulfill({ status: 403, contentType: 'application/json', body: '{}' }));
    await navigate(admin, `${current}/admin/campaigns`);
    await admin.getByRole('alert').getByText('You do not have permission to manage campaigns.').waitFor();
    await admin.unroute('**/api/v1/admin/campaigns');
    await adminContext.clearCookies();
    await navigate(admin, `${current}/admin/campaigns`);
    await admin.waitForURL('**/sign-in');
    console.log('Browser milestone 3 flow passed: admin permissions, empty/loading/error, validation, create, edit, transition, entry locks, capacity guard, and expired session.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
