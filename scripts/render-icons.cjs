// Development-only generator; requires Playwright and local npm start server.
const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const TARGET_URL=process.env.TARGET_URL||'http://127.0.0.1:4173/';
(async()=>{const browser=await chromium.launch({headless:false,channel:'msedge'});try{const page=await browser.newPage();for(const [size,source,target] of [[512,'icon.svg','icon-512.png'],[192,'icon.svg','icon-192.png'],[180,'apple-touch-icon.svg','apple-touch-icon.png']]){await page.setViewportSize({width:size,height:size});await page.goto(TARGET_URL+'assets/'+source);await page.locator('svg').screenshot({path:'assets/'+target,type:'png'});console.log(target,size);}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
