import { allocation } from './finance';
import type { Records } from './models';
export function documentation(records:Records){
  const business=records.transactions.filter(t=>allocation(t).business>0);
  const missingReceipts=business.filter(t=>!t.receiptId).length;
  const missingNotes=business.filter(t=>!t.notes.trim()).length;
  const possible=business.length;
  const completed=possible-missingReceipts;
  return {business:business.length,missingReceipts,missingNotes,completed,possible,score:possible?Math.round(completed/possible*100):null};
}
export const filingSnapshot=(r:Records)=>JSON.stringify({transactions:r.transactions,statements:r.statements??[]});
