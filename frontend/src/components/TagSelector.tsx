import { useState } from 'react';
import { useTags } from '../hooks/useTags';
import type { Tag } from '../services/api';

interface Props {
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
}

const PRESET_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function TagSelector({ selectedTagIds, onChange }: Props) {
  const { tags, createTag } = useTags();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  const toggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const tag = await createTag(newName.trim(), newColor);
    onChange([...selectedTagIds, tag.id]);
    setNewName('');
    setShowCreate(false);
  };

  return (
    <div className="tag-selector">
      <label>Tags</label>
      <div className="tag-chips">
        {tags.map(tag => (
          <button
            key={tag.id}
            className={'tag-chip ' + (selectedTagIds.includes(tag.id) ? 'active' : '')}
            style={{
              '--tag-color': tag.color,
              borderColor: selectedTagIds.includes(tag.id) ? tag.color : undefined,
              background: selectedTagIds.includes(tag.id) ? tag.color + '20' : undefined,
            } as React.CSSProperties}
            onClick={() => toggleTag(tag.id)}
          >
            <span className="tag-dot" style={{ background: tag.color }} />
            {tag.name}
          </button>
        ))}
        <button className="tag-chip tag-add" onClick={() => setShowCreate(!showCreate)}>
          + Baru
        </button>
      </div>
      {showCreate && (
        <div className="tag-create">
          <input
            type="text"
            placeholder="Nama tag..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <div className="tag-colors">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                className={'tag-color-btn ' + (newColor === c ? 'active' : '')}
                style={{ background: c }}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>
          <div className="tag-create-actions">
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleCreate}>Buat</button>
          </div>
        </div>
      )}
    </div>
  );
}
