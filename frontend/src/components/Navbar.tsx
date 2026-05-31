import type { ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ title, actions }: { title: string; actions?: ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <h1 className="navbar-title">{title}</h1>
      <div className="navbar-actions">
        <button
          className="btn btn-ghost"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Mode gelap' : 'Mode terang'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        {actions}
      </div>
    </header>
  );
}
