import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { parseCsv } from '../src/domain/csv';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=','base64');
async function chooseTrial(page:Page){await expect(page.locator('.onboarding-panel h1')).toHaveText(/A little less admin\.|Your persona is ready\./);const choice=page.getByRole('button',{name:'Finish free trial',exact:true});if(await choice.isVisible())await choice.click();}
async function enter(page:Page){
  await page.goto('/');await page.getByRole('button',{name:'Try with sample data',exact:true}).click();
  await page.getByRole('button',{name:'Skip for now',exact:true}).click();
  await chooseTrial(page);await page.getByRole('button',{name:'Use sample transactions',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Adobe Creative Cloud',exact:true})).toBeVisible();
}
async function open(page:Page,path:string){await page.goto(path);await expect(page.locator('.main-content h1')).toBeVisible();}
async function addExpense(page:Page,name:string,amount:string){
  await open(page,'/transactions');await page.getByRole('button',{name:'Add transaction',exact:true}).first().click();
  await page.getByLabel('Merchant or description',{exact:true}).fill(name);
  await page.getByLabel('Amount (USD)',{exact:true}).fill(amount);
  await page.getByLabel('Date',{exact:true}).fill('2026-10-08');
  await page.getByRole('button',{name:'Save transaction',exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

test('client journey · first swipe, dashboard correction, receipt, rule, export and reload',async({page},info)=>{
  await enter(page);
  await page.getByRole('button',{name:'Business For your work',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Whole Foods Market',exact:true})).toBeVisible();
  await open(page,'/overview');
  await expect(page.getByText('$1,536.18',{exact:true}).first()).toBeVisible();
  await open(page,'/transactions');await page.getByLabel('Search transactions').fill('Adobe');
  await page.getByRole('button',{name:/Adobe Creative Cloud Oct 6/}).click();
  await page.getByLabel('Classification',{exact:true}).selectOption('mixed');
  await page.getByLabel('Business percentage',{exact:true}).fill('60');
  await page.getByLabel('Upload receipt').setInputFiles({name:'client-demo-receipt.png',mimeType:'image/png',buffer:png});
  await expect(page.getByAltText('Receipt attached to Adobe Creative Cloud')).toBeVisible();
  await page.getByRole('button',{name:'Save transaction',exact:true}).click();
  await page.getByRole('button',{name:/Adobe Creative Cloud Oct 6/}).click();
  await page.getByRole('button',{name:'Create merchant rule',exact:true}).click();
  await expect(page.getByLabel('Rule business percentage')).toHaveValue('60');
  await expect(page.getByRole('region',{name:'Merchant rule preview'})).toContainText('2 expenses');
  await expect(page.getByText('$60.00 in business expenses',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Save rule',exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await open(page,'/reports');await expect(page.getByTestId('report-business-total')).toHaveText('$1,512.18');
  await expect(page.locator('.report-support-number').first()).toContainText('1 / 9');
  const csvEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Transaction CSV',exact:true}).click();
  const csv=parseCsv(await readFile((await (await csvEvent).path())!,'utf8'));
  expect(csv.slice(1).reduce((sum,row)=>sum+Math.round(Number(row[9])*100),0)).toBe(151218);
  const edited=csv.slice(1).find(row=>row[0]==='demo-adobe')!;
  expect(edited[8]).toBe('60');expect(edited[12]).toBe('Yes');
  await page.reload();await expect(page.getByTestId('report-business-total')).toHaveText('$1,512.18');
  await open(page,'/rules');await expect(page.getByRole('heading',{name:'Adobe Creative Cloud',exact:true})).toBeVisible();
  await page.screenshot({path:`test-results/rules-${info.project.name}.png`,fullPage:true});
  await addExpense(page,'Adobe Creative Cloud','100.00');
  await page.getByLabel('Search transactions').fill('Adobe');
  await page.getByRole('button',{name:/Adobe Creative Cloud Oct 8/}).click();
  await expect(page.getByLabel('Classification',{exact:true})).toHaveValue('mixed');
  await expect(page.getByLabel('Business percentage',{exact:true})).toHaveValue('60');
  await expect(page.getByText('$60.00',{exact:true})).toBeVisible();
  await expect(page.getByText('$40.00',{exact:true})).toBeVisible();
  await page.keyboard.press('Escape');await open(page,'/overview');
  await expect(page.getByText('$1,572.18',{exact:true}).first()).toBeVisible();
  await open(page,'/demo-guide');await expect(page.getByText('16 steps, including 14 question screens',{exact:false})).toBeVisible();
  await page.screenshot({path:`test-results/demo-guide-${info.project.name}.png`,fullPage:true});
});

test('rules · previews, editing, disable, ambiguous matches and CSV application',async({page})=>{
  await enter(page);await open(page,'/rules');
  await page.getByRole('button',{name:'Create rule',exact:true}).click();
  await page.getByRole('button',{name:'Save rule',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('three characters');
  await page.getByLabel('Merchant match',{exact:true}).fill('Adobe');
  await page.getByLabel('Match method',{exact:true}).selectOption('contains');
  await page.getByLabel('Rule category',{exact:true}).selectOption('software');
  await expect(page.getByRole('region',{name:'Merchant rule preview'})).toContainText('2 expenses');
  await page.getByLabel('Also apply to 1 matching unreviewed expenses now').check();
  await page.getByRole('button',{name:'Save rule',exact:true}).click();
  await page.getByRole('button',{name:'Preview / Edit',exact:true}).click();
  await page.getByLabel('Rule classification',{exact:true}).selectOption('mixed');
  await page.getByLabel('Rule business percentage',{exact:true}).fill('25');
  await page.getByRole('button',{name:'Save rule',exact:true}).click();
  await addExpense(page,'Adobe New License','100');
  await page.getByLabel('Search transactions').fill('Adobe New');await page.getByRole('button',{name:/Adobe New License Oct 8/}).click();
  await expect(page.getByLabel('Business percentage',{exact:true})).toHaveValue('25');await page.keyboard.press('Escape');
  await open(page,'/rules');await page.getByRole('button',{name:'Disable rule',exact:true}).click();
  await addExpense(page,'Adobe After Disable','50');
  await page.getByLabel('Search transactions').fill('Adobe After');await page.getByRole('button',{name:/Adobe After Disable Oct 8/}).click();
  await expect(page.getByLabel('Classification',{exact:true})).toHaveValue('unreviewed');await page.keyboard.press('Escape');
  await open(page,'/rules');await page.getByRole('button',{name:'Enable rule',exact:true}).click();
  await page.getByRole('button',{name:'Create rule',exact:true}).click();await page.getByLabel('Merchant match',{exact:true}).fill('Adobe Conflict');
  await page.getByRole('button',{name:'Save rule',exact:true}).click();
  await addExpense(page,'Adobe Conflict','10');await page.getByLabel('Search transactions').fill('Adobe Conflict');
  await page.getByRole('button',{name:/Adobe Conflict Oct 8/}).click();await expect(page.getByLabel('Classification',{exact:true})).toHaveValue('unreviewed');await page.keyboard.press('Escape');
  await open(page,'/accounts');await page.getByRole('button',{name:'Import CSV',exact:true}).first().click();
  await page.getByLabel('Select transaction CSV').setInputFiles({name:'recurring.csv',mimeType:'text/csv',buffer:Buffer.from('Date,Description,Amount,Type\n2026-10-09,Adobe CSV purchase,100.00,expense')});
  await page.getByRole('button',{name:'Preview 1 rows',exact:false}).click();
  await expect(page.getByText('1 selected expenses will use an enabled merchant rule.',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Import 1 selected rows',exact:false}).click();await page.getByRole('button',{name:'Back to accounts',exact:true}).click();
  await open(page,'/transactions');await page.getByLabel('Search transactions').fill('Adobe CSV');await page.getByRole('button',{name:/Adobe CSV purchase Oct 9/}).click();
  await expect(page.getByLabel('Business percentage',{exact:true})).toHaveValue('25');
});

test('profile · deferred drafts, contextual reports, consistent demo access and narrow guide',async({page},info)=>{
  await enter(page);await open(page,'/profile');
  await page.getByLabel('Business name',{exact:true}).fill('AiBit Demo Studio');
  await page.getByLabel('Business activity',{exact:true}).fill('Creative consulting');
  await page.getByRole('button',{name:'Save profile',exact:true}).click();
  await page.getByLabel('Reporting year',{exact:true}).fill('26');
  await page.getByRole('button',{name:'Save tax profile draft',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('four-digit');
  await page.getByLabel('Reporting year',{exact:true}).fill('2026');
  await page.getByLabel('Tax country or jurisdiction',{exact:true}).fill('User-provided US / Texas');
  await page.getByLabel('Tax preparation notes',{exact:true}).fill('Discuss mixed studio expenses with accountant.');
  await page.getByRole('button',{name:'Save tax profile draft',exact:true}).click();
  await expect(page.getByText('Draft saved',{exact:true})).toBeVisible();await page.reload();
  await expect(page.getByLabel('Reporting year',{exact:true})).toHaveValue('2026');
  await expect(page.getByLabel('Tax preparation notes',{exact:true})).toHaveValue('Discuss mixed studio expenses with accountant.');
  await expect(page.getByText('No expiry · No charges',{exact:true})).toBeVisible();
  await page.screenshot({path:`test-results/profile-${info.project.name}.png`,fullPage:true});
  await open(page,'/reports');await expect(page.getByLabel('From date',{exact:true})).toHaveValue('2026-01-01');
  await expect(page.getByText('Creative consulting',{exact:false})).toBeVisible();
  await expect(page.getByTestId('report-business-total')).toHaveText('$1,476.19');
  await open(page,'/review');await expect(page.getByRole('heading',{name:'Adobe Creative Cloud',exact:true})).toBeVisible();
  await page.setViewportSize({width:320,height:740});
  for(const route of ['/rules','/profile','/demo-guide']){await open(page,route);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});

test('persistence · legacy records migrate with the receipt store preserved',async({page})=>{
  await enter(page);await open(page,'/transactions');await page.getByLabel('Search transactions').fill('Adobe');
  await page.getByRole('button',{name:/Adobe Creative Cloud Oct 6/}).click();
  await page.getByLabel('Upload receipt').setInputFiles({name:'legacy-receipt.png',mimeType:'image/png',buffer:png});
  await expect(page.getByAltText('Receipt attached to Adobe Creative Cloud')).toBeVisible();await page.keyboard.press('Escape');
  await page.evaluate(()=>new Promise<void>((resolve,reject)=>{const req=indexedDB.open('earnist-local-demo',2);req.onsuccess=()=>{const db=req.result,tx=db.transaction('records','readwrite'),store=tx.objectStore('records'),read=store.get('main');read.onsuccess=()=>{const r=read.result;r.version=2;delete r.rules;delete r.profile.tax;delete r.profile.businessDescription;store.put(r,'main');};tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};req.onerror=()=>reject(req.error);}));
  await page.reload();await expect(page.locator('.recovery-banner')).toHaveCount(0);
  await page.getByLabel('Search transactions').fill('Adobe');await page.getByRole('button',{name:/Adobe Creative Cloud Oct 6/}).click();
  await expect(page.getByAltText('Receipt attached to Adobe Creative Cloud')).toBeVisible();await page.keyboard.press('Escape');
  await open(page,'/rules');await expect(page.getByRole('heading',{name:'Make repeat expenses easier.',exact:true})).toBeVisible();
  await open(page,'/profile');await expect(page.getByLabel('Reporting year',{exact:true})).toHaveValue('');
});
