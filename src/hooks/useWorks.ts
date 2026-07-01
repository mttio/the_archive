import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { worksData } from '../data/works';
import type { WorkItem } from '../data/works';

export const useWorks = (options?: { includeDrafts?: boolean }) => {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const includeDrafts = options?.includeDrafts;

  const loadWorks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchWorks(includeDrafts);
      setWorks(data);
    } catch (err: any) {
      console.warn('Backend API unavailable. Falling back to local static mock data.', err);
      // Fallback to local static data
      setWorks(worksData);
      setError('Running in offline/fallback mode (backend API disconnected).');
    } finally {
      setLoading(false);
    }
  }, [includeDrafts]);

  useEffect(() => {
    loadWorks();
  }, [loadWorks]);

  return {
    works,
    loading,
    error,
    refetch: loadWorks,
  };
};
