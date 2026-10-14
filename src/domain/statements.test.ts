import { describe, expect, it } from 'vitest';
import { emptyRecords, withSample } from './sample';
import { duplicateKey } from './csv';
import { statementMatches, statementMissing } from './statements';
import type { Statement } from './models';
describe('statement reconciliation after record changes',()=>{
 const records=withSample(emptyRecords()),transaction=records.transactions.find(t=>t.id==='demo-adobe')!;
 const statement:Statement={id:'statement',accountId:transaction.accountId,from:'2026-10-01',to:'2026-10-31',fileId:'file',name:'October.csv',status:'reviewed',transactionIds:[transaction.id],rowKeys:[duplicateKey(transaction)],reviewRows:0};
 it('preserves matching across classification and purpose changes',()=>{const changed={...records,transactions:records.transactions.map(t=>t.id===transaction.id?{...t,notes:'Client design',classification:'business' as const,reviewStatus:'reviewed' as const,businessPercent:100}:t)};expect(statementMatches(statement,changed)).toEqual([transaction.id]);expect(statementMissing(statement,changed)).toBe(0);});
 it('requires review after an amount correction or moving the record to trash',()=>{const changed={...records,transactions:records.transactions.map(t=>t.id===transaction.id?{...t,amountCents:6000}:t)};expect(statementMatches(statement,changed)).toEqual([]);expect(statementMissing(statement,changed)).toBe(1);const trashed={...records,transactions:records.transactions.filter(t=>t.id!==transaction.id),trash:[transaction]};expect(statementMissing(statement,trashed)).toBe(1);expect(statementMissing(statement,{...trashed,transactions:[...trashed.transactions,transaction],trash:[]})).toBe(0);});
 it('counts invalid source rows separately and prevents matching another account',()=>{expect(statementMissing({...statement,reviewRows:1},records)).toBe(1);const changed={...records,transactions:records.transactions.map(t=>t.id===transaction.id?{...t,accountId:'sample-business'}:t)};expect(statementMissing(statement,changed)).toBe(1);});
});
