import { newId, type Records, type Transaction } from './models';
export const defaultCategories = [
  ['software', 'Software & subscriptions'], ['office', 'Office & coworking'], ['equipment', 'Equipment & supplies'],
  ['travel', 'Travel'], ['meals', 'Meals'], ['contractors', 'Contractors'], ['studio', 'Instruments & studio'],
  ['sport', 'Sport equipment'], ['groceries', 'Groceries'], ['entertainment', 'Entertainment'], ['other', 'Other expense'],
].map(([id, name]) => ({ id, name }));
export function emptyRecords(): Records {
  return { version: 3, accounts: [], transactions: [], categories: defaultCategories, businessCases: [], rules: [], mileage: [], undo: [], skipped: [], sampleLoaded: false,
    profile: { displayName: '', businessName: '', businessDescription: '', tax: { reportYear: '', jurisdiction: '', preparationNotes: '', updatedAt: null }, workType: '', currency: 'USD', mileageUnit: 'mi', onboardingStep: 0, onboardingComplete: false, startedAt: null, firstSwipeAt: null, deferred: {} } };
}
const tx = (id: string, date: string, description: string, amountCents: number, type: Transaction['type'], categoryId = 'other', classification: Transaction['classification'] = null, businessPercent = classification === 'business' ? 100 : 0, accountId = 'sample-checking'): Transaction => ({ id, date, description, amountCents, type, categoryId, classification, businessPercent, accountId, currency: 'USD', reviewStatus: type === 'expense' && classification === null ? 'unreviewed' : 'reviewed', notes: '', receiptId: null });
export const TEST_CARD_ID = 'sample-credit-card';
export const TEST_CARD_NAME = 'Test credit card · 9186';

export function withTestCard(records: Records): Records {
  if (records.accounts.some(account => account.id === TEST_CARD_ID)) return records;
  const charge = (id: string, date: string, description: string, cents: number, category: string,
    classification: Transaction['classification'] = null, percent = 0) =>
    tx(id, date, description, cents, 'expense', category, classification, percent, TEST_CARD_ID);
  return {
    ...records,
    accounts: [...records.accounts, { id: TEST_CARD_ID, name: TEST_CARD_NAME, kind: 'sample', createdAt: '2026-10-01' }],
    transactions: [...records.transactions,
      charge('card-figma', '2026-10-07', 'Figma · Card subscription', 1500, 'software'),
      charge('card-staples', '2026-10-06', 'Staples · Studio supplies', 6875, 'equipment'),
      charge('card-groceries', '2026-10-05', 'Trader Joe’s · Card purchase', 9230, 'groceries'),
      charge('card-amtrak', '2026-10-04', 'Amtrak · Client meeting', 7200, 'travel'),
      charge('card-phone', '2026-10-03', 'Verizon · Shared phone plan', 8000, 'office', 'mixed', 60),
      charge('card-tickets', '2026-10-02', 'Ticketmaster · Concert', 9600, 'entertainment', 'personal'),
    ],
  };
}

export function withSample(records: Records): Records {
  if (records.sampleLoaded) return records;
  const sample: Transaction[] = [
    tx('demo-adobe','2026-10-06','Adobe Creative Cloud',5999,'expense','software'),
    tx('demo-groceries','2026-10-05','Whole Foods Market',8436,'expense','groceries'),
    tx('demo-apple','2026-10-03','Apple · Keyboard',12900,'expense','equipment'),
    tx('demo-netflix','2026-10-02','Netflix',1549,'expense','entertainment'),
    tx('demo-wework','2026-10-04','WeWork',22500,'expense','office','business'),
    tx('demo-oct-client','2026-10-01','Studio North · Project payment',240000,'income'),
    tx('demo-oct-transfer','2026-10-01','Transfer to savings',60000,'transfer'),
    tx('demo-sep-client','2026-09-26','Brightside · Design retainer',320000,'income'),
    tx('demo-sep-project','2026-09-14','Juniper Co. · Project payment',180000,'income','other',null,0,'sample-business'),
    tx('demo-sep-figma','2026-09-08','Figma',1500,'expense','software','business'),
    tx('demo-sep-internet','2026-09-12','Internet service',9000,'expense','office','mixed',60),
    tx('demo-sep-contractor','2026-09-19','Jamie Chen · Editing',65000,'expense','contractors','business',100,'sample-business'),
    tx('demo-sep-coffee','2026-09-22','Blue Bottle Coffee',1850,'expense','meals','personal'),
    tx('demo-sep-groceries','2026-09-24','Trader Joe’s',9230,'expense','groceries','personal'),
    tx('demo-aug-client','2026-08-22','Juniper Co. · Project payment',285000,'income','other',null,0,'sample-business'),
    tx('demo-aug-office','2026-08-04','WeWork',22500,'expense','office','business'),
    tx('demo-aug-equipment','2026-08-10','B&H Photo · Microphone',18900,'expense','equipment','mixed',80),
    tx('demo-aug-grocery','2026-08-20','Whole Foods Market',7634,'expense','groceries','personal'),
    tx('demo-aug-adobe','2026-08-06','Adobe Creative Cloud',5999,'expense','software','business'),
    tx('demo-jul-client','2026-07-24','Brightside · Design retainer',260000,'income'),
    tx('demo-jul-travel','2026-07-18','Amtrak · Client visit',9600,'expense','travel','business'),
    tx('demo-jul-transfer','2026-07-20','Transfer between accounts',45000,'transfer','other',null,0,'sample-business'),
    tx('demo-jul-entertainment','2026-07-27','Cinema tickets',3400,'expense','entertainment','personal'),
  ];
  return { ...records, sampleLoaded: true,
    accounts: [...records.accounts, { id:'sample-checking',name:'Sample checking · 4242',kind:'sample',createdAt:'2026-07-01' },{ id:'sample-business',name:'Sample business · 8018',kind:'sample',createdAt:'2026-07-01' }],
    transactions: [...records.transactions, ...sample], mileage: [...records.mileage,
      { id:'trip-sep',date:'2026-09-18',start:'Home studio',destination:'Brightside office',purpose:'Client planning meeting',distance:18.6,unit:'mi',classification:'business',notes:'Round trip' },
      { id:'trip-oct',date:'2026-10-02',start:'Home studio',destination:'Equipment supplier',purpose:'Pick up work equipment',distance:12.4,unit:'mi',classification:'business',notes:'' },
      { id:'trip-personal',date:'2026-09-21',start:'Home',destination:'Park',purpose:'Weekend outing',distance:8,unit:'mi',classification:'personal',notes:'' },
    ] };
}


