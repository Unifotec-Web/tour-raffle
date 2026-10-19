const {chromium}=require('playwright-core');
const {execFileSync}=require('child_process');
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const output='/tmp/tour-raffle-m8-browser';fs.mkdirSync(output,{recursive:true});
const email=execFileSync('.venv/bin/python',['-c',"from app.core.database import SessionLocal; from app.models.models import User; from sqlalchemy import select; db=SessionLocal(); print(db.scalar(select(User.email).where(User.email.like('m5-member-%')).order_by(User.created_at.desc()).limit(1)))"],{cwd:path.join(__dirname,'..','backend'),env:{...process.env,APP_ENV:'test'},encoding:'utf8'}).trim();
const base='http://127.0.0.1:3000';
async function api(page,route,method='GET',body){return page.evaluate(async({route,method,body})=>{const response=await fetch('/api/v1'+route,{method,credentials:'include',headers:{'Content-Type':'application/json'},body:body&&JSON.stringify(body)});return {status:response.status,data:await response.json()};},{route,method,body});}
(async()=>{assert(email&&email!=='None');const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});try{
 const page=await browser.newPage();await page.goto(base+'/sign-in');assert.equal((await api(page,'/auth/login','POST',{email,password:'LongPassword123!'})).status,200);
 const rows=(await api(page,'/campaigns/public')).data;assert(rows.length>=2);assert(rows.every(row=>!('coupon_code'in row)&&!('user_id'in row)));
 const featured=rows.find(row=>row.is_featured);assert(featured);assert.equal((await api(page,`/campaigns/public/${featured.id}`)).status,200);
 const coupons=(await api(page,'/users/me/coupons')).data, entries=(await api(page,'/users/me/entries')).data;assert(coupons.length>=1&&entries.length>=1);
 const overview=(await api(page,'/users/me/overview')).data;assert.equal(overview.coupon_count,coupons.length);assert.equal(overview.confirmed_entry_count,entries.length);assert.equal(overview.paid_totals.USD,'20.00');
 await page.goto(base+'/current-raffle');await page.getByRole('heading',{name:featured.name}).first().waitFor();await page.getByRole('link',{name:'View Full Details'}).click();await page.waitForURL('**/raffles/'+featured.id);await page.getByText(featured.destination).first().waitFor();
 await page.goto(base+'/raffles/not-a-real-id');await page.getByText('This campaign is unavailable.').waitFor();
 await page.goto(base+'/check-entry');await page.getByPlaceholder('Enter your code').fill(coupons[0].code);await page.getByRole('button',{name:'Check Entry'}).click();await page.getByText('Coupon: registered').waitFor();await page.getByPlaceholder('Enter your code').fill('TRF-UNKNOWN-CODE');await page.getByRole('button',{name:'Check Entry'}).click();await page.getByText('No matching code on your account').waitFor();
 await page.goto(base+'/dashboard');await page.getByText('Welcome, Milestone Member').waitFor();await page.getByText('20.00 USD').first().waitFor();
 await page.goto(base+'/dashboard/draws/verify');await page.getByPlaceholder('Enter your entry code').fill(entries[0].entry_code);await page.getByRole('button',{name:'Verify Code'}).click();await page.getByText('No published win matches this code on your account.').waitFor();
 for(const width of [1440,390]){await page.setViewportSize({width,height:width===1440?900:844});for(const [route,name,wait] of [['/','home','Current Raffle'],['/current-raffle','current-raffle',featured.name],[`/raffles/${featured.id}`,'raffle-detail',featured.name],['/check-entry','check-entry','Enter Your Coupon or Entry Code'],['/dashboard','member-dashboard','Welcome, Milestone Member'],['/dashboard/draws/verify','win-verification','Winning Code Verification']]){await page.goto(base+route);await page.getByRole('heading',{name:wait}).first().waitFor();await page.screenshot({path:path.join(output,`${name}-${width}.png`),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width,`${name} overflow ${width}`)}}
 console.log('M8 public campaign, owner verification, dashboard, unknown ID, and 1440/390 layouts passed; '+output);
}finally{await browser.close()}})().catch(error=>{console.error(error);process.exit(1)});
