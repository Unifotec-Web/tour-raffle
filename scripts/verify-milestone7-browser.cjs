const {chromium}=require('playwright-core');
const {execFileSync}=require('child_process');
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const output='/tmp/tour-raffle-m7-browser';fs.mkdirSync(output,{recursive:true});
const emails=JSON.parse(execFileSync('.venv/bin/python',['-c',`import json
from sqlalchemy import select
from app.core.database import SessionLocal
from app.models.models import User
with SessionLocal() as db:
 print(json.dumps({role: db.scalar(select(User.email).where(User.email.like('integration-'+role+'-%')).order_by(User.created_at.desc()).limit(1)) for role in ('admin','member','second')}))`],{cwd:path.join(__dirname,'..','backend'),env:{...process.env,APP_ENV:'test'},encoding:'utf8'}));
async function login(browser,email){const page=await browser.newPage();await page.goto('http://127.0.0.1:3000/sign-in');const status=await page.evaluate(async email=>{const r=await fetch('/api/v1/auth/login',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'LongPassword123!'})});return r.status;},email);assert.equal(status,200);return page;}
async function api(page,route,method='GET',body){return page.evaluate(async({route,method,body})=>{const r=await fetch('/api/v1'+route,{method,credentials:'include',headers:{'Content-Type':'application/json'},body:body&&JSON.stringify(body)});return {status:r.status,data:await r.json()};},{route,method,body});}
async function visit(page,route,heading){await page.goto('http://127.0.0.1:3000'+route);await page.getByRole('heading',{name:heading,exact:true}).first().waitFor();}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});try{
 const admin=await login(browser,emails.admin),member=await login(browser,emails.member),second=await login(browser,emails.second);
 assert.equal((await api(member,'/admin/claims')).status,403);
 const wins=(await api(member,'/claims/mine')).data;assert.equal(wins.length,1);const win=wins[0];
 assert.equal((await api(second,'/claims/mine')).data.length,1);assert.equal((await api(second,`/wins/${win.winner_id}/claims`,'POST',{})).status,404);
 await visit(member,'/dashboard/draws/my-wins','My Wins');await member.getByText('Integration draw').waitFor();await member.getByRole('link',{name:'Start claim'}).click();await member.getByRole('heading',{name:'Prize Claim Instructions'}).waitFor();await member.getByRole('link',{name:'Start Claim Process'}).click();await member.getByRole('heading',{name:'Prize Claim Submission'}).waitFor();await member.getByLabel(/Phone Number/).waitFor();for(const width of [1440,390]){await member.setViewportSize({width,height:width===1440?900:844});await member.screenshot({path:path.join(output,`claim-form-before-submit-${width}.png`),fullPage:true});assert.equal(await member.evaluate(()=>document.documentElement.scrollWidth),width)}await member.getByLabel(/Phone Number/).fill('+254700000002');await member.getByRole('button',{name:'Submit Claim'}).click();await member.getByRole('heading',{name:'Prize Claim Status'}).waitFor();await member.getByText('submitted',{exact:true}).first().waitFor();const claimId=new URL(member.url()).searchParams.get('claim');assert(claimId);
 assert.equal((await api(second,`/claims/${claimId}`)).status,404);assert.equal((await api(member,`/wins/${win.winner_id}/claims`,'POST',{})).data.id,claimId);
 await visit(admin,'/admin/claims','Winner Claims');await admin.getByText(emails.member).waitFor();await visit(admin,`/admin/claims/${claimId}`,'Claim Details');
 async function review(target,reason,reference,evidence){await admin.getByLabel('Next status').selectOption(target);await admin.getByLabel('Reason').fill(reason);if(target==='fulfilled'){await admin.getByLabel('Fulfillment reference').fill(reference);await admin.getByLabel('Fulfillment evidence').fill(evidence)}await admin.getByRole('button',{name:'Record review'}).click();await admin.getByText('Review recorded.').waitFor();}
 await review('under_review','Contact details checked for review');await review('needs_information','Please confirm your contact phone number');
 await visit(member,`/dashboard/draws/claim-status?claim=${claimId}`,'Prize Claim Status');await member.getByText('Please confirm your contact phone number').waitFor();await member.getByLabel('Your response').fill('The phone number on my claim is correct.');await member.getByRole('button',{name:'Send information'}).click();await member.getByText('The phone number on my claim is correct.').waitFor();
 await visit(admin,`/admin/claims/${claimId}`,'Claim Details');await review('under_review','Member response received and checked');await review('approved','Claim approved for fulfillment review');
 assert.equal((await api(member,`/claims/${claimId}`)).data.status,'approved');assert.equal((await api(admin,`/admin/claims/${claimId}`)).data.fulfillment_reference,null);
 await review('fulfillment_pending','Fulfillment arrangement is pending');await review('fulfilled','Evidence and reference recorded','fixture-voucher-1','Local test delivery record');
 const finished=(await api(admin,`/admin/claims/${claimId}`)).data;assert.equal(finished.status,'fulfilled');assert.equal(finished.history.length,8);
 assert(!JSON.stringify((await api(member,'/draws/published')).data).includes(emails.member));
 for(const width of [1440,390]){for(const [page,routes] of [[member,[['/dashboard/draws/my-wins','my-wins'],[`/dashboard/draws/prize-claim?winner=${win.winner_id}`,'instructions'],[`/dashboard/draws/claim-form?winner=${win.winner_id}`,'claim-form'],[`/dashboard/draws/claim-status?claim=${claimId}`,'claim-status']]],[admin,[['/admin/claims','admin-claims'],[`/admin/claims/${claimId}`,'admin-claim-detail']]]]){await page.setViewportSize({width,height:width===1440?900:844});for(const [route,name] of routes){await page.goto('http://127.0.0.1:3000'+route);await page.locator('h1').first().waitFor();await page.screenshot({path:path.join(output,`${name}-${width}.png`),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width,`${name} overflow ${width}`)}}}
 console.log('M7 browser winner ownership, submission/retry, member response, admin review/fulfillment, public privacy, and 1440/390 layouts passed; '+output);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
