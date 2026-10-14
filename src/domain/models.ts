export type WorkType = 'Freelancer' | 'Business owner' | 'Creator' | 'Athlete' | 'Musician' | 'Other';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type Classification = 'business' | 'personal' | 'mixed';
export type Unit = 'mi' | 'km';
export interface Account { id: string; name: string; kind: 'sample' | 'manual'; createdAt: string }
export interface Category { id: string; name: string }
export interface BusinessCase { id: string; name: string; workType: WorkType; categoryIds: string[] }
export interface MerchantRule {
  id: string; merchant: string; match: 'exact' | 'contains'; enabled: boolean;
  classification: Classification; businessPercent: number; categoryId: string; createdAt: string;
}
export interface TaxProfileDraft {
  reportYear: string; jurisdiction: string; preparationNotes: string; updatedAt: string | null;
}
export interface Transaction {
  id: string; accountId: string; date: string; description: string; amountCents: number;
  currency: 'USD'; type: TransactionType; reviewStatus: 'unreviewed' | 'reviewed';
  classification: Classification | null; businessPercent: number; categoryId: string; businessCaseId?: string | null;
  notes: string; receiptId: string | null; importSource?: string; ruleId?: string | null;
}
export interface Receipt { id: string; transactionId: string; name: string; type: string; size: number; blob: Blob }
export interface Mileage {
  id: string; date: string; start: string; destination: string; purpose: string;
  distance: number; unit: Unit; classification: 'business' | 'personal'; notes: string;
}
export interface LocalProfile {
  displayName: string; businessName: string; workType: WorkType | ''; currency: 'USD'; mileageUnit: Unit;
  email?: string; phone?: string; businessWebsite?: string; businessLocation?: string; photoDataUrl?: string;
  onboardingStep: number; onboardingComplete: boolean; startedAt: number | null; firstSwipeAt: number | null;
  deferred: { reportIdentityDismissed?: boolean };
  businessDescription: string; tax: TaxProfileDraft; accessChoice?: "trial" | "pro-preview"; filing?: { swipesConfirmed?: boolean; statementsConfirmed?: boolean; areas?: boolean[]; reviewedSnapshot?: string };
}
export interface UndoEntry { transaction: Transaction; skippedBefore: string[]; kind: 'classification' | 'skip' }
export interface Statement {
  id: string; accountId: string; from: string; to: string; fileId: string; name: string; status: "uploaded" | "reviewed"; transactionIds: string[]; reviewRows?: number; fingerprint?: string; rowKeys?: string[];
}
export interface VaultReceipt { id: string; name: string; type: string; size: number; createdAt: string }
export interface Records {
  version: 3; accounts: Account[]; transactions: Transaction[]; categories: Category[]; rules: MerchantRule[];
  statements?: Statement[]; trash?: Transaction[]; receiptVault?: VaultReceipt[]; businessCases?: BusinessCase[];
  mileage: Mileage[]; profile: LocalProfile; undo: UndoEntry[]; skipped: string[]; sampleLoaded: boolean;
}
export interface RecordFilter { from: string; to: string; accountId: string; businessCaseId?: string }
export const workTypes: WorkType[] = ['Freelancer', 'Business owner', 'Creator', 'Athlete', 'Musician', 'Other'];
export const today = () => new Date().toLocaleDateString('en-CA');
export const newId = () => crypto.randomUUID();
