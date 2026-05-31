import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotas, useNotaStats, useNotaActions } from '../hooks/useNotas';
import Navbar from '../components/Navbar';
import StatsBar from '../components/StatsBar';
import NotaList from '../components/NotaList';
import NotaForm from '../components/NotaForm';
import ImportExportModal from '../components/ImportExportModal';

export default function HomePage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [editingNota, setEditingNota] = useState<any>(null);
  const [filter, setFilter] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');

  const { data, loading, refetch } = useNotas(page, search, '-updated_at', selectedTag);
  const { stats } = useNotaStats();
  const { togglePin, archiveNota, deleteNota, createNota, updateNota } = useNotaActions(refetch);

  let notas = data?.results || [];
  if (filter !== 'all') {
    notas = notas.filter((n: any) => n.status === filter);
  }

  const handleSave = async (formData: any) => {
    try {
      if (editingNota) {
        await updateNota(editingNota.id, formData);
        showToast('Nota berhasil diperbarui', 'success');
      } else {
        await createNota(formData);
        showToast('Nota baru berhasil dibuat', 'success');
      }
      setShowForm(false);
      setEditingNota(null);
    } catch {
      showToast('Gagal menyimpan nota', 'error');
    }
  };

  const handleEdit = (nota: any) => {
    setEditingNota(nota);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNota(id);
      showToast('Nota berhasil dihapus', 'success');
    } catch {
      showToast('Gagal menghapus nota', 'error');
    }
  };

  const handleTogglePin = async (id: number) => {
    try {
      await togglePin(id);
      showToast('Pin diperbarui', 'info');
    } catch {
      showToast('Gagal mengubah pin', 'error');
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await archiveNota(id);
      showToast('Nota diarsipkan', 'info');
    } catch {
      showToast('Gagal mengarsipkan', 'error');
    }
  };

  return (
    <div className="home-page">
      <Navbar
        title="📝 Nota"
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setShowImportExport(true)} title="Export/Import">
              📦
            </button>
            <button className="btn btn-ghost" onClick={() => logout()}>
              Logout ({user?.username})
            </button>
          </>
        }
      />

      <StatsBar stats={stats} />

      <div className="toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Cari catatan..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="filter-tabs">
          {['all', 'published', 'draft', 'archived'].map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => { setFilter(f); setPage(1); }}
            >
              {f === 'all' ? 'Semua' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {selectedTag && (
          <div className="active-tag-filter">
            <span>Tag: <strong>{selectedTag}</strong></span>
            <button className="btn-ghost" onClick={() => { setSelectedTag(''); setPage(1); }}>✕</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">Memuat...</div>
      ) : (
        <NotaList
          notas={notas}
          onSelect={handleEdit}
          onTogglePin={handleTogglePin}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      )}

      {data && data.count > 20 && (
        <div className="pagination">
          <button disabled={!data.previous} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </button>
          <span>Halaman {page}</span>
          <button disabled={!data.next} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}

      <button
        className="fab"
        onClick={() => { setEditingNota(null); setShowForm(true); }}
        title="Buat Nota Baru"
      >
        +
      </button>

      {showForm && (
        <NotaForm
          nota={editingNota}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingNota(null); }}
          onAttachmentsChange={refetch}
        />
      )}

      {showImportExport && (
        <ImportExportModal
          onClose={() => setShowImportExport(false)}
          onImported={() => { refetch(); showToast('Import berhasil!', 'success'); }}
        />
      )}
    </div>
  );
}
