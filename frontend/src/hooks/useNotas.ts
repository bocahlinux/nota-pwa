import { useState, useEffect, useCallback } from 'react';
import type { Nota, NotaStats, PaginatedResponse } from '../services/api';
import { notaAPI } from '../services/api';

export function useNotas(page = 1, search = '', ordering = '-updated_at', tag = '') {
  const [data, setData] = useState<PaginatedResponse<Nota> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notaAPI.list(page, search, ordering, tag);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal memuat nota');
    } finally {
      setLoading(false);
    }
  }, [page, search, ordering, tag]);

  useEffect(() => {
    fetchNotas();
  }, [fetchNotas]);

  return { data, loading, error, refetch: fetchNotas };
}

export function useNotaStats() {
  const [stats, setStats] = useState<NotaStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await notaAPI.stats();
      setStats(res.data);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

export function useNotaActions(refetch: () => void) {
  const [saving, setSaving] = useState(false);

  const createNota = async (data: Partial<Nota>) => {
    setSaving(true);
    try {
      await notaAPI.create(data);
      refetch();
      return true;
    } finally {
      setSaving(false);
    }
  };

  const updateNota = async (id: number, data: Partial<Nota>) => {
    setSaving(true);
    try {
      await notaAPI.patch(id, data);
      refetch();
      return true;
    } finally {
      setSaving(false);
    }
  };

  const deleteNota = async (id: number) => {
    if (!window.confirm('Hapus nota ini?')) return false;
    await notaAPI.delete(id);
    refetch();
    return true;
  };

  const togglePin = async (id: number) => {
    await notaAPI.togglePin(id);
    refetch();
  };

  const archiveNota = async (id: number) => {
    await notaAPI.archive(id);
    refetch();
  };

  return { saving, createNota, updateNota, deleteNota, togglePin, archiveNota };
}
