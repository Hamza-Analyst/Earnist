import type { Classification, Mileage, RecordFilter, Records, Transaction, Unit } from './models';
export const money = (cents: number) => new Intl.NumberFormat('en-US', { style:'currency',currency:'USD' }).format(cents / 100);
export const dateLabel = (date: string) => new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
export function validDate(value: string): boolean { return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value+'T12:00:00Z')) && new Date(value+'T12:00:00Z').toISOString().slice(0,10) === value; }
export function parseCents(value: string): number | null {
  const raw=value.trim().replace(/^\$/, '');
  if(raw.includes(',')&&!/^[+-]?\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(raw))return null;
  const normalized=raw.replace(/,/g,'');
  if(!/^[+-]?\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const cents=Math.round(Number(normalized)*100);
  return Number.isSafeInteger(cents) && Math.abs(cents) <= 100000000000 ? cents : null;
}
export function allocation(t: Transaction) {
  if(t.type!=='expense' || t.reviewStatus==='unreviewed' || !t.classification) return { business:0,personal:0 };
  const business=Math.round(t.amountCents*t.businessPercent/100);
  return { business, personal:t.amountCents-business };
}
export const filterTransactions = (records: Records, f: RecordFilter) => records.transactions.filter(t => (!f.from || t.date>=f.from) && (!f.to || t.date<=f.to) && (!f.accountId || t.accountId===f.accountId) && (!f.businessCaseId || t.businessCaseId===f.businessCaseId));
export function summarize(records: Records, f: RecordFilter) {
  const rows=filterTransactions(records,f);
  let income=0,spending=0,business=0,personal=0,unreviewedCents=0,unreviewedCount=0,businessCount=0,receipts=0;
  const byCategory: Record<string,number>={}, months: Record<string,{income:number;spending:number}>={};
  for(const t of rows){
    const month=t.date.slice(0,7);months[month]??={income:0,spending:0};
    if(t.type==='income'){income+=t.amountCents;months[month].income+=t.amountCents;}
    if(t.type!=='expense')continue;
    spending+=t.amountCents;months[month].spending+=t.amountCents;
    if(t.reviewStatus==='unreviewed'){unreviewedCount++;unreviewedCents+=t.amountCents;continue;}
    const a=allocation(t);business+=a.business;personal+=a.personal;
    if(a.business>0){businessCount++;if(t.receiptId)receipts++;byCategory[t.categoryId]=(byCategory[t.categoryId]??0)+a.business;}
  }
  return {rows,income,spending,business,personal,unreviewedCents,unreviewedCount,businessCount,receipts,byCategory,net:income-spending,months:Object.entries(months).sort(([a],[b])=>a.localeCompare(b)).map(([month,values])=>({month,...values}))};
}
export function classifyRecord(records: Records, id: string, classification: Classification, percent: number, categoryId: string, now: number, businessCaseId?: string): Records {
  const t=records.transactions.find(t=>t.id===id);
  if(!t || t.type!=='expense' || t.reviewStatus!=='unreviewed' || !records.categories.some(c=>c.id===categoryId))return records;
  const selectedCase=businessCaseId??records.businessCases?.[0]?.id;
  if(classification!=='personal'&&selectedCase&&!records.businessCases?.some(item=>item.id===selectedCase&&item.categoryIds.includes(categoryId)))return records;
  const businessPercent=classification==='business'?100:classification==='personal'?0:percent;
  if(!Number.isInteger(businessPercent)||businessPercent<0||businessPercent>100)return records;
  return { ...records,transactions:records.transactions.map(row=>row.id===id?{...row,classification,businessPercent,categoryId,businessCaseId:classification==='personal'?null:selectedCase??null,reviewStatus:'reviewed'}:row),
    undo:[...records.undo.slice(-19),{transaction:{...t,categoryId},skippedBefore:records.skipped,kind:'classification'}],skipped:records.skipped.filter(x=>x!==id),profile:{...records.profile,firstSwipeAt:records.profile.firstSwipeAt??now} };
}
export function undoReview(records: Records): Records {
  const entry=records.undo.at(-1);if(!entry || !records.transactions.some(t=>t.id===entry.transaction.id))return records;
  return {...records,transactions:records.transactions.map(t=>t.id===entry.transaction.id?{...entry.transaction,receiptId:t.receiptId,notes:t.notes}:t),undo:records.undo.slice(0,-1),skipped:entry.skippedBefore};
}
export const distanceIn = (trip: Pick<Mileage,'distance'|'unit'>, unit: Unit) => trip.unit===unit?trip.distance:trip.unit==='mi'?trip.distance*1.609344:trip.distance/1.609344;
export const filterMileage = (trips: Mileage[],f: Pick<RecordFilter,'from'|'to'>) => trips.filter(t=>(!f.from||t.date>=f.from)&&(!f.to||t.date<=f.to));
export const businessDistance = (trips: Mileage[],unit: Unit) => trips.filter(t=>t.classification==='business').reduce((sum,t)=>sum+distanceIn(t,unit),0);
export function validateTransaction(t: Transaction,records: Records): string {
  if(!t.description.trim())return 'Enter a merchant or description.';
  if(!validDate(t.date))return 'Enter a valid date.';
  if(!Number.isSafeInteger(t.amountCents)||t.amountCents<=0||t.amountCents>100000000000)return 'Enter a positive USD amount with at most two decimal places.';
  if(!records.accounts.some(a=>a.id===t.accountId))return 'Choose a source account.';
  if(!records.categories.some(c=>c.id===t.categoryId))return 'Choose an expense category.';
  if(t.type==='expense'&&t.classification&&t.classification!=='personal'&&records.businessCases?.length){const item=records.businessCases.find(businessCase=>businessCase.id===t.businessCaseId);if(!item)return 'Choose a business case for this work expense.';if(!item.categoryIds.includes(t.categoryId))return 'Choose a category that fits this business case.';}
  if(!Number.isInteger(t.businessPercent)||t.businessPercent<0||t.businessPercent>100)return 'Business percentage must be a whole number from 0 to 100.';
  return '';
}
