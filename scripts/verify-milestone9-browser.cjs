const { chromium } = require('playwright-core');
const { execFileSync } = require('child_process');
const { readFileSync, readdirSync, mkdirSync } = require('fs');
const assert = require('assert');
const path = require('path');
const root = path.join(__dirname, '..');
const base = 'http://127.0.0.1:3000';
const sink = '/tmp/tour-raffle-m9-mail';
const env = { ...process.env, APP_ENV: 'test', FRONTEND_URL: base, DATABASE_URL: 'postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify', LOCAL_EMAIL_SINK_DIR: sink };
function deliver() { execFileSync('.venv/bin/python', ['-m', 'scripts.run_email_outbox'], { cwd: path.join(root, 'backend'), env, encoding: 'utf8' }); }
function linkFor(email, pathPart) { const mail = readdirSync(sink).map(name => readFileSync(path.join(sink, name), 'utf8')).find(value => value.includes(`To: ${email}`) && value.includes(pathPart)); assert(mail, `mail for ${email} ${pathPart}`); return mail.match(/https?:\/\/\S+/)[0]; }
(async () => {
  mkdirSync(sink, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const email = `m9-browser-${Date.now()}@example.com`;
    await page.goto(base + '/sign-up');
    await page.locator('input[name=full_name]').fill('Milestone Nine');
    await page.locator('input[name=email]').fill(email);
    await page.locator('input[name=password]').fill('LongPassword123!');
    await page.locator('select[name=country]').selectOption({ label: 'Ghana' });
    await page.locator('#terms').check();
    await page.getByRole('button', {name: 'Create Account'}).click();
    await page.waitForURL('**/verify-email');
    deliver();
    await page.goto(linkFor(email, '/verify-email#token='));
    await page.waitForURL('**/verification-complete');
    await page.goto(base + '/sign-in');
    await page.locator('input[name=email]').fill(email);
    await page.locator('input[name=password]').fill('LongPassword123!');
    await page.getByRole('button', {name: 'Sign In', exact:true}).click();
    await page.waitForURL('**/dashboard');
    await page.goto(base + '/account/settings');
    await page.getByText(email).waitFor();
    assert(await page.getByText('Verified', {exact: true}).count());
    await page.goto(base + '/admin/login');
    await page.locator('input[name=email]').fill(email);
    await page.locator('input[name=password]').fill('LongPassword123!');
    await page.getByRole('button', {name: 'Sign In', exact:true}).click();
    await page.getByRole('alert').getByText('Invalid admin credentials').waitFor();
    await page.goto(base + '/forgot-password');
    await page.locator('input[name=email]').fill(email);
    await page.getByRole('button', {name: 'Send Reset Link'}).click();
    await page.getByRole('status').waitFor();
    deliver();
    await page.goto(linkFor(email, '/reset-password#token='));
    await page.locator('input[name=password]').fill('NewLongPassword123!');
    await page.locator('input[name=confirm]').fill('NewLongPassword123!');
    await page.getByRole('button', {name: 'Reset Password'}).click();
    await page.getByRole('status').getByText(/Password reset/).waitFor();
    await page.goto(base + '/dashboard');
    await page.waitForURL('**/sign-in');
    await page.locator('input[name=email]').fill(email);
    await page.locator('input[name=password]').fill('NewLongPassword123!');
    await page.getByRole('button', {name: 'Sign In', exact:true}).click();
    await page.waitForURL('**/dashboard');
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
      for (const route of ['/verify-email','/forgot-password','/reset-password','/verification-complete','/admin/login','/account/settings']) {
        await page.goto(base + route); await page.locator('h1').first().waitFor();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width, `${route} overflow ${width}`);
      }
    }
    console.log('Milestone 9 browser flow passed: verification, settings, admin rejection, reset, session revocation, login, desktop/mobile overflow.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
