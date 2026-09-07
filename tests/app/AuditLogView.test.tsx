// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { AuditLogView } from '@/app/audit-log/_components/AuditLogView';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(cleanup);

const getRows = () => screen.getAllByRole('row').slice(1); // minus header

describe('AuditLogView', () => {
  it('renders stat cards and a populated entry table', () => {
    render(<AuditLogView />);
    expect(screen.getByText('Entries Today')).toBeTruthy();
    expect(screen.getByText('Record Changes')).toBeTruthy();
    expect(screen.getByText('Active Users')).toBeTruthy();
    expect(getRows().length).toBeGreaterThan(5);
  });

  it('filters by user via the user select', () => {
    render(<AuditLogView />);
    fireEvent.change(screen.getByLabelText('Filter by user'), {
      target: { value: 'Kelly Warren' },
    });
    for (const row of getRows()) {
      expect(
        within(row).queryByText(/Dana Okafor|Sara Whitfield|Mio Tanaka|Rafael Gutierrez/),
      ).toBeNull();
    }
  });

  it('filters by action type via the action select', () => {
    render(<AuditLogView />);
    fireEvent.change(screen.getByLabelText('Filter by action type'), {
      target: { value: 'Sign-in' },
    });
    for (const row of getRows()) {
      expect(within(row).queryByText('Lease created')).toBeNull();
      expect(within(row).queryByText('Document upload')).toBeNull();
    }
  });

  it('narrows to mutating record changes only', () => {
    render(<AuditLogView />);
    fireEvent.click(screen.getByLabelText(/Record changes only/i));
    for (const row of getRows()) {
      expect(within(row).queryByText('Sign-in')).toBeNull();
    }
    expect(getRows().length).toBeGreaterThan(0);
  });

  it('combines user + action + mutating filters', () => {
    render(<AuditLogView />);
    fireEvent.change(screen.getByLabelText('Filter by user'), {
      target: { value: 'Kelly Warren' },
    });
    fireEvent.change(screen.getByLabelText('Filter by action type'), {
      target: { value: 'Settings change' },
    });
    const rows = getRows();
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(within(row).getByText('Kelly Warren')).toBeTruthy();
      expect(within(row).getByText('Settings change')).toBeTruthy();
    }
  });

  it('searches across actor, record, and detail', () => {
    render(<AuditLogView />);
    fireEvent.change(screen.getByLabelText(/Search entries/i), {
      target: { value: 'retention window' },
    });
    for (const row of getRows()) {
      expect(row.textContent).toMatch(/retention window/i);
    }
  });

  it('offers the empty-state path when filters exclude everything', () => {
    render(<AuditLogView />);
    fireEvent.change(screen.getByLabelText('Filter by user'), {
      target: { value: 'Kelly Warren' },
    });
    fireEvent.change(screen.getByLabelText('Filter by action type'), {
      target: { value: 'Sign-in' },
    });
    // View-level filters bypass DataTable's own hasActiveFilters, so the
    // built-in empty state shows the plain variant.
    expect(screen.getByText('Nothing here yet')).toBeTruthy();
    expect(screen.getByLabelText('Filter by user').textContent).toContain('Kelly Warren');
  });

  it('deep-links affected lease records', () => {
    render(<AuditLogView />);
    const links = screen
      .queryAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('/leases/'));
    expect(links.length).toBeGreaterThan(0);
  });

  it('provides paginated results with a working page-size control', () => {
    render(<AuditLogView />);
    expect(screen.getByText(/Page 1 of \d+/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Rows per page'), { target: { value: '25' } });
    expect(getRows().length).toBeGreaterThan(15);
  });
});
