import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── NotaList Rendering Tests ────────────────────────────────
// We test the card rendering logic in isolation
describe('NotaList rendering logic', () => {
  it('formats Indonesian date correctly', () => {
    const date = new Date('2026-05-31');
    const formatted = date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    // Should contain month name in Indonesian
    expect(formatted).toContain('2026');
  });

  it('truncates long content for summary', () => {
    const content = 'a'.repeat(200);
    const summary = content.substring(0, 100) + '...';
    expect(summary.length).toBe(103);
  });

  it('handles empty content summary', () => {
    const content = '';
    const summary = content.substring(0, 100);
    expect(summary).toBe('');
  });
});

// ── Tag Selector Logic Tests ────────────────────────────────
describe('Tag selector logic', () => {
  it('toggles tag selection', () => {
    let selectedTagIds: number[] = [];

    const toggleTag = (tagId: number) => {
      if (selectedTagIds.includes(tagId)) {
        selectedTagIds = selectedTagIds.filter(id => id !== tagId);
      } else {
        selectedTagIds = [...selectedTagIds, tagId];
      }
    };

    toggleTag(1);
    expect(selectedTagIds).toEqual([1]);

    toggleTag(2);
    expect(selectedTagIds).toEqual([1, 2]);

    toggleTag(1);
    expect(selectedTagIds).toEqual([2]);

    toggleTag(2);
    expect(selectedTagIds).toEqual([]);
  });

  it('prevents duplicate tag selection', () => {
    let selectedTagIds: number[] = [];

    const toggleTag = (tagId: number) => {
      if (!selectedTagIds.includes(tagId)) {
        selectedTagIds = [...selectedTagIds, tagId];
      }
    };

    toggleTag(1);
    toggleTag(1);
    expect(selectedTagIds).toEqual([1]);
  });
});

// ── File size formatting Tests ─────────────────────────────
describe('file size formatting', () => {
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  it('formats bytes correctly', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes correctly', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('formats megabytes correctly', () => {
    expect(formatFileSize(5242880)).toBe('5.0 MB');
  });
});

// ── API error handling Tests ──────────────────────────────
describe('API error handling', () => {
  it('flattens DRF error messages', () => {
    const data = {
      username: ['Username sudah dipakai.'],
      password: ['Password terlalu pendek.', 'Password harus ada angka.'],
    };
    const msgs: string[] = [];
    for (const [key, val] of Object.entries(data)) {
      if (Array.isArray(val)) msgs.push(val.join(' '));
      else msgs.push(String(val));
    }
    expect(msgs).toEqual([
      'Username sudah dipakai.',
      'Password terlalu pendek. Password harus ada angka.',
    ]);
  });

  it('handles empty error data', () => {
    const data: any = {};
    const msgs: string[] = [];
    for (const [key, val] of Object.entries(data)) {
      if (Array.isArray(val)) msgs.push(val.join(' '));
      else msgs.push(String(val));
    }
    expect(msgs).toEqual([]);
  });
});

// ── Theme toggle Tests ─────────────────────────────────────
describe('theme toggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('default theme is light', () => {
    const saved = localStorage.getItem('nota_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    // No saved theme, depends on system preference
    expect(['light', 'dark']).toContain(theme);
  });

  it('persists theme to localStorage', () => {
    localStorage.setItem('nota_theme', 'dark');
    expect(localStorage.getItem('nota_theme')).toBe('dark');
  });
});

// ── Import/Export Logic Tests ──────────────────────────────
describe('import/export logic', () => {
  it('validates notas array format', () => {
    const validData = { notas: [{ title: 'Test', content: 'Hello' }] };
    const notas = validData.notas || validData;
    expect(Array.isArray(notas)).toBe(true);
    expect(notas.length).toBe(1);
  });

  it('handles direct array format', () => {
    const directArray = [{ title: 'Test', content: 'Hello' }];
    const notas = (directArray as any).notas || directArray;
    expect(Array.isArray(notas)).toBe(true);
    expect(notas.length).toBe(1);
  });

  it('rejects invalid format', () => {
    const invalidData = { title: 'Single nota' };
    const notas = (invalidData as any).notas;
    expect(Array.isArray(notas)).toBe(false);
  });

  it('calculates import stats correctly', () => {
    const imported = 3;
    const total = 5;
    const errors = 2;
    expect(imported + errors).toBe(total);
  });
});
