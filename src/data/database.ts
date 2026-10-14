import { emptyRecords } from '../domain/sample';
import { validDate } from '../domain/finance';
import type { Receipt, Records } from '../domain/models';
import { validateRule } from '../domain/rules';
import { normalizeBusinessCases } from '../domain/workCases';
export const DB_NAME='earnist-local-demo';
const DB_VERSION=2;
function openDatabase():Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('records'))db.createObjectStore('records');if(!db.objectStoreNames.contains('receipts'))db.createObjectStore('receipts',{keyPath:'id'});};
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(new Error('Close other Earnist demo tabs, then retry.'));
  });
}
export function validRecords(value: unknown):value is Records {
  if(!value||typeof value!=='object')return false;
  const r=value as Records;
  if(r.version!==3||!Array.isArray(r.accounts)||!Array.isArray(r.transactions)||!Array.isArray(r.categories)||!Array.isArray(r.rules)||!Array.isArray(r.mileage)||!Array.isArray(r.undo)||!Array.isArray(r.skipped)||!r.profile)return false;
  if(r.receiptVault&&(!Array.isArray(r.receiptVault)||r.receiptVault.some(f=>!f||typeof f.id!=='string'||typeof f.name!=='string'||!['image/jpeg','image/png','application/pdf'].includes(f.type)||!Number.isSafeInteger(f.size)||f.size<=0||f.size>10*1024*1024||typeof f.createdAt!=='string'||!Number.isFinite(Date.parse(f.createdAt)))||new Set(r.receiptVault.map(f=>f.id)).size!==r.receiptVault.length))return false;
  if(r.receiptVault?.some(f=>[...r.transactions,...r.trash??[]].some(t=>t.receiptId===f.id)||r.statements?.some(s=>s.fileId===f.id)))return false;
  if(r.businessCases&&(!Array.isArray(r.businessCases)||r.businessCases.some(item=>!item||typeof item.id!=='string'||!item.id||typeof item.name!=='string'||!item.name.trim()||!['Freelancer','Business owner','Creator','Athlete','Musician','Other'].includes(item.workType)||!Array.isArray(item.categoryIds)||!item.categoryIds.length||item.categoryIds.some(id=>typeof id!=='string'||!r.categories.some(category=>category.id===id))||new Set(item.categoryIds).size!==item.categoryIds.length)||new Set(r.businessCases.map(item=>item.id)).size!==r.businessCases.length))return false;
  const businessCaseIds=new Set(r.businessCases?.map(item=>item.id)??[]);
  const ids=new Set(r.accounts.map(a=>a?.id));
  const categoryIds=new Set(r.categories.map(c=>c?.id));
  if(r.accounts.some(a=>!a||typeof a.id!=='string'||typeof a.name!=='string'||!['sample','manual'].includes(a.kind))||ids.size!==r.accounts.length)return false;
  if(r.categories.some(c=>!c||typeof c.id!=='string'||typeof c.name!=='string')||categoryIds.size!==r.categories.length)return false;
  if(new Set(r.transactions.map(t=>t?.id)).size!==r.transactions.length)return false;
  if(r.transactions.some(t=>!t||typeof t.id!=='string'||!ids.has(t.accountId)||!categoryIds.has(t.categoryId)||!validDate(t.date)||typeof t.description!=='string'||typeof t.notes!=='string'||t.currency!=='USD'||!Number.isSafeInteger(t.amountCents)||t.amountCents<=0||!['income','expense','transfer'].includes(t.type)||(t.businessCaseId!=null&&!businessCaseIds.has(t.businessCaseId))||!['unreviewed','reviewed'].includes(t.reviewStatus)||![null,'business','personal','mixed'].includes(t.classification)||!Number.isInteger(t.businessPercent)||t.businessPercent<0||t.businessPercent>100||!(t.receiptId===null||typeof t.receiptId==='string')))return false;
  if(r.transactions.some(t=>t.type==='expense'&&(t.reviewStatus==='unreviewed'?(t.classification!==null||t.businessPercent!==0):(!t.classification||(t.classification==='business'&&t.businessPercent!==100)||(t.classification==='personal'&&t.businessPercent!==0)))))return false;
  if(r.mileage.some(t=>!t||typeof t.id!=='string'||!validDate(t.date)||!Number.isFinite(t.distance)||t.distance<=0||!['mi','km'].includes(t.unit)||!['business','personal'].includes(t.classification)||[t.start,t.destination,t.purpose,t.notes].some(x=>typeof x!=='string')))return false;
  if(r.transactions.some(t=>t.type!=='expense'&&(t.classification!==null||t.businessPercent!==0||t.reviewStatus!=='reviewed')))return false;
  if(r.statements && (!Array.isArray(r.statements)||r.statements.some(s=>!s||typeof s.id!=='string'||!ids.has(s.accountId)||!validDate(s.from)||!validDate(s.to)||s.from>s.to||typeof s.fileId!=='string'||typeof s.name!=='string'||!['uploaded','reviewed'].includes(s.status)||!Array.isArray(s.transactionIds)||s.transactionIds.some(id=>typeof id!=='string')||(s.rowKeys!==undefined&&(!Array.isArray(s.rowKeys)||s.rowKeys.some(key=>typeof key!=='string')))||(s.reviewRows!==undefined&&(!Number.isInteger(s.reviewRows)||s.reviewRows<0)))))return false;
  if(r.trash && (!Array.isArray(r.trash)||!validRecords({...r,trash:undefined,transactions:[...r.transactions,...r.trash]})))return false;
  const p=r.profile;
  if([p.email,p.phone,p.businessWebsite,p.businessLocation].some(value=>value!==undefined&&typeof value!=='string'))return false;
  if(p.photoDataUrl!==undefined&&(typeof p.photoDataUrl!=='string'||p.photoDataUrl.length>500000||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(p.photoDataUrl)))return false;
  if(p.filing&&(typeof p.filing!=='object'||(p.filing.areas!==undefined&&(!Array.isArray(p.filing.areas)||p.filing.areas.length!==4||p.filing.areas.some(a=>typeof a!=='boolean')))||(p.filing.swipesConfirmed!==undefined&&typeof p.filing.swipesConfirmed!=='boolean')||(p.filing.statementsConfirmed!==undefined&&typeof p.filing.statementsConfirmed!=='boolean')||(p.filing.reviewedSnapshot!==undefined&&typeof p.filing.reviewedSnapshot!=='string')))return false;
  if(p.accessChoice!==undefined&&!['trial','pro-preview'].includes(p.accessChoice))return false;
  if(r.rules.some(rule=>!rule||typeof rule.id!=='string'||typeof rule.merchant!=='string'||typeof rule.enabled!=='boolean'||!validDate(rule.createdAt)||!!validateRule(rule,r))||new Set(r.rules.map(rule=>rule.id)).size!==r.rules.length)return false;
  if(typeof p.businessDescription!=='string'||!p.tax||typeof p.tax.reportYear!=='string'||typeof p.tax.jurisdiction!=='string'||typeof p.tax.preparationNotes!=='string'||!(p.tax.updatedAt===null||(typeof p.tax.updatedAt==='string'&&Number.isFinite(Date.parse(p.tax.updatedAt)))))return false;
  if(p.tax.reportYear!==''&&(!/^\d{4}$/.test(p.tax.reportYear)||Number(p.tax.reportYear)<1900||Number(p.tax.reportYear)>2100))return false;
  return typeof p.displayName==='string'&&typeof p.businessName==='string'&&['','Freelancer','Business owner','Creator','Athlete','Musician','Other'].includes(p.workType)&&p.currency==='USD'&&['mi','km'].includes(p.mileageUnit)&&Number.isInteger(p.onboardingStep)&&p.onboardingStep>=0&&p.onboardingStep<=2&&typeof p.onboardingComplete==='boolean'&&[p.startedAt,p.firstSwipeAt].every(x=>x===null||(Number.isFinite(x)&&x>0))&&!!p.deferred&&typeof p.deferred==='object'&&typeof r.sampleLoaded==='boolean';
}
export function migrateRecords(value: unknown): Records | null {
  if(validRecords(value))return value;
  if(!value||typeof value!=='object')return null;
  const legacy=value as {version?:number;profile?:Records['profile']};
  if(legacy.version!==2||!legacy.profile)return null;
  const migrated={...legacy,version:3,rules:[],profile:{...legacy.profile,businessDescription:'',tax:{reportYear:'',jurisdiction:'',preparationNotes:'',updatedAt:null}}};
  return validRecords(migrated)?migrated:null;
}
export async function loadRecords():Promise<{records:Records;recovered:boolean}> {
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{
    const txn=db.transaction('records','readonly');const req=txn.objectStore('records').get('main');
    req.onsuccess=()=>{const value=req.result,migrated=migrateRecords(value);resolve({records:migrated?{...normalizeBusinessCases(migrated),undo:migrated.undo.filter(u=>u?.transaction&&migrated.transactions.some(t=>t.id===u.transaction.id)).slice(-20),skipped:migrated.skipped.filter(id=>migrated.transactions.some(t=>t.id===id))}:emptyRecords(),recovered:value!==undefined&&!migrated});};
    req.onerror=()=>reject(req.error);txn.oncomplete=()=>db.close();txn.onerror=()=>db.close();
  });
}
export async function saveRecords(records:Records, options:{putReceipt?:Receipt;putStatement?:Receipt;deleteReceipts?:string[];clearReceipts?:boolean}={}):Promise<void>{
  if(!validRecords(records))throw new Error('These records could not be validated. No changes were saved.');
  if(options.putReceipt&&!records.transactions.some(t=>t.id===options.putReceipt?.transactionId&&t.receiptId===options.putReceipt.id)&&!(options.putReceipt.transactionId===''&&records.receiptVault?.some(f=>f.id===options.putReceipt?.id)))throw new Error('This receipt is no longer linked to a transaction. No changes were saved.');
  if(options.putStatement&&!records.statements?.some(s=>s.fileId===options.putStatement?.id))throw new Error('Statement association missing.');
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{const txn=db.transaction(['records','receipts'],'readwrite');txn.objectStore('records').put(records,'main');const files=txn.objectStore('receipts');if(options.clearReceipts)files.clear();for(const id of options.deleteReceipts??[])files.delete(id);if(options.putReceipt)files.put(options.putReceipt);if(options.putStatement)files.put(options.putStatement);const linked=new Set([...records.transactions,...records.trash??[]].map(t=>t.receiptId).filter(Boolean));for(const s of records.statements??[])linked.add(s.fileId);for(const f of records.receiptVault??[])linked.add(f.id);const cursor=files.openKeyCursor();cursor.onsuccess=()=>{const row=cursor.result;if(!row)return;if(!linked.has(String(row.primaryKey)))files.delete(row.primaryKey);row.continue();};txn.oncomplete=()=>{db.close();resolve();};txn.onabort=()=>{db.close();reject(txn.error??new Error('Local storage failed. Check available browser storage.'));};txn.onerror=()=>{};});
}
export async function getReceipt(id:string):Promise<Receipt|undefined>{const db=await openDatabase();return new Promise((resolve,reject)=>{const txn=db.transaction('receipts','readonly'),req=txn.objectStore('receipts').get(id);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);txn.oncomplete=()=>db.close();});}
export async function allReceipts():Promise<Receipt[]>{const db=await openDatabase();return new Promise((resolve,reject)=>{const txn=db.transaction('receipts','readonly'),req=txn.objectStore('receipts').getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);txn.oncomplete=()=>db.close();});}
