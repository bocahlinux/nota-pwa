import { useState, useEffect, useCallback } from 'react';
import { tagAPI } from '../services/api';
import type { Tag } from '../services/api';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tagAPI.list();
      setTags(res.data.results || []);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = async (name: string, color: string) => {
    const res = await tagAPI.create({ name, color });
    setTags(prev => [...prev, res.data]);
    return res.data;
  };

  const deleteTag = async (id: number) => {
    await tagAPI.delete(id);
    setTags(prev => prev.filter(t => t.id !== id));
  };

  return { tags, loading, refetch: fetchTags, createTag, deleteTag };
}
