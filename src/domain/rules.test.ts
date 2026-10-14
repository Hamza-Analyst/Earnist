import { describe, expect, it } from 'vitest';
import type { MerchantRule, Transaction } from './models';
import { emptyRecords, withSample } from './sample';
import { applyRulesToNewRecords, matchingRules, ruleMatches, saveRule, validateRule } from './rules';
import { allocation, summarize } from './finance';
import { migrateRecords, validRecords } from '../data/database';
const filter={from:'',to:'',accountId:''};
const rule:MerchantRule={id:'rule-adobe',merchant:'Adobe Creative Cloud',match:'exact',enabled:true,classification:'mixed',businessPercent:60,categoryId:'software',createdAt:'2026-10-07'};
const fresh=(base:Transaction,id='future')=>({...base,id,date:'2026-10-08',amountCents:10000,classification:null,businessPercent:0,reviewStatus:'unreviewed' as const});
describe('merchant rules and migration',()=>{
  it('normalizes exact matches and gives contains matching an explicit meaning',()=>{
    expect(ruleMatches(rule,'  ADOBE   Creative Cloud ')).toBe(true);
    expect(ruleMatches(rule,'Adobe Creative Cloud renewal')).toBe(false);
    expect(ruleMatches({...rule,match:'contains'},'Adobe Creative Cloud renewal')).toBe(true);
    expect(validateRule({...rule,merchant:'a'},withSample(emptyRecords()))).toContain('three');
  });
  it('allocates a new $100 expense to $60 business and $40 personal without tax savings',()=>{
    const before={...withSample(emptyRecords()),rules:[rule]},t=fresh(before.transactions[0]);
    const next=applyRulesToNewRecords(before,{...before,transactions:[t,...before.transactions]});
    expect(allocation(next.transactions[0])).toEqual({business:6000,personal:4000});
    expect(next.transactions[0].ruleId).toBe(rule.id);expect(next.transactions[0].reviewStatus).toBe('reviewed');
    expect(next.profile.firstSwipeAt).toBeNull();
    expect(summarize(next,filter).business-summarize(before,filter).business).toBe(6000);
  });
  it('never overwrites old records, explicit manual classifications, incomes or transfers',()=>{
    const before={...withSample(emptyRecords()),rules:[rule]},t=fresh(before.transactions[0]);
    const entries=[{...t,id:'income',type:'income' as const,reviewStatus:'reviewed' as const}, {...t,id:'transfer',type:'transfer' as const,reviewStatus:'reviewed' as const},{...t,id:'personal',classification:'personal' as const,reviewStatus:'reviewed' as const}];
    const next=applyRulesToNewRecords(before,{...before,transactions:[...entries,...before.transactions]});
    expect(next.transactions).toEqual([...entries,...before.transactions]);
    expect(before.transactions[0].reviewStatus).toBe('unreviewed');
  });
  it('leaves ambiguous matches unreviewed and ignores disabled rules',()=>{
    const before={...withSample(emptyRecords()),rules:[rule,{...rule,id:'second',match:'contains' as const,merchant:'Adobe'}]},t=fresh(before.transactions[0]);
    expect(matchingRules(before.rules,t.description)).toHaveLength(2);
    expect(applyRulesToNewRecords(before,{...before,transactions:[t,...before.transactions]}).transactions[0].reviewStatus).toBe('unreviewed');
    const disabled={...before,rules:before.rules.map(r=>({...r,enabled:false}))};
    expect(applyRulesToNewRecords(disabled,{...disabled,transactions:[t,...disabled.transactions]}).transactions[0]).toEqual(t);
  });
  it('applies existing records only on explicit opt-in, keeping reviewed corrections and receipts',()=>{
    const before=withSample(emptyRecords());before.transactions[0].receiptId='file-kept';before.transactions[0].notes='Work and personal';
    expect(saveRule(before,rule,false).transactions).toEqual(before.transactions);
    const next=saveRule(before,rule,true),current=next.transactions.find(t=>t.id==='demo-adobe')!;
    expect(current.classification).toBe('mixed');expect(current.receiptId).toBe('file-kept');expect(current.notes).toBe('Work and personal');
    expect(next.transactions.find(t=>t.id==='demo-aug-adobe')).toEqual(before.transactions.find(t=>t.id==='demo-aug-adobe'));
    const edited=saveRule(next,{...rule,businessPercent:30},true);
    expect(edited.transactions.find(t=>t.id==='demo-adobe')?.businessPercent).toBe(60);
  });
  it('does not apply again on unrelated saves or classify with invalid allocations',()=>{
    const before=saveRule(withSample(emptyRecords()),rule,true);
    expect(applyRulesToNewRecords(before,{...before})).toEqual(before);
    expect(saveRule(before,{...rule,businessPercent:101},true)).toBe(before);
    expect(validRecords({...before,rules:[{...rule,businessPercent:101}]})).toBe(false);
  });
  it('migrates v2 progress without deleting accounts, classifications, receipts or preferences',()=>{
    const original=withSample(emptyRecords());original.transactions[0].receiptId='receipt-preserved';original.profile.businessName='Existing studio';
    const legacy={...original,version:2,rules:undefined,profile:{...original.profile,tax:undefined,businessDescription:undefined}};
    const next=migrateRecords(legacy)!;expect(next.version).toBe(3);expect(next.rules).toEqual([]);
    expect(next.transactions).toEqual(original.transactions);expect(next.accounts).toEqual(original.accounts);
    expect(next.profile.businessName).toBe('Existing studio');expect(next.profile.tax.reportYear).toBe('');
    expect(validRecords(next)).toBe(true);expect(migrateRecords({...legacy,accounts:[]})).toBeNull();
  });
  it('rejects malformed tax drafts without treating partial valid drafts as required',()=>{
    const r=withSample(emptyRecords());expect(validRecords(r)).toBe(true);
    expect(validRecords({...r,profile:{...r.profile,tax:{...r.profile.tax,reportYear:'26'}}})).toBe(false);
    expect(validRecords({...r,profile:{...r.profile,tax:{...r.profile.tax,reportYear:'2026',jurisdiction:'User supplied context'}}})).toBe(true);
  });
});