export const SWIPE_DEMO_ACCOUNT_ID = 'sample-swipe-demo';
export const SWIPE_DEMO_ACCOUNT_NAME = 'Demo card expenses';

const swipeDemoExamples: [string, number, string][] = [
    ['Notion workspace', 1200, 'software'],
    ['Neighborhood groceries', 6475, 'groceries'],
    ['Office supply store', 3850, 'equipment'],
    ['Streaming subscription', 1599, 'entertainment'],
    ['Train ticket', 4800, 'travel'],
    ['Coworking day pass', 3500, 'office'],
    ['Coffee shop', 875, 'meals'],
    ['Cloud storage', 999, 'software'],
    ['Wireless headphones', 12900, 'equipment'],
    ['Weekend cinema', 2400, 'entertainment'],
    ['Mobile phone bill', 8000, 'office'],
    ['Editing services', 18500, 'contractors'],
    ['Restaurant lunch', 3275, 'meals'],
    ['Rideshare trip', 2260, 'travel'],
    ['Fitness equipment', 6500, 'sport'],
    ['Design software', 2999, 'software'],
    ['Music studio rental', 9500, 'studio'],
    ['Printer ink', 4250, 'equipment'],
    ['Home internet', 7500, 'office'],
    ['Bookshop purchase', 2800, 'other'],
  ];

// A single fictional practice session. Existing decisions and trashed cards are preserved.
export function withSwipeDemo(records: Records): Records {
  if (records.accounts.some(account => account.id === SWIPE_DEMO_ACCOUNT_ID)) return records;
  const knownIds = new Set([...records.transactions, ...records.trash??[]].map(t => t.id));
  return {
    ...records,
    accounts: [...records.accounts, { id: SWIPE_DEMO_ACCOUNT_ID, name: SWIPE_DEMO_ACCOUNT_NAME, kind: 'sample', createdAt: '2026-10-01' }],
    transactions: [...records.transactions, ...swipeDemoExamples.map(([description, cents, category], index) =>
      tx(`swipe-demo-${index+1}`, `2026-10-${String(20-index).padStart(2,'0')}`, description, cents, 'expense', category, null, 0, SWIPE_DEMO_ACCOUNT_ID)
    ).filter(transaction => !knownIds.has(transaction.id))],
  };
}


// Continue pending practice cards, or start a fresh session after completion.
export function reviewSwipeDemo(records: Records): Records {
  if (!records.accounts.some(a => a.id === SWIPE_DEMO_ACCOUNT_ID)) return withSwipeDemo(records);
  const demo = records.transactions.filter(t => t.accountId === SWIPE_DEMO_ACCOUNT_ID);
  const ids = new Set(demo.map(t => t.id));
  const pending = demo.some(t => t.type === 'expense' && t.reviewStatus === 'unreviewed');
  if (pending) return { ...records, skipped: records.skipped.filter(id => !ids.has(id)) };
  const descriptions = new Set(demo.map(t => t.description));
  const refill = swipeDemoExamples.filter(([description]) => !descriptions.has(description))
    .slice(0, Math.max(0, 20-demo.length)).map(([description,cents,category],index) =>
      tx(`swipe-demo-${newId()}`, `2026-10-${String(20-index).padStart(2,'0')}`, description, cents, 'expense', category, null, 0, SWIPE_DEMO_ACCOUNT_ID));
  return { ...records,
    transactions: [...records.transactions.map(t => ids.has(t.id)
      ? { ...t, type: 'expense' as const, classification: null, businessPercent: 0, reviewStatus: 'unreviewed' as const, ruleId: undefined } : t), ...refill],
    skipped: records.skipped.filter(id => !ids.has(id)), undo: records.undo.filter(entry => !ids.has(entry.transaction.id)),
  };
}
