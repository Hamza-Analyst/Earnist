import type { MerchantRule, Records, Transaction } from './models';

export const normalizeMerchant = (value: string) => value.trim().toLocaleLowerCase('en-US').replace(/\s+/g, ' ');
export function ruleMatches(rule: MerchantRule, description: string) {
  const merchant = normalizeMerchant(rule.merchant), value = normalizeMerchant(description);
  return !!merchant && (rule.match === 'exact' ? value === merchant : value.includes(merchant));
}
export function matchingRules(rules: MerchantRule[], description: string) {
  return rules.filter(rule => rule.enabled && ruleMatches(rule, description));
}
export function validateRule(rule: MerchantRule, records: Records) {
  if (!rule.merchant.trim() || rule.merchant.trim().length < 3) return 'Use at least three characters for the merchant match.';
  if (!['exact', 'contains'].includes(rule.match)) return 'Choose an exact or contains match.';
  if (!records.categories.some(c => c.id === rule.categoryId)) return 'Choose an expense category.';
  if (!['business', 'personal', 'mixed'].includes(rule.classification)) return 'Choose a classification.';
  if (!Number.isInteger(rule.businessPercent) || rule.businessPercent < 0 || rule.businessPercent > 100) return 'Use a whole business percentage between 0 and 100.';
  if ((rule.classification === 'business' && rule.businessPercent !== 100) || (rule.classification === 'personal' && rule.businessPercent !== 0)) return 'The percentage must match the classification.';
  if (rule.classification === 'mixed' && (rule.businessPercent < 1 || rule.businessPercent > 99)) return 'Mixed expenses need a business percentage from 1 to 99.';
  return '';
}
export function applyRule(rule: MerchantRule, transaction: Transaction): Transaction {
  return { ...transaction, classification: rule.classification, businessPercent: rule.businessPercent,
    categoryId: rule.categoryId, reviewStatus: 'reviewed', ruleId: rule.id };
}
export function applyRulesToNewRecords(before: Records, next: Records): Records {
  if (!next.rules.some(r => r.enabled)) return next;
  const existing = new Set(before.transactions.map(t => t.id));
  let changed = false;
  const transactions = next.transactions.map(t => {
    if (existing.has(t.id) || t.type !== 'expense' || t.reviewStatus !== 'unreviewed') return t;
    const matches = matchingRules(next.rules, t.description);
    if (matches.length !== 1) return t; // Ambiguous matches stay unreviewed for user control.
    const matchingCases=(next.businessCases??[]).filter(item=>item.categoryIds.includes(matches[0].categoryId));
    if((next.businessCases?.length??0)>1&&matches[0].classification!=='personal'&&matchingCases.length!==1)return t;
    changed = true;
    return {...applyRule(matches[0], t),businessCaseId:matches[0].classification==='personal'?null:matchingCases[0]?.id??null};
  });
  return changed ? { ...next, transactions } : next;
}
export function saveRule(records: Records, rule: MerchantRule, applyExisting: boolean): Records {
  if (validateRule(rule, records)) return records;
  const rules = records.rules.some(r => r.id === rule.id)
    ? records.rules.map(r => r.id === rule.id ? rule : r) : [...records.rules, rule];
  const ids = new Set<string>();
  const transactions = applyExisting && rule.enabled ? records.transactions.map(t => {
    if (t.type !== 'expense' || t.reviewStatus !== 'unreviewed' || !ruleMatches(rule, t.description)) return t;
    const matches = matchingRules(rules, t.description);
    if (matches.length !== 1 || matches[0].id !== rule.id) return t;
    const matchingCases=(records.businessCases??[]).filter(item=>item.categoryIds.includes(rule.categoryId));
    if((records.businessCases?.length??0)>1&&rule.classification!=='personal'&&matchingCases.length!==1)return t;
    ids.add(t.id);
    return {...applyRule(rule,t),businessCaseId:rule.classification==='personal'?null:matchingCases[0]?.id??null};
  }) : records.transactions;
  return { ...records, rules, transactions, skipped: records.skipped.filter(id => !ids.has(id)),
    undo: records.undo.filter(entry => !ids.has(entry.transaction.id)) };
}
