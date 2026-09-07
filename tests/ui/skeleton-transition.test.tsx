// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeaseTabSkeleton } from '@/components/ui/LeaseTabSkeleton';
import { PageTransition } from '@/components/layout/PageTransition';

describe('LeaseTabSkeleton', () => {
  it('renders a labelled loading status region', () => {
    render(<LeaseTabSkeleton />);
    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-label')).toBe('Loading tab content');
  });

  it('accepts a custom tab label for the announcement', () => {
    render(<LeaseTabSkeleton label="Overview" />);
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('Loading Overview content');
  });
});

describe('PageTransition', () => {
  it('wraps children in the shared page transition wrapper', () => {
    const { container } = render(
      <PageTransition>
        <p>page body</p>
      </PageTransition>,
    );
    expect(screen.getByText('page body')).toBeTruthy();
    expect(container.firstElementChild!.className).toContain('animate-page-in');
    expect(container.firstElementChild!.className).toContain('motion-reduce:animate-none');
  });
});
