import { useState } from 'react';
import { notaAPI } from '../services/api';

interface Props {
  onClose: () => void;
  onImported: () => void;
}

export default function ImportExportModal({ onClose, onImported }: Props) {
  const [tab, setTab] = useState<'export' | 'import'>('export');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; total: number } | null>(null);
  const [error, setError] = useState('');

  const handleExport = () => {
    // Call export API via window.open to trigger download
    window.open('/api/notas/export/', '_blank');
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const notas = data.notas || data; // Support both {notas: [...]} and direct array

        if (!Array.isArray(notas)) {
          setError('Format file tidak valid. Harus berisi array nota.');
          return;
        }

        setImporting(true);
        setError('');
        const res = await notaAPI.importNotes({ notas });
        setImportResult({ imported: res.data.imported, total: res.data.total });
        onImported();
      } catch (err: any) {
        setError(err.message || 'Gagal import file.');
      } finally {
        setImporting(false);
      }
    };
    input.click();
  };

  return (
    <div className="nota-form-overlay" onClick={onClose}>
      <div className="nota-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>Export / Import</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="filter-tabs" style={{ marginBottom: '20px' }}>
          <button
            className={`filter-tab ${tab === 'export' ? 'active' : ''}`}
            onClick={() => setTab('export')}
          >
            📤 Export
          </button>
          <button
            className={`filter-tab ${tab === 'import' ? 'active' : ''}`}
            onClick={() => setTab('import')}
          >
            📥 Import
          </button>
        </div>

        {tab === 'export' && (
          <div className="import-export-content">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Download semua catatanmu sebagai file JSON. File ini bisa di-import kembali kapan saja.
            </p>
            <button className="btn btn-primary" onClick={handleExport}>
              📤 Download JSON
            </button>
          </div>
        )}

        {tab === 'import' && (
          <div className="import-export-content">
            {error && <div className="error-msg">{error}</div>}
            {importResult && (
              <div className="import-success">
                ✅ Berhasil import {importResult.imported} dari {importResult.total} catatan.
              </div>
            )}
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Pilih file JSON untuk import catatan. Format file harus berisi array dengan field title, content, status, tags, dll.
            </p>
            <button
              className="btn btn-primary"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? 'Mengimport...' : '📥 Pilih File JSON'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
