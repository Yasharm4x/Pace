import { useState, useEffect, useCallback } from 'react';
import {
  FitnessData,
  UserProfile,
  DailyEntry,
  getTodayISO,
} from '@/lib/fitness-utils';

const STORAGE_KEY = 'fitness-tracker-data';

const defaultData: FitnessData = {
  profile: null,
  entries: [],
  lastSaved: null,
};

export function useFitnessData() {
  const [data, setData] = useState<FitnessData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Load failed', err);
    }
    setIsLoaded(true);
  }, []);

  // Save helper
  const saveData = useCallback((newData: FitnessData) => {
    const withTimestamp = {
      ...newData,
      lastSaved: Date.now(),
    };
    setData(withTimestamp);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withTimestamp));
  }, []);

  // Profile
  const updateProfile = useCallback(
    (profile: UserProfile) => {
      saveData({ ...data, profile });
    },
    [data, saveData]
  );

  // 🔑 RESET PROFILE (THIS WAS MISSING)
  const resetProfile = useCallback(() => {
    setData(defaultData);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Entries
  const getTodayEntry = useCallback(() => {
    const today = getTodayISO();
    return data.entries.find(e => e.date === today);
  }, [data.entries]);

  const updateTodayEntry = useCallback(
    (updates: Partial<DailyEntry>) => {
      const today = getTodayISO();
      const idx = data.entries.findIndex(e => e.date === today);

      const entries =
        idx >= 0
          ? data.entries.map((e, i) =>
              i === idx ? { ...e, ...updates, timestamp: Date.now() } : e
            )
          : [...data.entries, { date: today, ...updates, timestamp: Date.now() }];

      saveData({ ...data, entries });
    },
    [data, saveData]
  );

  const getLatestWeight = useCallback(() => {
    return (
      data.entries
        .filter(e => e.weight !== undefined)
        .sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0]?.weight ?? null
    );
  }, [data.entries]);

  return {
    isLoaded,
    profile: data.profile,
    entries: data.entries,
    lastSaved: data.lastSaved,

    updateProfile,
    resetProfile, // ✅ EXPOSE IT

    getTodayEntry,
    updateTodayEntry,
    getLatestWeight,

    exportData: () => JSON.stringify(data, null, 2),
    exportCSV: () => '',
    importData: () => false,
    clearData: resetProfile, // keep backward compatibility
  };
}
