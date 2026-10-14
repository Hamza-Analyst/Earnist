import { distanceIn, parseCents, validDate } from './finance';
import type { Mileage, Transaction, TransactionType, Unit } from './models';
export function csvCell(value: unknown): string {
  let text=String(value??'');
  if(/^[\s]*[=+\-@\t\r]/.test(text))text="'"+text;
  return '"'+text.replaceAll('"','""')+'"';
}
export const makeCsv = (rows: unknown[][]) => rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
export function parseCsv(text: string): string[][] {
  const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
  const input=text.replace(/^\uFEFF/,'');
  for(let i=0;i<input.length;i++){
    const c=input[i];
    if(c==='"'){if(quoted&&input[i+1]==='"'){cell+='"';i++;}else if(!quoted&&cell==='')quoted=true;else if(quoted)quoted=false;else throw new Error('Unexpected quote in CSV.');}
    else if(c===','&&!quoted){row.push(cell);cell='';}
    else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&input[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';}
    else cell+=c;
  }
  if(quoted)throw new Error('The CSV has an unclosed quoted field.');
  row.push(cell);if(row.some(v=>v.trim()))rows.push(row);
  if(rows.length>2001)throw new Error('Import up to 2,000 rows at a time.');
  return rows;
}
export interface Mapping {date:number;description:number;amount:number;type:number}
export interface ImportRow { row:number;date:string;description:string;amountCents:number;type:TransactionType;errors:string[];duplicate:boolean;key:string }
export const duplicateKey = (t: Pick<Transaction,'accountId'|'date'|'description'|'amountCents'|'type'>) => [t.accountId,t.date,t.description.trim().toLocaleLowerCase('en-US').replace(/\s+/g,' '),t.amountCents,t.type].join('|');
export function previewImport(rows:string[][],mapping:Mapping,accountId:string,existing:Transaction[]):ImportRow[]{
  const seen=new Set(existing.map(duplicateKey));
  return rows.map((cells,index)=>{
    const date=(cells[mapping.date]??'').trim(), description=(cells[mapping.description]??'').trim(),value=parseCents(cells[mapping.amount]??'');
    const rawType=mapping.type<0?'':(cells[mapping.type]??'').trim().toLowerCase();
    const type:TransactionType=mapping.type<0?(value!==null&&value<0?'expense':'income'):rawType==='income'?'income':rawType==='transfer'?'transfer':'expense';
    const errors:string[]=[];
    if(!validDate(date))errors.push('Date must be YYYY-MM-DD.');
    if(!description)errors.push('Description is required.');
    if(value===null||value===0)errors.push('Amount must be nonzero, with at most two decimals.');
    if(mapping.type>=0&&!['income','expense','transfer'].includes(rawType))errors.push('Type must be income, expense, or transfer.');
    const amountCents=Math.abs(value??0),key=duplicateKey({accountId,date,description,amountCents,type});
    const duplicate=!errors.length&&seen.has(key);if(!errors.length)seen.add(key);
    return {row:index+2,date,description,amountCents,type,errors,duplicate,key};
  });
}
export function transactionCsv(rows:Transaction[],accounts:{id:string;name:string}[],categories:{id:string;name:string}[],businessCases:{id:string;name:string}[] = []) {
  return makeCsv([['ID','Date','Description','Account','Type','Amount USD','Review status','Classification','Business percent','Business USD','Personal USD','Category','Business case','Receipt attached','Notes'],...rows.map(t=>{
    const business=t.type==='expense'&&t.reviewStatus==='reviewed'?Math.round(t.amountCents*t.businessPercent/100):0;
    const personal=t.type==='expense'&&t.reviewStatus==='reviewed'?t.amountCents-business:0;
    return [t.id,t.date,t.description,accounts.find(a=>a.id===t.accountId)?.name??'',t.type,(t.amountCents/100).toFixed(2),t.reviewStatus,t.classification??'',t.businessPercent,(business/100).toFixed(2),(personal/100).toFixed(2),categories.find(c=>c.id===t.categoryId)?.name??'',businessCases.find(item=>item.id===t.businessCaseId)?.name??'',t.receiptId?'Yes':'No',t.notes];
  })]);
}
export function mileageCsv(trips:Mileage[],unit:Unit){return makeCsv([['ID','Date','Start','Destination','Purpose','Distance','Unit','Original distance','Original unit','Classification','Notes'],...trips.map(t=>[t.id,t.date,t.start,t.destination,t.purpose,distanceIn(t,unit).toFixed(3),unit,t.distance,t.unit,t.classification,t.notes])]);}
