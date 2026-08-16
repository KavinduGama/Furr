import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { Expense, ExpenseCategory, subscribeToExpenses, addExpense as firebaseAddExpense, deleteExpense as firebaseDeleteExpense } from '@furr/firebase';
import { useAuth } from './auth';

export type { Expense, ExpenseCategory };

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'ownerUid'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  totalExpenses: number;
}

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    if (!firebaseUser) {
      setExpenses([]);
      return;
    }
    
    // Subscribe to Firestore collection
    const unsubscribe = subscribeToExpenses(firebaseUser.uid, (newExpenses) => {
      setExpenses(newExpenses);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt' | 'ownerUid'>) => {
    if (!firebaseUser) return;
    await firebaseAddExpense({
      ...expense,
      ownerUid: firebaseUser.uid,
    });
  }, [firebaseUser]);

  const deleteExpense = useCallback(async (id: string) => {
    await firebaseDeleteExpense(id);
  }, []);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const value = useMemo(() => ({
    expenses,
    addExpense,
    deleteExpense,
    totalExpenses
  }), [expenses, addExpense, deleteExpense, totalExpenses]);

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error('useExpenses must be used within an ExpenseProvider');
  return context;
}
