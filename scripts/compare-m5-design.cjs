const { chromium } = require('playwright-core');
const { execFileSync } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname,'..');
const output='/tmp/tour-raffle-m5-design'; fs.mkdirSync(output,{recursive:true});
const email=execFileSync('.venv/bin/python',['-c',"from app.core.database import SessionLocal; from app.models.models import User; from sqlalchemy import select; db=SessionLocal(); print(db.scalar(select(User.email).where(User.email.like('m5-member-%')).order_by(User.created_at.desc()).limit(1)))"],{cwd:path.join(root,'backend'),env:{...process.env,APP_ENV:'test'},encoding:'utf8'}).trim();
async function styles(page) {return page.evaluate(()=>{
  const sample=(selector)=>{ const e=document.querySelector(selector); if(!e)return null;const s=getComputedStyle(e),r=e.getBoundingClientRect();return {font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,color:s.color,bg:s.backgroundColor,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};};
  return {width:document.documentElement.scrollWidth,h1:sample('h1'),sidebar:sample('aside'),main:sample('main'),card:sample('main .bg-white.border'),body:sample('body')};
});}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
 try{
  const context=await browser.newContext(); const current=await context.newPage(); const original=await context.newPage();
  await current.goto('http://127.0.0.1:3000/sign-in');
  const login=await current.evaluate(async({email})=>{const r=await fetch('/api/v1/auth/login',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'LongPassword123!'})});return r.status;},{email});
  assert.equal(login,200);
  const orders=await current.evaluate(async()=>{const r=await fetch('/api/v1/users/me/orders',{credentials:'include'});return r.json();});
  const issued=orders.find(order=>order.status==='issued'); assert(issued); const oid=issued.id;
  const routes=[['purchase','/dashboard/coupons/purchase','/dashboard/coupons/purchase'],['checkout',`/dashboard/checkout?order=${oid}`,'/dashboard/checkout'],['processing',`/dashboard/payment/processing?order=${oid}`,'/dashboard/payment/processing'],['coupons','/dashboard/coupons','/dashboard/coupons'],['payments','/dashboard/payments','/dashboard/payments']];
  const report=[];
  for(const width of [1440,390]){
   await current.setViewportSize({width,height:width===1440?900:844});await original.setViewportSize({width,height:width===1440?900:844});
   for(const [name,currentRoute,oldRoute] of routes){
    await current.goto('http://127.0.0.1:3000'+currentRoute,{waitUntil:'commit'});
    await original.goto('http://127.0.0.1:3001'+oldRoute,{waitUntil:'commit'});
    await current.locator('h1').first().waitFor({timeout:60000});await original.locator('h1').first().waitFor({timeout:60000});
    await Promise.all([current, original].map(page => page.waitForFunction(() => getComputedStyle(document.querySelector('h1')).fontFamily.includes('Inter'), null, {timeout:60000})));
    if(name==='processing') await current.getByText('Payment Successful!').waitFor({timeout:30000});
    const before=await styles(original),after=await styles(current);
    assert.equal(before.width,width,`${name} original overflow ${width}`);assert.equal(after.width,width,`${name} current overflow ${width}`);
    for(const field of ['font','size','weight','color']) assert.equal(after.h1[field],before.h1[field],`${name} ${width} heading ${field}`);
    for(const field of ['x','w']) assert(Math.abs(after.h1[field]-before.h1[field])<=2,`${name} ${width} heading ${field}`);
    for(const section of ['sidebar','main']) if(before[section]&&after[section]) {for(const field of ['x','w']) assert(Math.abs(after[section][field]-before[section][field])<=2,`${name} ${width} ${section} ${field}`);}
    await original.screenshot({path:path.join(output,`${name}-original-${width}.png`),fullPage:true});
    await current.screenshot({path:path.join(output,`${name}-current-${width}.png`),fullPage:true});
    report.push({name,width,before,after});
   }
  }
  fs.writeFileSync(path.join(output,'metrics.json'),JSON.stringify(report,null,2));
  console.log(`visual baseline comparison passed for ${routes.length} screens at 1440px and 390px; ${output}`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
