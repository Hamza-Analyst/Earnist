import type { Records } from './models';

export function moveToTrash(records: Records, id: string): Records {
  const transaction = records.transactions.find(t => t.id === id);
  if (!transaction) return records;
  return { ...records, transactions: records.transactions.filter(t => t.id !== id),
    trash: [...records.trash??[], transaction], skipped: records.skipped.filter(value => value !== id),
    undo: records.undo.filter(entry => entry.transaction.id !== id),
  };
}
