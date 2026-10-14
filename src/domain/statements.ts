import { duplicateKey } from './csv';
import type { Records, Statement } from './models';
export function statementMatches(statement:Statement,records:Records):string[]{
 if(!statement.rowKeys)return statement.transactionIds.filter(id=>records.transactions.some(t=>t.id===id));
 const keys=new Set(statement.rowKeys);
 return records.transactions.filter(t=>keys.has(duplicateKey(t))).map(t=>t.id);
}
export function statementMissing(statement:Statement,records:Records):number{
 if(!statement.rowKeys)return (statement.reviewRows??0)+statement.transactionIds.filter(id=>!records.transactions.some(t=>t.id===id)).length;
 const active=new Set(records.transactions.map(duplicateKey));
 return (statement.reviewRows??0)+statement.rowKeys.filter(key=>!active.has(key)).length;
}
