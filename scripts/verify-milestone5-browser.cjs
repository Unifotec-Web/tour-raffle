const { chromium } = require('playwright-core');
const { execFileSync } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.join(__dirname, '..');
const base = 'http://127.0.0.1:3000';
const output = '/tmp/tour-raffle-m5-browser';
fs.mkdirSync(output, {recursive:true});
function fixture(name, args=[]) { return execFileSync('.venv/bin/python', ['-m', `scripts.${name}`, ...args], {cwd:path.join(root,'backend'), env:{...process.env,APP_ENV:'test'}, encoding:'utf8'}).trim(); }
async function api(page, route, method='GET', body) { return page.evaluate(async ({route,method,body}) => { const response=await fetch('/api/v1'+route,{method,headers:{'Content-Type':'application/json'},body:body&&JSON.stringify(body),credentials:'include'}); return {status:response.status,data:await response.json()}; }, {route,method,body}); }
async function navigate(page, route) { await page.goto(base+route,{waitUntil:'commit',timeout:60000}); }
async function hydrated(page, selector) { await page.waitForFunction(value=>{const e=document.querySelector(value);return Boolean(e&&Object.keys(e).some(key=>key.startsWith('__reactFiber$')));},selector,{timeout:60000}); }
async function register(page,email) {
  await navigate(page,'/sign-up'); await hydrated(page,'form');
  await page.getByPlaceholder('Enter your full name').fill('Milestone Member');
  await page.locator('form input[name="email"]').fill(email);
  await page.getByPlaceholder('Create a strong password').fill('LongPassword123!');
  await page.locator('select').selectOption({label:'Ghana'}); await page.locator('#terms').check();
  await page.getByRole('button',{name:'Create Account'}).click();
  await page.waitForURL('**/sign-in?registered=1',{timeout:60000}); await hydrated(page,'form');
  await page.locator('form input[name="email"]').fill(email); await page.getByPlaceholder('Enter your password').fill('LongPassword123!');
  await page.getByRole('button',{name:'Sign In',exact:true}).click(); await page.waitForURL('**/dashboard',{timeout:60000});
}
async function fakeWebhook(page, order, kind, eventId) {
  const raw=JSON.stringify({id:eventId,type:kind,data:{reference:order.reference,transaction_id:'fake-txn-'+order.id,amount:Math.round(Number(order.total_amount)*100),currency:order.currency,order_id:order.id}});
  const signature=crypto.createHmac('sha256','local-browser-only').update(raw).digest('hex');
  return page.evaluate(async({raw,signature})=>{const response=await fetch('/api/v1/webhooks/fake',{method:'POST',headers:{'Content-Type':'application/json','x-fake-signature':signature},body:raw});return {status:response.status,data:await response.json()};},{raw,signature});
}
(async()=>{
  fixture('reset_browser_db');
  const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
  try {
    const member=await browser.newPage(); const admin=await browser.newPage(); const second=await browser.newPage();
    const stamp=Date.now();
    await register(member,`m5-member-${stamp}@example.com`);
    await register(admin,`m5-admin-${stamp}@example.com`);
    await register(second,`m5-second-${stamp}@example.com`);
    fixture('seed_admin_browser',['--email',`m5-admin-${stamp}@example.com`]);
    assert.equal((await api(member,'/admin/campaigns')).status,403);
    const now=Date.now();
    const created=await api(admin,'/admin/campaigns','POST',{name:'Milestone Five Test',destination:'Kenya',prize_value:'100',currency:'USD',coupon_price:'10',max_capacity:1,winner_count:1,start_date:new Date(now-86400000).toISOString(),end_date:new Date(now+86400000).toISOString(),is_featured:true});
    assert.equal(created.status,201,JSON.stringify(created)); const cid=created.data.id;
    assert.equal((await api(admin,`/admin/campaigns/${cid}/status`,'POST',{status:'open'})).status,200);
    await navigate(member,'/dashboard/coupons/purchase'); await hydrated(member,'button');
    await member.getByRole('button',{name:/^1 Coupon/}).click();
    await member.getByRole('button',{name:/Proceed to Checkout/}).click();
    await member.waitForURL('**/dashboard/checkout?order=*',{timeout:60000});
    await member.getByText('Local Test Payment').waitFor();
    assert(await member.getByText('$10.00 USD').count());
    await member.getByRole('button',{name:'Pay Now ($10.00)'}).click();
    await member.waitForURL('**/dashboard/payment/processing?order=*',{timeout:60000});
    const successfulOrderId=new URL(member.url()).searchParams.get('order');
    await member.getByText('Payment Successful!').waitFor({timeout:30000});
    await navigate(member,'/dashboard/coupons');
    await member.getByText('Unused',{exact:true}).waitFor();
    const coupons=(await api(member,'/users/me/coupons')).data; assert.equal(coupons.length,1); const code=coupons[0].code;
    assert.equal((await api(second,'/users/me/coupons')).data.length,0);
    assert.equal((await api(second,'/coupons/redeem','POST',{code})).status,404);
    await member.getByText(code).waitFor();
    await navigate(member,'/dashboard/payments'); await member.getByText('$10.00 USD').waitFor();
    await navigate(member,`/dashboard/entries/register?code=${encodeURIComponent(code)}`);
    await member.waitForFunction(v=>document.querySelector('input[placeholder="Enter your coupon code"]')?.value===v,code);
    await member.getByRole('button',{name:'Check Code'}).click(); await member.getByText('Entry Confirmed!').waitFor();
    assert.equal((await api(member,'/coupons/redeem','POST',{code})).data.created,false);
    const progress=await api(member,'/campaigns/featured/progress');
    assert.equal(progress.data.status,'closed'); assert.equal(progress.data.current_entries,1); assert.equal(progress.data.issued_count,1);
    assert.equal((await api(member,`/admin/draws/${cid}/prepare`,'POST')).status,403);
    assert.equal((await api(admin,`/admin/draws/${cid}/prepare`,'POST')).status,200);
    console.log('browser registration, checkout, verified fixture payment, coupon, history, redemption, closure, draw boundary passed');

    const stateCampaign=await api(admin,'/admin/campaigns','POST',{name:'Payment state checks',destination:'Kenya',prize_value:'100',currency:'USD',coupon_price:'10',max_capacity:2,winner_count:1,start_date:new Date(now-86400000).toISOString(),end_date:new Date(now+86400000).toISOString(),is_featured:false});
    assert.equal(stateCampaign.status,201);
    assert.equal((await api(admin,`/admin/campaigns/${stateCampaign.data.id}/status`,'POST',{status:'open'})).status,200);
    async function newFixtureOrder(campaignId) {const created=await api(member,'/orders','POST',{campaign_id:campaignId,quantity:1,provider:'fake',idempotency_key:crypto.randomUUID()});assert.equal(created.status,201,JSON.stringify(created));const checkout=await api(member,`/orders/${created.data.id}/checkout`,'POST');assert.equal(checkout.status,200,JSON.stringify(checkout));return checkout.data;}
    const pending=await newFixtureOrder(stateCampaign.data.id);
    await navigate(member,`/dashboard/payment/processing?order=${pending.id}`); await member.getByText('Processing your payment...').waitFor();
    assert.equal((await api(member,`/orders/${pending.id}/cancel`,'POST')).data.status,'cancelled');
    await member.getByText('Checkout not completed').waitFor({timeout:15000});
    const failed=await newFixtureOrder(stateCampaign.data.id);
    assert.equal((await fakeWebhook(member,failed,'payment.failed','failed-'+failed.id)).data.status,'failed');
    await navigate(member,`/dashboard/payment/processing?order=${failed.id}`); await member.getByText('Checkout not completed').waitFor();
    const reviewCampaign=await api(admin,'/admin/campaigns','POST',{name:'Late payment review',destination:'Kenya',prize_value:'100',currency:'USD',coupon_price:'10',max_capacity:1,winner_count:1,start_date:new Date(now-86400000).toISOString(),end_date:new Date(now+86400000).toISOString(),is_featured:false});
    assert.equal(reviewCampaign.status,201);
    assert.equal((await api(admin,`/admin/campaigns/${reviewCampaign.data.id}/status`,'POST',{status:'open'})).status,200);
    const late=await newFixtureOrder(reviewCampaign.data.id);
    fixture('expire_test_hold',['--order-id',late.id]);
    const competing=await api(member,'/orders','POST',{campaign_id:reviewCampaign.data.id,quantity:1,provider:'fake',idempotency_key:crypto.randomUUID()}); assert.equal(competing.status,201);
    assert.equal((await fakeWebhook(member,late,'payment.success','late-'+late.id)).data.status,'reconciliation_required');
    await navigate(member,`/dashboard/payment/processing?order=${late.id}`); await member.getByText('Payment needs review').waitFor();
    assert.equal((await api(member,'/admin/remedies')).status,403);
    assert((await api(admin,'/admin/remedies')).data.some(row=>row.reason==='paid_without_capacity'));
    console.log('browser pending, cancellation, failed payment, and paid-without-capacity review states passed');
    for(const width of [1440,390]) {
      await member.setViewportSize({width,height:width===1440?900:844});
      for(const [route,name] of [['/dashboard/coupons/purchase','purchase'],['/dashboard/coupons','coupons'],['/dashboard/payments','payments']]) {
        await navigate(member,route); await member.locator('h1').first().waitFor();
        await member.screenshot({path:path.join(output,`${name}-${width}.png`),fullPage:true});
        assert.equal(await member.evaluate(()=>document.documentElement.scrollWidth),width,`${name} overflows ${width}`);
      }
      await navigate(member,`/dashboard/payment/processing?order=${successfulOrderId}`);
      await member.getByText('Payment Successful!').waitFor();
      await member.screenshot({path:path.join(output,`processing-${width}.png`),fullPage:true});
      assert.equal(await member.evaluate(()=>document.documentElement.scrollWidth),width);
    }
    console.log('browser screenshots '+output);
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
