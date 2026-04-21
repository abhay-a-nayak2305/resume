import { useState, useEffect, useCallback } from 'react';

interface SavedResume {
  id: string;
  timestamp: number;
  fileName: string;
  score: number;
  text: string;
}

export function useResumeHistory() {
  const [history, setHistory] = useState<SavedResume[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('resume-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load resume history');
      }
    }
  }, []);

  const saveToHistory = useCallback((resume: Omit<SavedResume, 'id' | 'timestamp'>) => {
    const newEntry: SavedResume = {
      ...resume,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    setHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, 10); // Keep last 10
      localStorage.setItem('resume-history', JSON.stringify(updated));
      return updated;
    });

    return newEntry.id;
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('resume-history');
  }, []);

  return { history, saveToHistory, clearHistory };
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
