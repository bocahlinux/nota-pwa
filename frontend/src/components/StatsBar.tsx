import type { NotaStats } from '../services/api';

interface Props {
  stats: NotaStats | null;
}

export default function StatsBar({ stats }: Props) {
  if (!stats) return null;

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span className="stat-value">{stats.total}</span>
        <span className="stat-label">Total</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{stats.published}</span>
        <span className="stat-label">Published</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{stats.draft}</span>
        <span className="stat-label">Draft</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{stats.archived}</span>
        <span className="stat-label">Archived</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{stats.pinned}</span>
        <span className="stat-label">📌 Pinned</span>
      </div>
    </div>
  );
}
