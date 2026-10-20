const { chromium } = require('playwright-core');
const assert = require('assert');
const fs = require('fs');
const output = '/tmp/tour-raffle-m9-design'; fs.mkdirSync(output, {recursive:true});
const routes = ['/sign-up','/verify-email','/forgot-password','/reset-password','/verification-complete','/admin/login','/account/settings'];
async function metrics(page) { return page.evaluate(() => {
  function take(selector) {const element = document.querySelector(selector); if (!element) return null; const style = getComputedStyle(element), rect=element.getBoundingClientRect(); return {font:style.fontFamily,size:style.fontSize,color:style.color,bg:style.backgroundColor,x:Math.round(rect.x),w:Math.round(rect.width)};}
  return {width:document.documentElement.scrollWidth,h1:take('h1'),main:take('main'),body:take('body')};
});}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
 try {const context=await browser.newContext(); const current=await context.newPage();const original=await context.newPage();const report=[];
  await current.goto('http://127.0.0.1:3000/sign-in');
  const email=`m9-design-${Date.now()}@example.com`;
  const session=await current.evaluate(async email=>{const payload={email,password:'LongPassword123!',full_name:'Design Check',country:'Ghana',accept_terms:true}; const create=await fetch('/api/v1/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); if(create.status!==201)return create.status;const login=await fetch('/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:payload.password})});return login.status;},email);assert.equal(session,200);
  for (const width of [1440,390]) { await current.setViewportSize({width,height:width===1440?900:844});await original.setViewportSize({width,height:width===1440?900:844});
   for (const route of routes) {
    await current.goto('http://127.0.0.1:3000'+route);await original.goto('http://127.0.0.1:3001'+route);
    await current.locator('h1').first().waitFor();await original.locator('h1').first().waitFor();
    const after=await metrics(current),before=await metrics(original);
    assert.equal(after.width,width,`current overflow ${route} ${width}`);assert.equal(before.width,width,`original overflow ${route} ${width}`);
    for (const field of ['font','size','color']) assert.equal(after.h1[field],before.h1[field],`${route} ${width} h1 ${field}`);
    for (const field of ['x','w']) assert(Math.abs(after.h1[field]-before.h1[field])<=2,`${route} ${width} h1 ${field}`);
    await current.screenshot({path:`${output}/${route.replaceAll('/','-')}-current-${width}.png`,fullPage:true});
    await original.screenshot({path:`${output}/${route.replaceAll('/','-')}-original-${width}.png`,fullPage:true});
    report.push({route,width,before,after});
   }
  }
  fs.writeFileSync(`${output}/metrics.json`,JSON.stringify(report,null,2));
  console.log(`Design comparison passed: ${routes.length} auth/admin/account screens × desktop/mobile, ${output}`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
