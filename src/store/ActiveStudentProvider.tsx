import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useStudents } from './../hooks/queries';
import type { Student } from './../types/models';
import { mockStudents } from '../data/mockStudents';

const KEY = 'saferide.activeStudentId';

interface ActiveStudentValue {
  students: Student[];
  activeStudent: Student | null;
  setActiveStudentId: (id: string) => void;
  isLoading: boolean;
}

const Ctx = createContext<ActiveStudentValue | null>(null);

export function ActiveStudentProvider({
  children,
}: {
  children: ReactNode;
}) {
  // const { data: students = [], isLoading } = useStudents();
  const students = mockStudents;
  const isLoading = false;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [hasLoadedSavedId, setHasLoadedSavedId] = useState(false);

  // Restore the previously selected student.
  useEffect(() => {
    let mounted = true;

    const loadActiveStudent = async () => {
      try {
        const id = await AsyncStorage.getItem(KEY);

        if (mounted && id) {
          setActiveId(id);
        }
      } catch (error) {
        console.warn('Unable to load active student ID:', error);
      } finally {
        if (mounted) {
          setHasLoadedSavedId(true);
        }
      }
    };

    loadActiveStudent();

    return () => {
      mounted = false;
    };
  }, []);

  // Update the selected student and persist the selection.
  const setActiveStudentId = useCallback((id: string) => {
    setActiveId(id);

    AsyncStorage.setItem(KEY, id).catch((error) => {
      console.warn('Unable to save active student ID:', error);
    });
  }, []);

  const activeStudent = useMemo(() => {
    // Preserve the saved selection if that student is still available.
    const savedStudent = students.find((student) => student.id === activeId);

    if (savedStudent) {
      return savedStudent;
    }

    // Otherwise, select an active student, then the first student.
    return (
      students.find((student) => student.status === 'active') ??
      students[0] ??
      null
    );
  }, [students, activeId]);

  const value = useMemo(
    () => ({
      students,
      activeStudent,
      setActiveStudentId,
      isLoading: isLoading || !hasLoadedSavedId,
    }),
    [
      students,
      activeStudent,
      setActiveStudentId,
      isLoading,
      hasLoadedSavedId,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useActiveStudent() {
  const ctx = useContext(Ctx);

  if (!ctx) {
    throw new Error(
      'useActiveStudent must be used inside ActiveStudentProvider',
    );
  }

  return ctx;
}
