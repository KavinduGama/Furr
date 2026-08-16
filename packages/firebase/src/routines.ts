export type RoutineTask = {
  id: string;
  petId: string;
  ownerUid: string;
  title: string;
  time: string;
  isCompleted: boolean;
  createdAt: string;
};

export function subscribeToRoutines(ownerUid: string, onUpdate: (tasks: RoutineTask[]) => void) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(collection(db, 'routines'), where('ownerUid', '==', ownerUid));
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks: RoutineTask[] = [];
        snapshot.forEach((docSnap) => {
          tasks.push(docSnap.data() as RoutineTask);
        });
        tasks.sort((a, b) => a.time.localeCompare(b.time));
        onUpdate(tasks);
      }, (error) => {
        console.error('Error subscribing to routines:', error);
        onUpdate([]);
      });

      if (!active && unsubscribe) {
        unsubscribe();
      }
    } catch (e) {
      console.warn('Failed to subscribe to routines:', e);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export async function addRoutine(task: Omit<RoutineTask, 'id' | 'createdAt'>) {
  const { getFirestore, collection, doc, setDoc } = await import('firebase/firestore');
  const db = getFirestore();
  const newRef = doc(collection(db, 'routines'));
  const newTask: RoutineTask = {
    ...task,
    id: newRef.id,
    createdAt: new Date().toISOString(),
  };
  await setDoc(newRef, newTask);
  return newTask;
}

export async function toggleRoutineCompletion(taskId: string, isCompleted: boolean) {
  const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
  const db = getFirestore();
  const ref = doc(db, 'routines', taskId);
  await updateDoc(ref, { isCompleted });
}

export async function deleteRoutine(taskId: string) {
  const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
  const db = getFirestore();
  const ref = doc(db, 'routines', taskId);
  await deleteDoc(ref);
}
