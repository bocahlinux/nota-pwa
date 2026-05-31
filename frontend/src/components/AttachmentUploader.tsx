import { useState, useRef } from 'react';
import { attachmentAPI } from '../services/api';
import type { Attachment } from '../services/api';

interface Props {
  notaId: number;
  attachments: Attachment[];
  onUploaded: () => void;
  onDeleted: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(mime: string): string {
  if (mime.startsWith('image/')) return '🖼️';
  if (mime.startsWith('video/')) return '🎬';
  if (mime.startsWith('audio/')) return '🎵';
  if (mime.includes('pdf')) return '📄';
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar')) return '📦';
  return '📎';
}

export default function AttachmentUploader({ notaId, attachments, onUploaded, onDeleted }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setProgress(0);
    try {
      for (let i = 0; i < files.length; i++) {
        await attachmentAPI.upload(notaId, files[i], (pct) => setProgress(pct));
      }
      onUploaded();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (attachmentId: number) => {
    if (!window.confirm('Hapus file ini?')) return;
    await attachmentAPI.delete(notaId, attachmentId);
    onDeleted();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="attachment-uploader">
      <label>Lampiran</label>

      {/* Drop zone */}
      <div
        className={'drop-zone ' + (dragOver ? 'drag-over' : '')}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="upload-progress">
            <div className="upload-bar" style={{ width: progress + '%' }} />
            <span>Mengupload... {progress}%</span>
          </div>
        ) : (
          <div className="drop-hint">
            <span className="drop-icon">📎</span>
            <span>Drag & drop file atau klik untuk upload</span>
            <span className="drop-sub">Maks 10MB per file</span>
          </div>
        )}
      </div>

      {/* Attachment list */}
      {attachments && attachments.length > 0 && (
        <div className="attachment-list">
          {attachments.map(att => (
            <div key={att.id} className="attachment-item">
              <span className="attachment-icon">{getFileIcon(att.mime_type)}</span>
              <div className="attachment-info">
                <span className="attachment-name" title={att.filename}>
                  {att.filename}
                </span>
                <span className="attachment-meta">
                  {formatFileSize(att.file_size)} &middot; {new Date(att.uploaded_at).toLocaleDateString('id-ID')}
                </span>
              </div>
              <div className="attachment-actions">
                <a
                  href={att.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                  title="Buka"
                  onClick={(e) => e.stopPropagation()}
                >
                  🔗
                </a>
                <button
                  className="btn-ghost danger"
                  onClick={() => handleDelete(att.id)}
                  title="Hapus"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
