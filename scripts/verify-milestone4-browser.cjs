const { chromium } = require('playwright-core');
const { execFileSync } = require('child_process');
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const root = path.join(__dirname, '..');
const out = '/tmp/tour-raffle-m4-browser';
fs.mkdirSync(out, { recursive: true });
const fixture = (name, args=[]) => execFileSync('.venv/bin/python', ['-m', `scripts.${name}`, ...args], {cwd:path.join(root,'backend'), env:{...process.env,APP_ENV:'test'}, encoding:'utf8'}).trim();
const origin = 'http://127.0.0.1:3000';
async function api(page, route, method='GET', body) { return page.evaluate(async ({route,method,body}) => {const r=await fetch('/api/v1'+route,{method,headers:{'Content-Type':'application/json'},body:body&&JSON.stringify(body)});return {status:r.status,data:await r.json()};},{route,method,body}); }
async function account(page, email) {
  await page.goto(origin+'/sign-in',{waitUntil:'domcontentloaded',timeout:60000});
  const registered = await api(page, '/auth/register', 'POST', {full_name:'Draw Browser',email,password:'LongPassword123!',country:'Ghana',accept_terms:true});
  assert.equal(registered.status,201,JSON.stringify(registered));
  const signedIn = await api(page, '/auth/login', 'POST', {email,password:'LongPassword123!'});
  assert.equal(signedIn.status,200,JSON.stringify(signedIn));
  await page.goto(origin+'/dashboard',{waitUntil:'domcontentloaded',timeout:60000});
}
(async () => {
 fixture('reset_browser_db');
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
 try {
  const admin=await browser.newPage(); const member=await browser.newPage(); const member2=await browser.newPage(); const suffix=Date.now();
  const adminEmail=`m4-admin-${suffix}@example.com`, memberEmail=`m4-member-${suffix}@example.com`, member2Email=`m4-member2-${suffix}@example.com`;
  await account(admin,adminEmail); await account(member,memberEmail); await account(member2,member2Email);
  fixture('seed_admin_browser',['--email',adminEmail]);
  assert.equal((await api(member,'/admin/draws')).status,403);
  assert.equal((await api(member,'/draws/mine')).data.length,0);
  const now=Date.now(); const campaign=(await api(admin,'/admin/campaigns','POST',{name:'Browser draw',destination:'Kenya',prize_value:'100',currency:'USD',coupon_price:'10',max_capacity:2,winner_count:2,start_date:new Date(now-86400000).toISOString(),end_date:new Date(now+86400000).toISOString(),is_featured:true}));
  assert.equal(campaign.status,201,JSON.stringify(campaign)); const id=campaign.data.id;
  assert.equal((await api(admin,`/admin/campaigns/${id}/status`,'POST',{status:'open'})).status,200);
  const code1=fixture('seed_campaign_coupon',['--owner-email',memberEmail,'--campaign-id',id,'--count','1']).trim();
  const code2=fixture('seed_campaign_coupon',['--owner-email',member2Email,'--campaign-id',id,'--count','1']).trim();
  assert.equal((await api(member,'/coupons/redeem','POST',{code:code1})).status,200);
  assert.equal((await api(member2,'/coupons/redeem','POST',{code:code2})).status,200);
  await admin.goto(origin+'/admin/draws',{waitUntil:'commit',timeout:60000}); await admin.getByText('Browser draw').waitFor(); await admin.getByRole('button',{name:'Prepare Snapshot'}).click(); await admin.getByText('Draw prepare completed.').waitFor();
  await admin.getByRole('button',{name:'Approve Snapshot'}).click(); await admin.getByText('Draw approve completed.').waitFor();
  await admin.getByRole('button',{name:'Execute Draw'}).click(); await admin.getByText('Draw execute completed.').waitFor();
  assert.equal((await api(member,'/draws/mine')).data.length,0);
  const before=(await api(admin,`/admin/draws/${id}`)).data;
  assert.equal(before.winners.length,2); assert.equal(new Set(before.winners.map(w=>w.user_id)).size,2);
  assert.deepEqual((await api(admin,`/admin/draws/${id}/execute`,'POST')).data.winners,before.winners);
  await admin.getByRole('button',{name:'Publish Results'}).click(); await admin.getByText('Draw publish completed.').waitFor();
  await member.goto(origin+'/dashboard/draws/results',{waitUntil:'commit',timeout:60000}); await member.getByText('Browser draw').waitFor();
  await member2.goto(origin+'/dashboard/draws/results',{waitUntil:'commit',timeout:60000}); await member2.getByText('Browser draw').waitFor();
  await member.goto(origin+'/dashboard/draws/audit',{waitUntil:'commit',timeout:60000}); await member.getByText('Browser draw').waitFor(); await member.getByText('Snapshot SHA-256:').waitFor();
  await member.goto(origin+'/winners',{waitUntil:'commit',timeout:60000}); await member.getByText('Browser draw').waitFor();
  for (const width of [1440,390]) { await admin.setViewportSize({width,height:width===1440?900:844}); await member.setViewportSize({width,height:width===1440?900:844}); await admin.goto(origin+'/admin/draws',{waitUntil:'commit',timeout:60000}); await admin.getByText('Browser draw').waitFor(); await member.goto(origin+'/dashboard/draws/results',{waitUntil:'commit',timeout:60000}); await member.getByText('Browser draw').waitFor(); await admin.screenshot({path:path.join(out,`admin-draws-${width}.png`),fullPage:true}); await member.screenshot({path:path.join(out,`member-results-${width}.png`),fullPage:true}); assert.equal(await admin.evaluate(()=>document.documentElement.scrollWidth),width); assert.equal(await member.evaluate(()=>document.documentElement.scrollWidth),width); }
  await admin.route('**/api/v1/admin/draws',route=>route.fulfill({status:503,contentType:'application/json',body:'{}'})); await admin.goto(origin+'/admin/draws',{waitUntil:'commit',timeout:60000}); await admin.locator('p[role="alert"]').waitFor();
  console.log('Browser draw flow passed; screenshots in '+out);
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
