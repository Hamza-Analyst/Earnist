import { test, expect, type Page, type Locator } from '@playwright/test';

async function enter(page:Page) {
  await page.getByRole('button',{name:'Try with sample data',exact:true}).click();
  await page.getByRole('button',{name:'Skip for now',exact:true}).click();
  await expect(page.locator('.onboarding-panel h1')).toHaveText(/A little less admin\.|Your persona is ready\./);
  const trial=page.getByRole('button',{name:'Finish free trial',exact:true});
  if(await trial.isVisible())await trial.click();
  await page.getByRole('button',{name:'Use sample transactions',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Adobe Creative Cloud',exact:true})).toBeVisible();
}
async function readable(locator:Locator) {
  const ratio=await locator.evaluate(node=>{
    const values=(s:string)=>s.match(/[\d.]+/g)!.slice(0,3).map(Number);
    const lum=(rgb:number[])=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    const style=getComputedStyle(node),fg=values(style.color);let ancestor:Element|null=node,bg='';
    while(ancestor){bg=getComputedStyle(ancestor).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')break;ancestor=ancestor.parentElement;}
    const a=lum(fg),b=lum(values(bg));return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  });
  expect(ratio).toBeGreaterThanOrEqual(4.5);
}

test('appearance follows device, switches by keyboard and remembers an explicit choice',async({page},info)=>{
  await page.emulateMedia({colorScheme:'dark'});await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect(page.getByRole('button',{name:'Switch to light mode'})).toBeVisible();
  await page.emulateMedia({colorScheme:'light'});await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  const toggle=page.getByRole('button',{name:'Switch to dark mode'});await toggle.focus();await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await enter(page);
  await page.goto('/overview');await expect(page.locator('.main-content h1')).toBeVisible();
  await readable(page.locator('.main-content h1'));await readable(page.locator('.metric-card>div').first());
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content','#111b16');
  expect(await page.locator('.cash-chart rect').nth(1).evaluate(el=>getComputedStyle(el).fill)).toBe('rgb(169, 198, 177)');
  await page.screenshot({path:`test-results/theme-home-dark-${info.project.name}.png`,fullPage:true,animations:'disabled'});
  await page.getByRole('button',{name:'Switch to light mode'}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.emulateMedia({colorScheme:'dark'});await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.screenshot({path:`test-results/theme-home-light-${info.project.name}.png`,fullPage:false,animations:'disabled'});
});

test('dark mode covers tools, transaction dialogs, compact layouts and paper reports',async({page},info)=>{
  await page.emulateMedia({colorScheme:'light'});await page.goto('/');await enter(page);
  await page.getByRole('button',{name:'Switch to dark mode'}).click();
  for(const route of ['/overview','/review','/receipts','/statements','/ready-to-file','/reports','/more','/accounts','/rules','/mileage','/profile','/transactions']) {
    await page.goto(route);await expect(page.locator('.main-content h1')).toBeVisible();await readable(page.locator('.main-content h1'));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.getByRole('button',{name:'More',exact:true}).click();await expect(page.getByRole('menu')).toBeVisible();
  await readable(page.getByRole('menuitem',{name:'Bank statements',exact:true}));
  await page.screenshot({path:`test-results/theme-more-dark-${info.project.name}.png`,animations:'disabled'});
  await page.getByRole('menuitem',{name:/Add manual expense/}).click();await expect(page.getByRole('dialog')).toBeVisible();
  await readable(page.getByLabel('Merchant or description'));await page.getByLabel('Merchant or description').fill('Cash stationery');
  await page.screenshot({path:`test-results/theme-dialog-dark-${info.project.name}.png`,animations:'disabled'});await page.keyboard.press('Escape');
  await page.goto('/review');await expect(page.getByRole('article')).toBeVisible();await page.screenshot({path:`test-results/theme-swipe-dark-${info.project.name}.png`,fullPage:true,animations:'disabled'});
  await page.goto('/reports');await expect(page.locator('.report-preview')).toBeVisible();
  await readable(page.locator('.profile-context p').first());
  await page.emulateMedia({media:'print'});expect(await page.locator('.report-preview').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)');
  await readable(page.locator('.report-preview>h2'));await page.emulateMedia({media:'screen'});
  if(info.project.name==='mobile') {
    await page.setViewportSize({width:320,height:800});await page.goto('/overview');await expect(page.getByRole('button',{name:'Switch to light mode'})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.getByRole('button',{name:'More',exact:true}).click();await expect(page.getByRole('menu')).toBeInViewport();
    await page.keyboard.press('Escape');await page.getByRole('button',{name:'Switch to light mode'}).click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});

test('overview charts fit their content and reveal bar details',async({page},info)=>{
  await page.goto('/');
  await enter(page);
  await page.goto('/overview');
  const cash=page.locator('.cash-panel'),category=page.locator('.chart-grid > .panel');
  await expect(cash).toBeVisible();
  await expect(category.locator(".category-pie-chart")).toBeVisible();
  const incomeBar=page.locator('.cash-chart rect').first();
  await incomeBar.hover();
  await expect(page.locator('.chart-hover-detail')).toContainText('Income');
  await expect(page.locator('.chart-hover-detail')).toContainText('Spending');
  await page.screenshot({path:`test-results/overview-chart-hover-${info.project.name}.png`,fullPage:false});
  await page.locator('.cash-chart rect').nth(1).focus();
  await expect(page.locator('.chart-hover-detail')).toBeVisible();
  const categoryBar=page.locator('.category-bar .category-track').first();
  await categoryBar.hover();
  await expect(page.locator('.category-bar').first().locator('.category-hover-detail')).toBeVisible();
});

test('business pie chart shows every category and proportional spending',async({page},info)=>{
  await page.goto('/');
  await enter(page);
  await page.goto('/overview');
  const originalViewport=page.viewportSize()!;
  const chart=page.locator('.category-pie-chart');
  await expect(chart.getByRole('group',{name:'Business spending by category pie chart'})).toBeVisible();
  await expect(chart.locator('.category-pie-legend li')).toHaveCount(11);
  await expect(chart.locator('.category-pie-slice')).toHaveCount(5);
  await expect(chart.locator('.category-pie-summary')).toContainText('$1,476.19');
  const contractors=chart.getByRole('img',{name:'Contractors: $650.00, 44% of business spending',exact:true});
  await contractors.focus();
  await expect(chart.locator('.category-pie-summary')).toContainText('Contractors');
  await expect(chart.locator('.category-pie-summary')).toContainText('44% of total');
  await expect(chart.locator('.category-pie-legend li').filter({hasText:'Groceries'})).toContainText('$0.00');
  await expect(chart.getByRole('button')).toHaveCount(0);
  for(const width of [320,768,1024,1440]){
    await page.setViewportSize({width,height:1000});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await expect(chart.locator('.category-pie-legend li')).toHaveCount(11);
  }
  await page.setViewportSize(originalViewport);
  await page.getByRole('button',{name:'Switch to dark mode'}).click();
  await readable(chart.locator('.category-pie-name').first());
  await readable(chart.locator('.category-pie-legend strong').first());
  await page.screenshot({path:`test-results/category-pie-${info.project.name}.png`,fullPage:true});
});
