import { describe, expect, it } from 'vitest';
import { documentation } from './documentation';
import { emptyRecords, withSample } from './sample';

describe('documentation score', () => {
  const oneBusinessExpense = () => {
    const records = withSample(emptyRecords());
    return { ...records, transactions: records.transactions.filter(t => t.id === 'demo-wework' || t.id === 'demo-groceries') };
  };

  it('does not score a workspace without reviewed business expenses', () => {
    expect(documentation(emptyRecords()).score).toBeNull();
    const records = oneBusinessExpense();
    records.transactions = records.transactions.filter(t => t.id === 'demo-groceries');
    expect(documentation(records).score).toBeNull();
  });

  it('scores receipt coverage only and tracks purpose notes separately', () => {
    const records = oneBusinessExpense();
    expect(documentation(records)).toMatchObject({ business: 1, score: 0, completed: 0, possible: 1 });
    const expense = records.transactions.find(t => t.id === 'demo-wework')!;
    expense.notes = 'Client work session';
    expect(documentation(records)).toMatchObject({ score: 0, missingNotes: 0, missingReceipts: 1 });
    expense.receiptId = 'receipt-1';
    expect(documentation(records)).toMatchObject({ score: 100, completed: 1, possible: 1 });
  });
});
