import { useState, useEffect } from 'react';
import type { Nota } from '../services/api';
import TagSelector from './TagSelector';
import AttachmentUploader from './AttachmentUploader';
import MarkdownEditor from './MarkdownEditor';

interface Props {
  nota?: Nota | null;
  onSave: (data: Partial<Nota>) => void;
  onClose: () => void;
  onAttachmentsChange?: () => void;
}

export default function NotaForm({ nota, onSave, onClose, onAttachmentsChange }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [contentType, setContentType] = useState<'plain' | 'markdown'>('plain');

  useEffect(() => {
    if (nota) {
      setTitle(nota.title);
      setContent(nota.content);
      setStatus(nota.status);
      setTagIds(nota.tags.map(t => t.id));
      setContentType(nota.content_type || 'plain');
    } else {
      setTitle('');
      setContent('');
      setStatus('draft');
      setTagIds([]);
      setContentType('plain');
    }
  }, [nota]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, content, status, tag_ids: tagIds, content_type: contentType });
  };

  return (
    <div className="nota-form-overlay" onClick={onClose}>
      <div className="nota-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>{nota ? 'Edit Nota' : 'Nota Baru'}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Judul</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul catatan..."
              autoFocus
            />
          </div>

          {/* Content editor — Markdown or Plain */}
          <div className="form-group">
            <label>Isi</label>
            {contentType === 'markdown' ? (
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Tulis catatanmu di sini... (Markdown supported)"
              />
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis catatanmu di sini..."
                rows={12}
              />
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tipe Konten</label>
              <select value={contentType} onChange={(e) => setContentType(e.target.value as any)}>
                <option value="plain">Plain Text</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <TagSelector selectedTagIds={tagIds} onChange={setTagIds} />
          </div>

          {/* Attachments — only when editing existing nota */}
          {nota && nota.id && (
            <div className="form-group">
              <AttachmentUploader
                notaId={nota.id}
                attachments={nota.attachments || []}
                onUploaded={onAttachmentsChange || (() => {})}
                onDeleted={onAttachmentsChange || (() => {})}
              />
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              {nota ? 'Simpan' : 'Buat Nota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
