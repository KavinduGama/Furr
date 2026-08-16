import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { RoutineTask, subscribeToRoutines, addRoutine as firebaseAddRoutine, toggleRoutineCompletion as firebaseToggleRoutine, deleteRoutine as firebaseDeleteRoutine } from '@furr/firebase';
import { useAuth } from './auth';

export type { RoutineTask };

interface RoutineContextType {
  tasks: RoutineTask[];
  addTask: (task: Omit<RoutineTask, 'id' | 'isCompleted' | 'createdAt' | 'ownerUid'>) => Promise<void>;
  toggleTask: (id: string, isCompleted: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const RoutineContext = createContext<RoutineContextType | null>(null);

export function RoutineProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser } = useAuth();
  const [tasks, setTasks] = useState<RoutineTask[]>([]);

  useEffect(() => {
    if (!firebaseUser) {
      setTasks([]);
      return;
    }
    
    // Subscribe to Firestore collection
    const unsubscribe = subscribeToRoutines(firebaseUser.uid, (newTasks) => {
      setTasks(newTasks);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  const addTask = useCallback(async (task: Omit<RoutineTask, 'id' | 'isCompleted' | 'createdAt' | 'ownerUid'>) => {
    if (!firebaseUser) return;
    await firebaseAddRoutine({
      ...task,
      ownerUid: firebaseUser.uid,
      isCompleted: false,
    });
  }, [firebaseUser]);

  const toggleTask = useCallback(async (id: string, isCompleted: boolean) => {
    await firebaseToggleRoutine(id, isCompleted);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await firebaseDeleteRoutine(id);
  }, []);

  const value = useMemo(() => ({
    tasks,
    addTask,
    toggleTask,
    deleteTask
  }), [tasks, addTask, toggleTask, deleteTask]);

  return <RoutineContext.Provider value={value}>{children}</RoutineContext.Provider>;
}

export function useRoutines() {
  const context = useContext(RoutineContext);
  if (!context) throw new Error('useRoutines must be used within a RoutineProvider');
  return context;
}
