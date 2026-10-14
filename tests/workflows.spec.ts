import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { parseCsv } from '../src/domain/csv';
import { TEST_CARD_ID, TEST_CARD_NAME } from '../src/domain/sample';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=','base64');
async function chooseTrial(page:Page){await expect(page.locator('.onboarding-panel h1')).toHaveText(/A little less admin\.|Your persona is ready\./);const choice=page.getByRole('button',{name:'Finish free trial',exact:true});if(await choice.isVisible())await choice.click();}
async function enter(page:Page,choose=false){await page.goto('/');await page.getByRole('button',{name:'Try with sample data',exact:true}).click();if(choose){await page.getByRole('button',{name:'Creator',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();}else await page.getByRole('button',{name:'Skip for now',exact:true}).click();await chooseTrial(page);await page.getByRole('button',{name:'Use sample transactions',exact:true}).click();await expect(page.getByRole('heading',{name:'Adobe Creative Cloud',exact:true})).toBeVisible();}
async function open(page:Page,path:string){await page.goto(path);await expect(page.locator('.main-content h1')).toBeVisible();}

test('test card · onboarding, connection retry, shared charges, persistence and reports',async({page},info)=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Try with sample data',exact:true}).click();
  await page.getByRole('button',{name:'Skip for now',exact:true}).click();
  await chooseTrial(page);await page.getByRole('button',{name:'Connect test card Simulation',exact:true}).click();
  const modal=page.getByRole('dialog');
  await expect(modal).toContainText('No card number, CVC');
  await page.getByLabel('Simulate a connection error',{exact:true}).check();
  await page.getByRole('button',{name:'Connect test card · Simulated',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('simulated connection failed');
  await page.getByRole('button',{name:'Retry simulation',exact:true}).dblclick();
  await expect(page.getByText('Test card ready. Six fictional charges added.',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Review test card expenses',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Figma · Card subscription',exact:true})).toBeVisible();
  await expect(page.getByText('4 remaining',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Business For your work',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Staples · Studio supplies',exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading',{name:'Staples · Studio supplies',exact:true})).toBeVisible();
  await open(page,'/accounts');
  await expect(page.getByRole('heading',{name:TEST_CARD_NAME,exact:true})).toHaveCount(1);
  await expect(page.getByRole('button',{name:'Connect test card',exact:true})).toHaveCount(0);
  await expect(page.getByText('6 recorded transactions',{exact:false})).toContainText('3 expenses to review');
  await page.screenshot({path:`test-results/test-card-${info.project.name}.png`,fullPage:true});
  await page.getByRole('link',{name:'View transactions',exact:false}).click();
  await expect(page.getByRole('button',{name:TEST_CARD_NAME,exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('button',{name:/Figma · Card subscription/})).toBeVisible();
  await open(page,'/reports');
  await page.getByLabel('Account',{exact:true}).selectOption(TEST_CARD_ID);
  await expect(page.getByTestId('report-business-total')).toHaveText('$63.00');
  await expect(page.getByText('$0.00',{exact:true}).first()).toBeVisible();
  await open(page,'/accounts');
  await page.getByRole('button',{name:'Try simulated connection',exact:true}).click();
  await page.getByRole('button',{name:'Load sample accounts',exact:true}).click();
  await expect(page.getByText('Sample accounts ready.',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  await expect(page.getByRole('heading',{name:TEST_CARD_NAME,exact:true})).toHaveCount(1);
  await expect(page.locator('.account-panel')).toHaveCount(3);
  await open(page,'/profile');
  await page.getByRole('button',{name:'Restart onboarding',exact:true}).click();
  await page.getByRole('button',{name:'Try with sample data',exact:true}).click();
  await page.getByRole('button',{name:'Skip for now',exact:true}).click();
  await chooseTrial(page);await page.getByRole('button',{name:'Connect test card Simulation',exact:true}).click();
  await expect(page.getByRole('button',{name:'Review test card expenses',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Review test card expenses',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Find your flow.',exact:true})).toBeVisible();
});

test('test card · remains available after sample bank onboarding',async({page})=>{
  await enter(page);await open(page,'/accounts');
  await page.getByRole('button',{name:'Connect test card',exact:true}).click();
  await page.getByRole('button',{name:'Connect test card · Simulated',exact:true}).dblclick();
  await expect(page.getByText('Test card ready. Six fictional charges added.',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  await page.reload();
  await expect(page.getByRole('heading',{name:TEST_CARD_NAME,exact:true})).toHaveCount(1);
  await expect(page.locator('.account-panel')).toHaveCount(3);
  await expect(page.getByText('6 recorded transactions',{exact:false})).toContainText('4 expenses to review');
  await page.setViewportSize({width:320,height:740});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('link',{name:'View transactions',exact:false}).last().click();
  await open(page,'/review?account='+TEST_CARD_ID);
  await expect(page.getByRole('heading',{name:'Figma · Card subscription',exact:true})).toBeVisible();
  await expect(page.getByText('4 remaining',{exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Review all accounts',exact:true}).click();
  await expect(page.getByText('8 remaining',{exact:true})).toBeVisible();
});
test('A · quick entry, personalization back, classification, overview and touch controls',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.screenshot({path:`test-results/entry-${info.project.name}.png`,fullPage:true});
  await page.getByRole('button',{name:'Try with sample data',exact:true}).click();await page.getByRole('button',{name:'Musician',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByRole('button',{name:'Back',exact:true}).click();await expect(page.getByRole('button',{name:'Musician',exact:true})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Continue',exact:true}).click();await chooseTrial(page);await page.getByRole('button',{name:'Use sample transactions',exact:true}).click();await expect(page.getByRole('heading',{name:'Adobe Creative Cloud',exact:true})).toBeVisible();
  await page.getByLabel('Suggested category',{exact:false}).selectOption('equipment');await page.getByRole('button',{name:'Business For your work'}).dblclick();await expect(page.getByRole('heading',{name:'Whole Foods Market',exact:true})).toBeVisible();await expect(page.getByRole('progressbar')).toHaveAttribute('value','1');
  await expect(page.getByRole('button',{name:/Undo/})).toHaveCount(0);
  await page.getByLabel('Suggested category',{exact:false}).focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('progressbar')).toHaveAttribute('value','1');await page.getByRole('heading',{name:'Find your flow.',exact:true}).focus();await page.keyboard.press('z');await expect(page.getByRole('heading',{name:'Whole Foods Market',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'View overview',exact:false}).click();await expect(page.getByText('$1,536.18',{exact:true}).first()).toBeVisible();await expect(page.getByText('3 expenses still need a decision.',{exact:true})).toBeVisible();await page.screenshot({path:`test-results/overview-${info.project.name}.png`,fullPage:true});
  await open(page,'/review');await expect(page.getByRole('heading',{name:'Whole Foods Market',exact:true})).toBeVisible();
  // Native touch capture starting on the child merchant heading must transfer safely.
  await page.setViewportSize({width:393,height:851});const client=await page.context().newCDPSession(page);await client.send('Emulation.setTouchEmulationEnabled',{enabled:true});const card=page.getByRole('article');const box=(await card.boundingBox())!,x=box.x+box.width/2,y=box.y+130;await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=6;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+i*19,y}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(page.getByRole('heading',{name:'Apple · Keyboard',exact:true})).toBeVisible();
  await expect.poll(()=>page.getByRole('progressbar').getAttribute('value')).toBe('1');expect(errors).toEqual([]);
});

test('B + F · correction, split, receipt, reports and reload persistence',async({page},info)=>{
  await enter(page);await open(page,'/transactions');await page.getByLabel('Search transactions').fill('Adobe');await page.getByRole('button',{name:/Adobe Creative Cloud Oct 6/}).click();await page.getByLabel('Category',{exact:true}).selectOption('equipment');await page.getByLabel('Classification',{exact:true}).selectOption('mixed');await page.getByLabel('Business percentage',{exact:true}).fill('40');await expect(page.getByText('$24.00',{exact:true})).toBeVisible();
  await page.getByLabel('Upload receipt').setInputFiles({name:'work-receipt.png',mimeType:'image/png',buffer:png});await expect(page.getByAltText('Receipt attached to Adobe Creative Cloud')).toBeVisible();await page.getByLabel('Notes',{exact:true}).fill('Keyboard for studio, shared use');await page.getByRole('button',{name:'Save transaction',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
  await open(page,'/reports');await expect(page.getByTestId('report-business-total')).toHaveText('$1,500.19');await expect(page.locator('.report-support-number').first()).toContainText('1 / 9');await page.screenshot({path:`test-results/report-${info.project.name}.png`,fullPage:true});
  await page.reload();await expect(page.getByTestId('report-business-total')).toHaveText('$1,500.19');await open(page,'/transactions');await page.getByLabel('Search transactions').fill('Adobe');await page.getByRole('button',{name:/Adobe Creative Cloud Oct 6/}).click();await expect(page.getByLabel('Business percentage',{exact:true})).toHaveValue('40');await expect(page.getByLabel('Notes',{exact:true})).toHaveValue('Keyboard for studio, shared use');await expect(page.getByAltText('Receipt attached to Adobe Creative Cloud')).toBeVisible();
  await page.getByRole('button',{name:'Remove',exact:true}).click();await expect(page.getByRole('button',{name:'Upload image or PDF',exact:true})).toBeVisible();await page.getByLabel('Upload receipt').setInputFiles({name:'invalid.pdf',mimeType:'application/pdf',buffer:Buffer.from('not a PDF')});await expect(page.getByRole('alert')).toContainText('valid JPG');await page.getByRole('button',{name:'Close dialog',exact:true}).click();await open(page,'/reports');await expect(page.locator('.report-support-number').first()).toContainText('0 / 9');
});

test('C · CSV mapping, invalid-row correction, duplicate review, import and shared queue',async({page})=>{
  await enter(page);await open(page,'/accounts');await page.getByRole('button',{name:'Import CSV',exact:true}).first().click();await page.getByLabel('Select transaction CSV').setInputFiles({name:'new-records.csv',mimeType:'text/csv',buffer:Buffer.from('SourceDate,Merchant,Value,Kind\n2026-10-06,Adobe Creative Cloud,59.99,expense\n2026-10-07,Paperwork Supplies,12.90,expense\n2026-10-07,New client payment,200.00,income\n2026-02-30,Corrected purchase,oops,expense')});await page.getByLabel('Map type column').selectOption({label:'Kind'});await page.getByRole('button',{name:'Preview 4 rows',exact:false}).click();await expect(page.getByText('1 invalid',{exact:true})).toBeVisible();await expect(page.getByLabel('Import row 2',{exact:true})).not.toBeChecked();await expect(page.getByLabel('Import row 5',{exact:true})).toBeDisabled();await page.getByRole('button',{name:'Edit row',exact:true}).nth(3).click();await page.getByLabel('Row 5 date',{exact:true}).fill('2026-10-07');await page.getByLabel('Row 5 amount',{exact:true}).fill('7.45');await page.getByLabel('Import row 5',{exact:true}).check();await page.getByRole('button',{name:'Import 3 selected rows',exact:false}).click();await expect(page.getByRole('heading',{name:'3 records, ready to use.',exact:true})).toBeVisible();await page.getByRole('button',{name:'Back to accounts',exact:true}).click();await open(page,'/review');await expect(page.getByRole('heading',{name:'Paperwork Supplies',exact:true})).toBeVisible();await expect(page.getByText('6 remaining',{exact:true})).toBeVisible();await open(page,'/overview');await expect(page.getByText('$13,050.00',{exact:true})).toBeVisible();
});

test('D · manual trip, edit, period filters, unit preference and mileage export',async({page})=>{
  await enter(page);await open(page,'/mileage');await page.getByRole('button',{name:'Add trip',exact:true}).click();await page.getByLabel('Trip date',{exact:true}).fill('2026-10-07');await page.getByLabel('Start',{exact:true}).fill('Studio');await page.getByLabel('Destination',{exact:true}).fill('Client office');await page.getByLabel('Business purpose or trip context').fill('Project workshop');await page.getByLabel('Distance',{exact:true}).fill('20');await page.getByLabel('Distance unit',{exact:true}).selectOption('km');await page.getByRole('button',{name:'Save trip',exact:true}).click();await page.getByRole('button',{name:'Edit trip to Client office',exact:true}).click();await page.getByLabel('Distance',{exact:true}).fill('32');await page.getByRole('button',{name:'Save trip',exact:true}).click();await page.getByLabel('From date',{exact:true}).fill('2026-10-07');await page.getByLabel('To date',{exact:true}).fill('2026-10-07');await expect(page.locator('.mileage-summary strong')).toContainText('19.9');const exported=page.waitForEvent('download');await page.getByRole('button',{name:'Export trips',exact:true}).click();const file=await exported,csv=parseCsv(await readFile((await file.path())!,'utf8'));expect(csv).toHaveLength(2);expect(csv[1][6]).toBe('mi');expect(csv[1][7]).toBe('32');expect(csv[1][8]).toBe('km');
  await open(page,'/profile');await page.getByLabel('Mileage display unit').selectOption('km');await page.getByRole('button',{name:'Save profile',exact:true}).click();await page.reload();await expect(page.getByLabel('Mileage display unit')).toHaveValue('km');await open(page,'/mileage');await page.getByLabel('From date',{exact:true}).fill('2026-10-07');await page.getByLabel('To date',{exact:true}).fill('2026-10-07');await expect(page.locator('.mileage-summary strong')).toContainText('32.0');
});

test('E · reporting filters, CSV totals and printable preview',async({page})=>{
  await enter(page);await open(page,'/reports');await page.getByLabel('From date',{exact:true}).fill('2026-09-01');await page.getByLabel('To date',{exact:true}).fill('2026-09-30');await page.getByLabel('Account',{exact:true}).selectOption('sample-checking');await expect(page.getByTestId('report-business-total')).toHaveText('$69.00');await expect(page.getByText('$3,200.00',{exact:true}).first()).toBeVisible();const event=page.waitForEvent('download');await page.getByRole('button',{name:'Transaction CSV',exact:true}).click();const file=await event,rows=parseCsv(await readFile((await file.path())!,'utf8'));expect(rows).toHaveLength(6);expect(rows.slice(1).reduce((s,row)=>s+Number(row[9]),0)).toBe(69);expect(rows.slice(1).every(row=>row[1].startsWith('2026-09'))).toBe(true);
  await page.evaluate(()=>{window.print=()=>{document.body.dataset.printRequested='yes';};});await page.getByRole('button',{name:'Print / Save PDF',exact:true}).click();await expect(page.locator('body')).toHaveAttribute('data-print-requested','yes');await page.emulateMedia({media:'print'});await expect(page.locator('.app-sidebar')).toBeHidden();await expect(page.getByRole('article',{name:'Income and expense summary report preview'})).toBeVisible();
});

test('empty start, manual account, form errors, skip/resume, bulk actions and full reset',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Try with sample data',exact:true}).click();await page.getByRole('button',{name:'Skip for now',exact:true}).click();await chooseTrial(page);await page.getByRole('button',{name:'Start with empty local records',exact:true}).click();await expect(page.getByRole('heading',{name:'Start with one record.',exact:true})).toBeVisible();await open(page,'/accounts');await page.getByRole('button',{name:'Add manual account',exact:true}).click();await page.getByRole('button',{name:'Save account',exact:true}).click();await expect(page.getByRole('alert')).toContainText('name');await page.getByLabel('Account name').fill('Client demo checking');await page.getByRole('button',{name:'Save account',exact:true}).click();await page.getByRole('button',{name:'Rename Client demo checking'}).click();await page.getByLabel('Account name').fill('Local business');await page.getByRole('button',{name:'Save account',exact:true}).click();await open(page,'/transactions');await page.getByRole('button',{name:'Add transaction',exact:true}).first().click();await page.getByRole('button',{name:'Save transaction',exact:true}).click();await expect(page.getByRole('alert')).toContainText('description');await page.getByLabel('Merchant or description').fill('Local stationery');await page.getByLabel('Amount (USD)').fill('25.50');await page.getByRole('button',{name:'Save transaction',exact:true}).click();await open(page,'/review');await page.getByRole('button',{name:'Skip for later',exact:true}).click();await expect(page.getByRole('heading',{name:'Saved for later.',exact:true})).toBeVisible();await page.getByRole('button',{name:'Resume skipped expenses',exact:true}).click();await page.getByRole('button',{name:'Split expense',exact:true}).click();await page.getByLabel('Business percentage',{exact:true}).fill('50');await expect(page.getByText('$12.75',{exact:true}).first()).toBeVisible();await page.getByRole('button',{name:'Confirm split',exact:true}).click();await expect(page.getByRole('heading',{name:'All caught up.',exact:true})).toBeVisible();
  await open(page,'/transactions');await page.getByLabel('Select Local stationery',{exact:true}).check();await page.getByLabel('Bulk classification').selectOption('business');await page.getByRole('button',{name:'Apply to expenses',exact:true}).click();await open(page,'/overview');await expect(page.getByText('$25.50',{exact:true}).first()).toBeVisible();await open(page,'/profile');await page.getByLabel('Business name',{exact:true}).fill('AiBit Demo Studio');await page.getByRole('button',{name:'Save profile',exact:true}).click();await page.getByRole('button',{name:'Restart onboarding',exact:true}).click();await page.getByRole('button',{name:'Try with sample data',exact:true}).click();await page.getByRole('button',{name:'Skip for now',exact:true}).click();await chooseTrial(page);await page.getByRole('button',{name:'Start with empty local records',exact:true}).click();await expect(page.getByRole('button',{name:/Local stationery/})).toBeVisible();await open(page,'/profile');await page.getByRole('button',{name:'Clear local data',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('cannot be undone');await page.getByRole('button',{name:'Clear all data',exact:true}).click();await expect(page.getByRole('button',{name:'Try with sample data',exact:true})).toBeVisible();await page.reload();await page.getByRole('button',{name:'Try with sample data',exact:true}).click();await page.getByRole('button',{name:'Skip for now',exact:true}).click();await chooseTrial(page);await page.getByRole('button',{name:'Start with empty local records',exact:true}).click();await expect(page.getByRole('heading',{name:'Start with one record.',exact:true})).toBeVisible();
});

test('simulation failure retries, no-results filters, all routes and narrow reduced-motion layout',async({page},info)=>{
  await page.goto('/');await page.getByRole('button',{name:'Try with sample data',exact:true}).click();await page.getByRole('button',{name:'Skip for now',exact:true}).click();await chooseTrial(page);await page.getByText('Demo controls',{exact:true}).click();await page.getByLabel('Simulate connection error on the next attempt').check();await chooseTrial(page);await page.getByRole('button',{name:'Use sample transactions',exact:true}).click();await expect(page.getByRole('alert')).toContainText('simulated connection failed');await page.getByRole('button',{name:'Retry sample connection',exact:true}).click();await expect(page.getByRole('heading',{name:'Find your flow.',exact:true})).toBeVisible();
  await page.setViewportSize({width:320,height:740});await page.emulateMedia({reducedMotion:'reduce'});for(const route of ['/overview','/review','/transactions','/accounts','/mileage','/reports','/profile']){await open(page,route);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}await open(page,'/transactions');await page.getByLabel('Search transactions').fill('No merchant with this name');await expect(page.getByRole('heading',{name:'Nothing matches yet.',exact:true})).toBeVisible();await page.getByRole('button',{name:'Clear filters',exact:true}).click();await page.screenshot({path:`test-results/narrow-records-${info.project.name}.png`,fullPage:true});
});

test('receipts replace safely, PDF download, JSON export, dialog keyboard and confirmed deletion',async({page})=>{
  await enter(page);await open(page,'/transactions');await page.getByLabel('Search transactions').fill('Adobe');await page.getByRole('button',{name:/Adobe Creative Cloud Oct 6/}).click();await page.getByLabel('Upload receipt').setInputFiles({name:'original.png',mimeType:'image/png',buffer:png});await expect(page.getByText('original.png',{exact:true})).toBeVisible();await page.getByLabel('Upload receipt').setInputFiles({name:'replacement.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF')});await expect(page.getByRole('button',{name:'Download PDF',exact:true})).toBeVisible();const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download PDF',exact:true}).click();expect((await event).suggestedFilename()).toBe('replacement.pdf');await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  await open(page,'/profile');const jsonEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Export records',exact:true}).click();const json=await jsonEvent,archive=JSON.parse(await readFile((await json.path())!,'utf8'));expect(archive.receipts).toHaveLength(1);expect(archive.receipts[0].name).toBe('replacement.pdf');expect(archive.receipts[0].dataUrl).toContain('application/pdf');
  await open(page,'/transactions');await page.getByLabel('Search transactions').fill('Adobe');await page.getByRole('button',{name:/Adobe Creative Cloud Oct 6/}).click();await page.getByRole('button',{name:'Delete transaction',exact:true}).click();await expect(page.getByRole('dialog').last()).toContainText('move to trash');await page.getByRole('button',{name:'Delete',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await page.reload();await page.getByLabel('Search transactions').fill('Adobe');await expect(page.getByRole('button',{name:/Adobe Creative Cloud Oct 6/})).toHaveCount(0);
  const fileCount=await page.evaluate(()=>new Promise<number>((resolve,reject)=>{const open=indexedDB.open('earnist-local-demo',2);open.onsuccess=()=>{const db=open.result,tx=db.transaction('receipts','readonly'),req=tx.objectStore('receipts').count();req.onsuccess=()=>resolve(req.result);req.onerror=reject;tx.oncomplete=()=>db.close();};open.onerror=reject;}));expect(fileCount).toBe(1);await open(page,'/more');await page.getByRole('button',{name:'Delete permanently',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('cannot be undone');await page.getByRole('button',{name:'Delete',exact:true}).click();await expect(page.getByRole('heading',{name:'Nothing in trash.',exact:true})).toBeVisible();
});

test('home add card opens test-card flow and updates action',async({page},info)=>{
  await enter(page);
  await open(page,'/overview');
  const addCard=page.getByRole('button',{name:'Add card',exact:true});
  await expect(addCard).toBeVisible();
  await addCard.click();
  const dialog=page.getByRole('dialog',{name:'Connect a test card'});
  await expect(dialog).toContainText('No card number, CVC');
  await dialog.getByRole('button',{name:'Connect test card · Simulated'}).click();
  await expect(dialog.getByText('Test card ready. Six fictional charges added.')).toBeVisible();
  await dialog.getByRole('button',{name:'Close dialog'}).click();
  await expect(addCard).toHaveCount(0);
  await page.getByRole('link',{name:'View test card'}).click();
  await expect(page.getByRole('button',{name:TEST_CARD_NAME,exact:true})).toHaveAttribute('aria-pressed','true');
  await open(page,'/overview');
  await page.setViewportSize({width:320,height:740});
  await expect(page.getByRole('link',{name:'View test card'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/home-card-${info.project.name}.png`,fullPage:true});
});

test('transaction account and period chips filter records',async({page},info)=>{
  await enter(page);
  await open(page,'/transactions?account=sample-checking');
  await expect(page.getByRole('button',{name:'Sample checking · 4242',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'All accounts',exact:true}).click();
  await expect(page.getByRole('button',{name:'All accounts',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Date range',exact:true}).click();
  await page.getByLabel('From date',{exact:true}).fill('2026-01-01');
  await page.getByLabel('To date',{exact:true}).fill('2026-01-01');
  await expect(page.getByRole('button',{name:'Date range',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByText('Nothing matches yet.')).toBeVisible();
  await page.getByRole('button',{name:'All history',exact:true}).click();
  await expect(page.getByRole('button',{name:'All history',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByLabel('From date',{exact:true})).toHaveCount(0);
  await expect(page.getByText('Nothing matches yet.')).toHaveCount(0);
  await page.getByRole('button',{name:'Switch to dark mode'}).click();
  await page.screenshot({path:`test-results/transaction-quick-filters-${info.project.name}.png`,fullPage:false});
  await page.setViewportSize({width:320,height:740});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('transaction detail pills honor links and clear together',async({page},info)=>{
  await enter(page);
  await open(page,'/transactions?business=yes&receipt=no&type=expense');
  const group=(name:string)=>page.getByRole('group',{name});
  await expect(group('TYPE').getByRole('button',{name:'Expense'})).toHaveAttribute('aria-pressed','true');
  await expect(group('RECEIPT PRESENCE').getByRole('button',{name:'Missing receipt'})).toHaveAttribute('aria-pressed','true');
  await group('CLASSIFICATION').getByRole('button',{name:'Personal'}).click();
  await expect(page.getByText('Nothing matches yet.')).toBeVisible();
  await group('CLASSIFICATION').getByRole('button',{name:'Business'}).click();
  await expect(page.locator('.transaction-row').first()).toBeVisible();
  await group('REVIEW STATUS').getByRole('button',{name:'Reviewed',exact:true}).click();
  await group('BUSINESS-PURPOSE NOTE').getByRole('button',{name:'Missing note'}).click();
  await expect(group('BUSINESS-PURPOSE NOTE').getByRole('button',{name:'Missing note'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Clear filters'}).click();
  await expect(group('TYPE').getByRole('button',{name:'All types'})).toHaveAttribute('aria-pressed','true');
  await expect(group('CLASSIFICATION').getByRole('button',{name:'All classifications'})).toHaveAttribute('aria-pressed','true');
  await expect(group('REVIEW STATUS').getByRole('button',{name:'All statuses'})).toHaveAttribute('aria-pressed','true');
  await expect(group('RECEIPT PRESENCE').getByRole('button',{name:'Any receipt status'})).toHaveAttribute('aria-pressed','true');
  await expect(group('BUSINESS-PURPOSE NOTE').getByRole('button',{name:'Any note status'})).toHaveAttribute('aria-pressed','true');
  await expect(page).toHaveURL(/\/transactions$/);
  await page.getByRole('button',{name:'Switch to dark mode'}).click();
  await page.waitForTimeout(250);
  await page.screenshot({path:`test-results/transaction-detail-pills-${info.project.name}.png`,fullPage:false});
  await page.setViewportSize({width:320,height:740});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
