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

export function subscribeToExpenses(ownerUid: string, onUpdate: (expenses: Expense[]) => void) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(
        collection(db, 'expenses'), 
        where('ownerUid', '==', ownerUid)
      );
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        const expenses: Expense[] = [];
        snapshot.forEach((docSnap) => {
          expenses.push(docSnap.data() as Expense);
        });
        expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        onUpdate(expenses);
      }, (error) => {
        console.error('Error subscribing to expenses:', error);
        onUpdate([]);
      });

      if (!active && unsubscribe) {
        unsubscribe();
      }
    } catch (e) {
      console.warn('Failed to subscribe to expenses:', e);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export async function addExpense(expense: Omit<Expense, 'id' | 'createdAt'>) {
  const { getFirestore, collection, doc, setDoc } = await import('firebase/firestore');
  const db = getFirestore();
  const newRef = doc(collection(db, 'expenses'));
  const newExpense: Expense = {
    ...expense,
    id: newRef.id,
    createdAt: new Date().toISOString(),
  };
  await setDoc(newRef, newExpense);
  return newExpense;
}

export async function deleteExpense(expenseId: string) {
  const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
  const db = getFirestore();
  const ref = doc(db, 'expenses', expenseId);
  await deleteDoc(ref);
}
