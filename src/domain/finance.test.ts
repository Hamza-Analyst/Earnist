import { describe, expect, it } from 'vitest';
import { allocation, businessDistance, classifyRecord, distanceIn, parseCents, summarize, undoReview, validDate } from './finance';
import { emptyRecords, TEST_CARD_ID, withSample, withTestCard } from './sample';
import { makeCsv, parseCsv, previewImport, transactionCsv } from './csv';
import { validRecords } from '../data/database';
import { validateReceipt } from './receipts';
const all={from:'',to:'',accountId:''};
describe('shared financial records',()=>{
  it('classifies only expenses and rejects stale duplicate actions',()=>{
    const r=withSample(emptyRecords()),next=classifyRecord(r,'demo-adobe','business',100,'software',1234);
    expect(next.transactions.find(t=>t.id==='demo-adobe')?.reviewStatus).toBe('reviewed');
    expect(classifyRecord(next,'demo-adobe','business',100,'software',1235)).toBe(next);
    expect(classifyRecord(r,'demo-oct-client','business',100,'software',1234)).toBe(r);
    expect(classifyRecord(r,'demo-oct-transfer','business',100,'software',1234)).toBe(r);
  });
  it('sums allocations in cents without treating transfers or unreviewed items as business',()=>{
    const r=withSample(emptyRecords()),s=summarize(r,all);
    expect(s.income).toBe(1285000);expect(s.business).toBe(147619);expect(s.personal).toBe(29494);
    expect(s.unreviewedCount).toBe(4);expect(s.unreviewedCents).toBe(28884);
    expect(s.spending).toBe(s.business+s.personal+s.unreviewedCents);
    expect(s.net).toBe(s.income-s.spending);
    expect(Object.values(s.byCategory).reduce((a,b)=>a+b,0)).toBe(s.business);
  });
  it('keeps mixed allocations exact at the rounding boundary',()=>{
    const r=withSample(emptyRecords()),t={...r.transactions[0],amountCents:101,classification:'mixed' as const,reviewStatus:'reviewed' as const,businessPercent:33};
    expect(allocation(t)).toEqual({business:33,personal:68});
    expect(allocation({...t,amountCents:1,businessPercent:50})).toEqual({business:1,personal:0});
  });
  it('undo restores status, category, counts and totals while preserving attached evidence',()=>{
    const r=withSample(emptyRecords()),before=summarize(r,all);
    let next=classifyRecord(r,'demo-adobe','mixed',60,'equipment',10000);
    next={...next,transactions:next.transactions.map(t=>t.id==='demo-adobe'?{...t,receiptId:'receipt-test',notes:'Evidence note'}:t)};
    const undone=undoReview(next),t=undone.transactions.find(t=>t.id==='demo-adobe')!;
    expect(t.reviewStatus).toBe('unreviewed');expect(t.categoryId).toBe('equipment');expect(t.receiptId).toBe('receipt-test');expect(t.notes).toBe('Evidence note');
    expect(summarize(undone,all).business).toBe(before.business);expect(summarize(undone,all).unreviewedCount).toBe(4);expect(undone.profile.firstSwipeAt).toBe(10000);
  });
  it('uses consistent date/account filters across totals, charts and records',()=>{
    const r=withSample(emptyRecords()),s=summarize(r,{from:'2026-09-01',to:'2026-09-30',accountId:'sample-business'});
    expect(s.rows).toHaveLength(2);expect(s.income).toBe(180000);expect(s.business).toBe(65000);
    expect(s.months).toEqual([{month:'2026-09',income:180000,spending:65000}]);
  });
  it('sample loading is idempotent and respects existing local records',()=>{
    const r=withSample(emptyRecords());expect(withSample(r)).toBe(r);expect(validRecords(r)).toBe(true);
  });
  it('connects a test card once and derives its charges without altering existing records',()=>{
    const original=withSample(emptyRecords()),next=withTestCard(original);
    expect(validRecords(next)).toBe(true);expect(withTestCard(next)).toBe(next);
    expect(next.transactions.slice(0,original.transactions.length)).toEqual(original.transactions);
    expect(next.accounts.filter(a=>a.id===TEST_CARD_ID)).toHaveLength(1);
    const totals=summarize(next,{...all,accountId:TEST_CARD_ID});
    expect(totals.rows).toHaveLength(6);expect(totals.income).toBe(0);
    expect(totals.spending).toBe(42405);expect(totals.business).toBe(4800);
    expect(totals.personal).toBe(12800);expect(totals.unreviewedCount).toBe(4);
    expect(totals.unreviewedCents).toBe(24805);
    const standalone=withTestCard(emptyRecords());
    expect(standalone.sampleLoaded).toBe(false);expect(validRecords(standalone)).toBe(true);
    expect(withSample(standalone).transactions).toHaveLength(29);
  });
  it('receipt coverage counts only expenses with positive business allocations',()=>{
    const r=withSample(emptyRecords());r.transactions=r.transactions.map(t=>({...t,receiptId:'file'}));const s=summarize(r,all);expect(s.receipts).toBe(s.businessCount);expect(s.businessCount).toBe(8);
  });
  it('converts mileage explicitly without calculating a tax amount',()=>{
    const trip={distance:10,unit:'mi' as const};expect(distanceIn(trip,'km')).toBeCloseTo(16.09344);
    expect(businessDistance(withSample(emptyRecords()).mileage,'mi')).toBe(31);
  });
  it('validates date-only values and positive cent precision',()=>{
    expect(validDate('2026-02-29')).toBe(false);expect(validDate('2024-02-29')).toBe(true);expect(validDate('2026-13-01')).toBe(false);
    expect(parseCents('59.99')).toBe(5999);expect(parseCents('-12.30')).toBe(-1230);expect(parseCents('1.234')).toBeNull();expect(parseCents('NaN')).toBeNull();expect(parseCents('1,2')).toBeNull();expect(parseCents('1,200.50')).toBe(120050);
  });
  it('rejects incompatible and broken relationships in persisted records',()=>{
    expect(validRecords(null)).toBe(false);expect(validRecords({version:1})).toBe(false);
    const r=withSample(emptyRecords());expect(validRecords({...r,transactions:[{...r.transactions[0],accountId:'missing'}]})).toBe(false);
    expect(validRecords({...r,transactions:[{...r.transactions[0],classification:'business',businessPercent:100,reviewStatus:'unreviewed'}]})).toBe(false);
  });
});
describe('CSV import and safe export',()=>{
  it('round trips commas, quotes, newlines, BOM and CRLF',()=>{
    const rows=[['Date','Description','Amount'],['2026-10-07','Client, "A"\nProject','15.00']];expect(parseCsv('\uFEFF'+makeCsv(rows))).toEqual(rows);
    expect(()=>parseCsv('"unclosed')).toThrow();
  });
  it('neutralizes spreadsheet formulas including whitespace prefixes',()=>{
    const values=['=SUM(1,2)','+cmd','-1+2','@SUM(A1)',' \t=HYPERLINK("x")'];
    expect(parseCsv(makeCsv([values]))[0]).toEqual(values.map(v=>"'"+v));
  });
  it('validates dates, amounts and type, and flags existing/in-file duplicates',()=>{
    const r=withSample(emptyRecords()),rows=[['2026-10-06','  Adobe   Creative Cloud ','59.99','expense'],['2026-10-07','New tool','10','expense'],['2026-10-07','new tool','10.00','expense'],['2026-02-30','Bad date','12.00','expense'],['2026-10-07','Bad amount','x','expense'],['2026-10-07','Unknown type','5','outflow']];
    const p=previewImport(rows,{date:0,description:1,amount:2,type:3},'sample-checking',r.transactions);
    expect(p[0].duplicate).toBe(true);expect(p[1].duplicate).toBe(false);expect(p[2].duplicate).toBe(true);expect(p.slice(3).every(x=>x.errors.length)).toBe(true);
  });
  it('uses a documented signed-amount convention without treating transfers as income',()=>{
    const p=previewImport([['2026-10-07','Supplies','-22.50'],['2026-10-07','Client','300']],{date:0,description:1,amount:2,type:-1},'manual',[]);
    expect(p.map(r=>[r.type,r.amountCents])).toEqual([['expense',2250],['income',30000]]);
  });
  it('exports exactly the filtered records with business/personal allocation columns',()=>{
    const r=withSample(emptyRecords()),s=summarize(r,{...all,from:'2026-09-01',to:'2026-09-30'}),csv=parseCsv(transactionCsv(s.rows,r.accounts,r.categories));
    expect(csv).toHaveLength(s.rows.length+1);expect(csv.slice(1).reduce((sum,row)=>sum+Math.round(Number(row[9])*100),0)).toBe(s.business);
  });
});
describe('receipt validation',()=>{
  it('accepts PNG signature, rejects disguised files and oversize files',async()=>{
    expect(await validateReceipt(new File([new Uint8Array([137,80,78,71,13,10,26,10])],'receipt.png',{type:'image/png'}))).toBe('');
    expect(await validateReceipt(new File(['not a PDF'],'receipt.pdf',{type:'application/pdf'}))).toContain('valid JPG');
    expect(await validateReceipt(new File([new Uint8Array(10*1024*1024+1)],'large.png',{type:'image/png'}))).toContain('10 MB');
  });
});
