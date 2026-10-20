const { chromium } = require('playwright-core');
const { execFileSync } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const origin = process.env.FRONTEND_URL || 'http://127.0.0.1:3000';
const sink = process.env.LOCAL_EMAIL_SINK_DIR || '/tmp/tour-raffle-demo-mail';
const password = process.env.DEMO_PASSWORD;
const output = '/tmp/tour-raffle-demo-handoff';
if (!password || password.length < 12) throw new Error('Set DEMO_PASSWORD to an uncommitted password of at least 12 characters.');
if (process.env.APP_ENV !== 'test' || process.env.ENABLE_FAKE_PAYMENTS !== 'true' || process.env.ENABLE_LOCAL_DRAW !== 'true') throw new Error('Demo requires APP_ENV=test and explicit local fake-payment/draw flags.');
fs.mkdirSync(output, { recursive: true });
const fixture = (name, args = []) => execFileSync('.venv/bin/python', ['-m', `scripts.${name}`, ...args], { cwd: path.join(root, 'backend'), env: process.env, encoding: 'utf8' }).trim();
async function visit(page, route) { await page.goto(origin + route, { waitUntil: 'commit', timeout: 60000 }); }
async function api(page, route, method = 'GET', body) {
  return page.evaluate(async ({ route, method, body }) => {
    const response = await fetch('/api/v1' + route, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
    return { status: response.status, data: await response.json().catch(() => null) };
  }, { route, method, body });
}
function deliver() { fixture('run_email_outbox'); }
function mailLink(email, route) {
  const message = fs.readdirSync(sink).map(name => fs.readFileSync(path.join(sink, name), 'utf8')).find(text => text.includes(`To: ${email}\n`) && text.includes(route + '#token='));
  assert(message, `local email for ${email}`);
  return message.match(/https?:\/\/\S+/)[0];
}
async function registerAndVerify(page, email, name) {
  await visit(page, '/sign-up');
  await page.locator('input[name=full_name]').fill(name);
  await page.locator('input[name=email]').fill(email);
  await page.locator('input[name=password]').fill(password);
  await page.locator('select[name=country]').selectOption({ label: 'Ghana' });
  await page.locator('#terms').check();
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.waitForURL('**/verify-email', { timeout: 60000 });
  deliver();
  await page.goto(mailLink(email, '/verify-email'));
  await page.waitForURL('**/verification-complete', { timeout: 60000 });
  await page.getByText('Your email is verified.').waitFor();
}
async function login(page, email, admin = false) {
  await visit(page, admin ? '/admin/login' : '/sign-in');
  await page.locator('input[name=email]').fill(email);
  await page.locator('input[name=password]').fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL(admin ? '**/admin/campaigns' : '**/dashboard', { timeout: 60000 });
}
async function purchaseAndRegister(page, email) {
  await visit(page, '/dashboard/coupons/purchase');
  await page.getByText('Local Test Payment').waitFor();
  await page.getByRole('button', { name: /^1 Coupon/ }).click();
  await page.getByRole('button', { name: /Proceed to Checkout/ }).click();
  await page.waitForURL('**/dashboard/checkout?order=*', { timeout: 60000 });
  await page.getByText('Local Test Payment').waitFor();
  await page.getByRole('button', { name: 'Pay Now ($10.00)' }).click();
  await page.waitForURL('**/dashboard/payment/processing?order=*', { timeout: 60000 });
  await page.getByText('Payment Successful!').waitFor({ timeout: 30000 });
  const coupons = await api(page, '/users/me/coupons');
  assert.equal(coupons.status, 200);
  assert.equal(coupons.data.length, 1);
  const code = coupons.data[0].code;
  await visit(page, '/dashboard/coupons');
  await page.getByText(code).waitFor();
  await page.getByRole('link', { name: 'Register Entry' }).click();
  await page.getByRole('button', { name: 'Check Code' }).click();
  await page.getByText('Entry Confirmed!').waitFor();
  await visit(page, '/dashboard/entries');
  await page.getByText(code).waitFor();
  console.log(`Simulated $10 payment, coupon issuance, and registration passed for ${email}`);
}
(async () => {
  if (process.env.DEMO_RESET_DB === '1') fixture('reset_browser_db');
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, args: ['--no-sandbox'] });
  try {
    const admin = await browser.newPage(), member = await browser.newPage(), second = await browser.newPage();
    const stamp = Date.now();
    const adminEmail = `demo-admin-${stamp}@example.com`, memberEmail = `demo-member-${stamp}@example.com`, secondEmail = `demo-second-${stamp}@example.com`;
    await registerAndVerify(admin, adminEmail, 'Demo Admin');
    fixture('seed_admin_browser', ['--email', adminEmail]);
    await login(admin, adminEmail, true);
    assert.equal((await api(admin, '/admin/me')).status, 200);
    const time = Date.now();
    const created = await api(admin, '/admin/campaigns', 'POST', { name: 'Demo Travel Draw', description: 'Local test campaign', destination: 'Kenya', prize_value: '100', currency: 'USD', coupon_price: '10', max_capacity: 2, winner_count: 1, start_date: new Date(time - 86400000).toISOString(), end_date: new Date(time + 86400000).toISOString(), is_featured: true });
    assert.equal(created.status, 201, JSON.stringify(created));
    const campaignId = created.data.id;
    assert.equal((await api(admin, `/admin/campaigns/${campaignId}/status`, 'POST', { status: 'open' })).status, 200);
    await visit(member, '/current-raffle');
    await member.getByText('Demo Travel Draw').first().waitFor();
    await member.getByRole('link', { name: 'View Campaign →' }).click();
    await member.getByRole('link', { name: 'Get Coupons →' }).first().click();
    await member.waitForURL('**/sign-in', { timeout: 60000 });
    await member.getByRole('link', { name: 'Sign Up' }).click();
    await registerAndVerify(member, memberEmail, 'Demo Member');
    await login(member, memberEmail);
    await registerAndVerify(second, secondEmail, 'Demo Second Member');
    await login(second, secondEmail);
    assert.equal((await api(member, '/admin/draws')).status, 403);
    await purchaseAndRegister(member, memberEmail);
    await purchaseAndRegister(second, secondEmail);
    const state = await api(admin, `/admin/campaigns/${campaignId}`);
    assert.equal(state.data.status, 'closed'); assert.equal(state.data.current_entries, 2);
    assert.equal((await api(member, '/claims/mine')).data.length, 0);
    await visit(admin, '/admin/draws');
    await admin.getByText('Demo Travel Draw').waitFor();
    for (const [action, button] of [['prepare', 'Prepare Snapshot'], ['approve', 'Approve Snapshot'], ['execute', 'Execute Draw']]) {
      await admin.getByRole('button', { name: button }).click();
      await admin.getByText(`Draw ${action} completed.`).waitFor();
    }
    assert.equal((await api(member, '/claims/mine')).data.length, 0);
    await admin.getByRole('button', { name: 'Publish Results' }).click();
    await admin.getByText('Draw publish completed.').waitFor();
    const memberWins = (await api(member, '/claims/mine')).data;
    const secondWins = (await api(second, '/claims/mine')).data;
    assert.equal(memberWins.length + secondWins.length, 1);
    const winner = memberWins.length ? member : second;
    const winnerEmail = memberWins.length ? memberEmail : secondEmail;
    await visit(winner, '/dashboard/draws/my-wins');
    await winner.getByText('Demo Travel Draw').waitFor();
    await winner.getByRole('link', { name: 'Start claim' }).click();
    await winner.getByRole('link', { name: 'Start Claim Process' }).click();
    await winner.getByRole('button', { name: 'Submit Claim' }).click();
    await winner.getByText('submitted', { exact: true }).first().waitFor();
    const claimId = new URL(winner.url()).searchParams.get('claim');
    assert(claimId);
    assert.equal((await api(memberWins.length ? second : member, `/claims/${claimId}`)).status, 404);
    await visit(admin, '/admin/claims');
    await admin.getByText(winnerEmail).waitFor();
    await visit(admin, `/admin/claims/${claimId}`);
    await admin.getByLabel('Next status').selectOption('under_review');
    await admin.getByLabel('Reason').fill('Local demo claim review started');
    await admin.getByRole('button', { name: 'Record review' }).click();
    await admin.getByText('Review recorded.').waitFor();
    await admin.getByLabel('Next status').selectOption('approved');
    await admin.getByLabel('Reason').fill('Local demo claim approved for later fulfillment');
    await admin.getByRole('button', { name: 'Record review' }).click();
    await admin.getByText('Review recorded.').waitFor();
    await visit(winner, `/dashboard/draws/claim-status?claim=${claimId}`);
    await winner.getByText('approved', { exact: true }).first().waitFor();
    for (const width of [1440, 390]) {
      await winner.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
      await admin.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
      for (const [page, route, name] of [[winner, '/dashboard/draws/claim-status?claim=' + claimId, 'claim'], [admin, '/admin/draws', 'draw']]) {
        await visit(page, route); await page.locator('h1').first().waitFor();
        if (name === 'claim') await page.getByText('approved', { exact: true }).first().waitFor();
        else await page.getByText('Demo Travel Draw').waitFor();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width, `${name} overflow ${width}`);
        await page.screenshot({ path: path.join(output, `${name}-${width}.png`), fullPage: true });
      }
      if (width === 390) {
        await winner.getByRole('button', { name: 'Toggle Menu' }).click();
        await winner.getByRole('link', { name: 'My Wins' }).first().click();
        await winner.getByText('Demo Travel Draw').waitFor();
        await admin.getByRole('button', { name: 'Toggle Menu' }).click();
        await admin.getByRole('link', { name: 'Claims' }).first().click();
        await admin.getByText(winnerEmail).waitFor();
      }
    }
    console.log(`Demo journey passed. Campaign ${campaignId}; member ${memberEmail}; admin ${adminEmail}; second member ${secondEmail}; winner ${winnerEmail}. Local emails: ${sink}. Screenshots: ${output}.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
