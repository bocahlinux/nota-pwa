import type { Nota } from '../services/api';

interface Props {
  notas: Nota[];
  onSelect: (nota: Nota) => void;
  onTogglePin: (id: number) => void;
  onArchive: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function NotaList({ notas, onSelect, onTogglePin, onArchive, onDelete }: Props) {
  if (notas.length === 0) {
    return (
      <div className="empty-state">
        <p>📝 Belum ada catatan.</p>
        <p>Buat catatan pertamamu!</p>
      </div>
    );
  }

  return (
    <div className="nota-list">
      {notas.map((nota) => (
        <div key={nota.id} className={`nota-card ${nota.is_pinned ? 'pinned' : ''}`}>
          <div className="nota-card-header" onClick={() => onSelect(nota)}>
            <h3 className="nota-title">
              {nota.is_pinned && <span className="pin-icon">📌 </span>}
              {nota.title || '(Tanpa Judul)'}
            </h3>
            <span className={`nota-status status-${nota.status}`}>{nota.status}</span>
          </div>

          <p className="nota-summary" onClick={() => onSelect(nota)}>
            {nota.summary || 'Tidak ada isi...'}
          </p>

          {/* Content type badge */}
          {nota.content_type === 'markdown' && (
            <span className="nota-content-type-badge">MD</span>
          )}

          {/* Tags */}
          {nota.tags && nota.tags.length > 0 && (
            <div className="nota-tags">
              {nota.tags.map(tag => (
                <span
                  key={tag.id}
                  className="nota-tag"
                  style={{
                    '--tag-color': tag.color,
                    borderColor: tag.color,
                    color: tag.color,
                  } as React.CSSProperties}
                >
                  <span className="tag-dot" style={{ background: tag.color }} />
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Attachments indicator */}
          {nota.attachments && nota.attachments.length > 0 && (
            <div className="nota-attachments-indicator">
              📎 {nota.attachments.length} file
            </div>
          )}

          <div className="nota-card-footer">
            <span className="nota-date">
              {new Date(nota.updated_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </span>
            <div className="nota-actions">
              <button onClick={() => onTogglePin(nota.id)} title={nota.is_pinned ? 'Unpin' : 'Pin'}>
                {nota.is_pinned ? '📌' : '📍'}
              </button>
              {nota.status !== 'archived' && (
                <button onClick={() => onArchive(nota.id)} title="Arsipkan">🗃️</button>
              )}
              <button onClick={() => onDelete(nota.id)} title="Hapus" className="danger">🗑️</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
