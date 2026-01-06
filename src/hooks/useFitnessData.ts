import { useState, useEffect, useCallback } from 'react';
import { FitnessData, UserProfile, DailyEntry, getTodayISO } from '@/lib/fitness-utils';

const STORAGE_KEY = 'fitness-tracker-data';

const defaultData: FitnessData = {
  profile: null,
  entries: [],
  lastSaved: null,
};

export function useFitnessData() {
  const [data, setData] = useState<FitnessData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FitnessData;
        setData(parsed);
      }
    } catch (error) {
      console.error('Failed to load fitness data:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save data to localStorage whenever it changes
  const saveData = useCallback((newData: FitnessData) => {
    const dataWithTimestamp = {
      ...newData,
      lastSaved: Date.now(),
    };
    setData(dataWithTimestamp);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
    } catch (error) {
      console.error('Failed to save fitness data:', error);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback((profile: UserProfile) => {
    saveData({ ...data, profile });
  }, [data, saveData]);

  // Get today's entry
  const getTodayEntry = useCallback((): DailyEntry | undefined => {
    const today = getTodayISO();
    return data.entries.find(e => e.date === today);
  }, [data.entries]);

  // Update today's entry
  const updateTodayEntry = useCallback((updates: Partial<DailyEntry>) => {
    const today = getTodayISO();
    const existingIndex = data.entries.findIndex(e => e.date === today);
    
    let newEntries: DailyEntry[];
    
    if (existingIndex >= 0) {
      newEntries = [...data.entries];
      newEntries[existingIndex] = {
        ...newEntries[existingIndex],
        ...updates,
        timestamp: Date.now(),
      };
    } else {
      newEntries = [
        ...data.entries,
        {
          date: today,
          ...updates,
          timestamp: Date.now(),
        },
      ];
    }
    
    saveData({ ...data, entries: newEntries });
  }, [data, saveData]);

  // Get entry for a specific date
  const getEntry = useCallback((date: string): DailyEntry | undefined => {
    return data.entries.find(e => e.date === date);
  }, [data.entries]);

  // Export data as JSON
  const exportData = useCallback((): string => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  // Export data as CSV
  const exportCSV = useCallback((): string => {
    const headers = ['date', 'weight', 'steps', 'caloriesBurned'];
    const rows = data.entries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(entry => [
        entry.date,
        entry.weight?.toString() || '',
        entry.steps?.toString() || '',
        entry.caloriesBurned?.toString() || '',
      ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }, [data.entries]);

  // Import data from JSON
  const importData = useCallback((jsonString: string): boolean => {
    try {
      const imported = JSON.parse(jsonString) as FitnessData;
      if (imported.entries && Array.isArray(imported.entries)) {
        saveData(imported);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }, [saveData]);

  // Clear all data
  const clearData = useCallback(() => {
    setData(defaultData);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Get latest weight
  const getLatestWeight = useCallback((): number | null => {
    const entriesWithWeight = data.entries
      .filter(e => e.weight !== undefined)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return entriesWithWeight[0]?.weight ?? null;
  }, [data.entries]);

  return {
    data,
    isLoaded,
    profile: data.profile,
    entries: data.entries,
    lastSaved: data.lastSaved,
    updateProfile,
    getTodayEntry,
    updateTodayEntry,
    getEntry,
    getLatestWeight,
    exportData,
    exportCSV,
    importData,
    clearData,
  };
}
