const { chromium } = require('playwright-core');
const { execFileSync } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const origin = 'http://127.0.0.1:3000';
const output = '/tmp/tour-raffle-integration-browser';
fs.mkdirSync(output, { recursive: true });
const fixture = (name, args = []) => execFileSync('.venv/bin/python', ['-m', `scripts.${name}`, ...args], {
  cwd: path.join(root, 'backend'), env: { ...process.env, APP_ENV: 'test' }, encoding: 'utf8',
}).trim();
const navigate = (page, route) => page.goto(origin + route, { waitUntil: 'commit', timeout: 60000 });
async function hydrated(page, selector) {
  await page.waitForFunction(value => {
    const element = document.querySelector(value);
    return Boolean(element && Object.keys(element).some(key => key.startsWith('__reactFiber$')));
  }, selector, { timeout: 60000 });
}
async function api(page, route, method = 'GET', body) {
  return page.evaluate(async ({ route, method, body }) => {
    const response = await fetch('/api/v1' + route, {
      method, headers: { 'Content-Type': 'application/json' },
      body: body && JSON.stringify(body), credentials: 'include',
    });
    return { status: response.status, data: await response.json() };
  }, { route, method, body });
}
async function registerAndLoginWithForms(page, email) {
  await navigate(page, '/sign-up');
  await hydrated(page, 'form');
  await page.getByPlaceholder('Enter your full name').fill('Integration Admin');
  await page.locator('form input[name="email"]').fill(email);
  await page.getByPlaceholder('Create a strong password').fill('LongPassword123!');
  await page.locator('select').selectOption({ label: 'Ghana' });
  await page.locator('#terms').check();
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.waitForURL('**/sign-in?registered=1', { waitUntil: 'commit', timeout: 60000 });
  await hydrated(page, 'form');
  await page.locator('form input[name="email"]').fill(email);
  await page.getByPlaceholder('Enter your password').fill('LongPassword123!');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL('**/dashboard', { waitUntil: 'commit', timeout: 60000 });
  assert.equal((await api(page, '/users/me')).status, 200);
}
async function fixtureAccount(page, email) {
  await navigate(page, '/sign-in');
  const registration = await api(page, '/auth/register', 'POST', { full_name: 'Integration Member', email, password: 'LongPassword123!', country: 'Ghana', accept_terms: true });
  assert.equal(registration.status, 201, JSON.stringify(registration));
  const login = await api(page, '/auth/login', 'POST', { email, password: 'LongPassword123!' });
  assert.equal(login.status, 200, JSON.stringify(login));
  await navigate(page, '/dashboard');
}

(async () => {
  fixture('reset_browser_db');
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, args: ['--no-sandbox'] });
  try {
    const admin = await browser.newPage();
    const member = await browser.newPage();
    const second = await browser.newPage();
    const suffix = Date.now();
    const adminEmail = `integration-admin-${suffix}@example.com`;
    const memberEmail = `integration-member-${suffix}@example.com`;
    const secondEmail = `integration-second-${suffix}@example.com`;
    await registerAndLoginWithForms(admin, adminEmail);
    await fixtureAccount(member, memberEmail);
    await fixtureAccount(second, secondEmail);
    fixture('seed_admin_browser', ['--email', adminEmail]);
    assert.equal((await api(admin, '/admin/me')).status, 200);
    assert.equal((await api(member, '/admin/draws')).status, 403);
    assert.equal((await api(second, '/admin/campaigns')).status, 403);
    console.log('registration/login and member/admin boundaries passed');

    const now = Date.now();
    const campaign = await api(admin, '/admin/campaigns', 'POST', {
      name: 'Integration draw', destination: 'Kenya', prize_value: '100', currency: 'USD', coupon_price: '10',
      max_capacity: 2, winner_count: 2, start_date: new Date(now - 86400000).toISOString(),
      end_date: new Date(now + 86400000).toISOString(), is_featured: true,
    });
    assert.equal(campaign.status, 201, JSON.stringify(campaign));
    const id = campaign.data.id;
    assert.equal((await api(admin, `/admin/campaigns/${id}/status`, 'POST', { status: 'open' })).status, 200);
    const code1 = fixture('seed_campaign_coupon', ['--owner-email', memberEmail, '--campaign-id', id, '--count', '1']);
    const code2 = fixture('seed_campaign_coupon', ['--owner-email', secondEmail, '--campaign-id', id, '--count', '1']);
    await navigate(member, '/dashboard/coupons');
    await member.getByText(code1).waitFor();
    await navigate(member, `/dashboard/entries/register?code=${encodeURIComponent(code1)}`);
    await member.waitForFunction(value => document.querySelector('input[placeholder="Enter your coupon code"]')?.value === value, code1);
    await member.getByRole('button', { name: 'Check Code' }).click();
    await member.getByText('Entry Confirmed!').waitFor();
    assert.equal((await api(second, '/coupons/redeem', 'POST', { code: code1 })).status, 404);
    assert.equal((await api(second, '/coupons/redeem', 'POST', { code: code2 })).status, 200);
    const campaignState = await api(admin, `/admin/campaigns/${id}`);
    assert.equal(campaignState.data.status, 'closed');
    assert.equal(campaignState.data.current_entries, 2);
    await navigate(member, '/dashboard/entries');
    await member.getByText(code1).waitFor();
    console.log('fixture redemption and capacity closure passed');

    await navigate(admin, '/admin/draws');
    await admin.getByText('Integration draw').waitFor();
    for (const [label, button] of [['prepare', 'Prepare Snapshot'], ['approve', 'Approve Snapshot'], ['execute', 'Execute Draw']]) {
      await admin.getByRole('button', { name: button }).click();
      await admin.getByText(`Draw ${label} completed.`).waitFor();
    }
    const completed = (await api(admin, `/admin/draws/${id}`)).data;
    assert.equal(completed.status, 'completed');
    assert.equal(completed.winners.length, 2);
    assert.equal(new Set(completed.winners.map(w => w.user_id)).size, 2);
    assert.equal((await api(member, '/draws/mine')).data.length, 0);
    assert.deepEqual((await api(admin, `/admin/draws/${id}/execute`, 'POST')).data.winners, completed.winners);
    await admin.getByRole('button', { name: 'Publish Results' }).click();
    await admin.getByText('Draw publish completed.').waitFor();
    assert.equal((await api(member, '/draws/mine')).data.length, 1);
    assert.equal((await api(second, '/draws/mine')).data.length, 1);
    assert.equal((await api(member, '/admin/draws')).status, 403);
    const publicResult = (await api(member, '/draws/published')).data;
    assert.equal(publicResult.length, 1);
    assert(!JSON.stringify(publicResult).includes('entry_code'));
    assert(!JSON.stringify(publicResult).includes('user_id'));
    await navigate(member, '/dashboard/draws/results');
    await member.getByText('Integration draw').waitFor();
    console.log('draw preparation, approval, execution, publication, and private results passed');

    for (const width of [1440, 390]) {
      await admin.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
      await member.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
      await navigate(admin, '/admin/draws');
      await admin.getByText('Integration draw').waitFor();
      await navigate(member, '/dashboard/draws/results');
      await member.getByText('Integration draw').waitFor();
      assert.equal(await admin.evaluate(() => document.documentElement.scrollWidth), width);
      assert.equal(await member.evaluate(() => document.documentElement.scrollWidth), width);
      await admin.screenshot({ path: path.join(output, `admin-${width}.png`), fullPage: true });
      await member.screenshot({ path: path.join(output, `member-${width}.png`), fullPage: true });
    }
    console.log('integration browser journey passed; screenshots: ' + output);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
