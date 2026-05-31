import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({ value, onChange, placeholder }: Props) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  return (
    <div className="markdown-editor">
      {/* Toolbar */}
      <div className="md-toolbar">
        <div className="md-tabs">
          <button
            className={`md-tab ${tab === 'write' ? 'active' : ''}`}
            onClick={() => setTab('write')}
          >
            ✏️ Write
          </button>
          <button
            className={`md-tab ${tab === 'preview' ? 'active' : ''}`}
            onClick={() => setTab('preview')}
          >
            👁️ Preview
          </button>
        </div>
        <div className="md-help">
          <span title="Markdown formatting supported">
            <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer">
              ?
            </a>
          </span>
        </div>
      </div>

      {/* Content */}
      {tab === 'write' ? (
        <textarea
          className="md-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Tulis catatanmu di sini... (Markdown supported)'}
          rows={12}
        />
      ) : (
        <div className="md-preview">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value}
            </ReactMarkdown>
          ) : (
            <p className="md-empty-preview">Tidak ada konten untuk dipreview...</p>
          )}
        </div>
      )}
    </div>
  );
}
