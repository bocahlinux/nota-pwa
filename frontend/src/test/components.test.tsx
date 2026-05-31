import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatsBar from '../components/StatsBar';
import Navbar from '../components/Navbar';

// ── StatsBar Tests ──────────────────────────────────────────
describe('StatsBar', () => {
  it('renders null when stats is null', () => {
    const { container } = render(<StatsBar stats={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders all stat items', () => {
    const stats = { total: 10, published: 5, draft: 3, archived: 2, pinned: 1, created_last_7_days: 4 };
    render(<StatsBar stats={stats} />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Pinned')).toBeInTheDocument();
  });

  it('displays correct values', () => {
    const stats = { total: 42, published: 20, draft: 15, archived: 7, pinned: 3, created_last_7_days: 10 };
    render(<StatsBar stats={stats} />);

    const values = screen.getAllByClassName('stat-value');
    expect(values[0].textContent).toBe('42');
    expect(values[1].textContent).toBe('20');
    expect(values[2].textContent).toBe('15');
    expect(values[3].textContent).toBe('7');
    expect(values[4].textContent).toBe('3');
  });
});

// ── Navbar Tests ────────────────────────────────────────────
describe('Navbar', () => {
  it('renders title', () => {
    render(<Navbar title="📝 Nota" />);
    expect(screen.getByText('📝 Nota')).toBeInTheDocument();
  });

  it('renders actions', () => {
    render(
      <Navbar
        title="Test"
        actions={<button>Logout</button>}
      />
    );
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders dark mode toggle button', () => {
    render(<Navbar title="Test" />);
    const toggleBtn = screen.getByTitle(/Mode gelap|Mode terang/);
    expect(toggleBtn).toBeInTheDocument();
  });

  it('toggles dark mode on click', () => {
    render(<Navbar title="Test" />);
    const toggleBtn = screen.getByTitle(/Mode gelap|Mode terang/);
    fireEvent.click(toggleBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    fireEvent.click(toggleBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
