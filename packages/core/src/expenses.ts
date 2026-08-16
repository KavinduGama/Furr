// ─────────────────────────────────────────────────────────────
//  @furr/core — Expense Tracking domain types
// ─────────────────────────────────────────────────────────────

export type ExpenseCategory = 'Vet' | 'Food' | 'Grooming' | 'Toys' | 'Other';

export type Expense = {
  id: string;
  petId: string;
  ownerUid: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
  receiptImageUri?: string;
  createdAt: string;
};
