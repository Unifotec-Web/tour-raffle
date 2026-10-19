const { chromium } = require('playwright-core');
const { execFileSync } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const output = '/tmp/tour-raffle-m6-browser'; fs.mkdirSync(output, {recursive:true});
const fixture = JSON.parse(execFileSync('.venv/bin/python', ['-c', `import json
from sqlalchemy import select
from app.core.database import SessionLocal
from app.models.models import User
with SessionLocal() as db:
 print(json.dumps({role: db.scalar(select(User.email).where(User.email.like('m5-'+role+'-%')).order_by(User.created_at.desc()).limit(1)) for role in ('member','admin')}))`], {cwd:path.join(root,'backend'),env:{...process.env,APP_ENV:'test'},encoding:'utf8'}));
async function login(browser,email) {
  const page=await browser.newPage(); await page.goto('http://127.0.0.1:3000/sign-in');
  const status=await page.evaluate(async email=>{const r=await fetch('/api/v1/auth/login',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'LongPassword123!'})});return r.status;},email);
  assert.equal(status,200); return page;
}
async function api(page,route,method='GET',body) {return page.evaluate(async({route,method,body})=>{const r=await fetch('/api/v1'+route,{method,credentials:'include',headers:{'Content-Type':'application/json'},body:body&&JSON.stringify(body)});return {status:r.status,data:await r.json()};},{route,method,body});}
async function visit(page,route,heading) {await page.goto('http://127.0.0.1:3000'+route);await page.getByRole('heading',{name:heading,exact:true}).first().waitFor();}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
 try {
  const member=await login(browser,fixture.member), admin=await login(browser,fixture.admin);
  assert.equal((await api(member,'/admin/orders')).status,403);
  assert.equal((await api(member,'/admin/remedy-queue')).status,403);
  const own=(await api(member,'/users/me/orders')).data;
  const issued=own.find(o=>o.status==='issued'); const late=own.find(o=>o.status==='reconciliation_required');
  assert(issued&&late);
  await visit(member,`/dashboard/payments/${issued.id}`,'Payment Details');
  await member.getByText('Your coupons are in My Coupons.').waitFor();
  await visit(member,`/dashboard/payments/${late.id}`,'Payment Details');
  await member.getByText('Your payment needs review.').waitFor();
  const adminList=await api(admin,'/admin/orders?payment_status=paid&limit=1');
  assert.equal(adminList.status,200); assert(adminList.data.total>=2); assert.equal(adminList.data.items.length,1);
  await visit(admin,'/admin/payments','Payments');
  await admin.getByText(fixture.member).first().waitFor();
  await visit(admin,`/admin/payments/${late.id}`,'Payment Details');
  await admin.getByRole('button',{name:'Query provider & reconcile'}).click();
  await admin.getByText('Provider status: pending.').waitFor();
  const queue=(await api(admin,'/admin/remedy-queue?status=pending_review')).data;
  const remedy=queue.items.find(r=>r.order_id===late.id); assert(remedy);
  await visit(admin,`/admin/payments/remedies/${remedy.id}`,'Remedy Review');
  await admin.locator('textarea').fill('Escalate for manual payment remedy policy review.');
  await admin.getByRole('button',{name:'Record review'}).click();
  await admin.getByText('Review recorded.').waitFor();
  assert.equal((await api(admin,`/admin/remedy-queue/${remedy.id}`)).data.history.length,1);
  for(const width of [1440,390]) {
    for(const [page,routes] of [[member,[['/dashboard/payments','member-payments'],[`/dashboard/payments/${late.id}`,'member-detail']]],[admin,[['/admin/payments','admin-payments'],[`/admin/payments/${late.id}`,'admin-detail'],['/admin/payments/remedies','remedy-queue'],[`/admin/payments/remedies/${remedy.id}`,'remedy-detail']]]]) {
      await page.setViewportSize({width,height:width===1440?900:844});
      for(const [route,name] of routes){await page.goto('http://127.0.0.1:3000'+route);await page.locator('h1').first().waitFor();await page.screenshot({path:path.join(output,`${name}-${width}.png`),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width,`${name} overflow at ${width}`);}
    }
  }
  console.log('M6 browser member/admin status, permission, pagination, reconciliation, review, and 1440/390 layouts passed; '+output);
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
