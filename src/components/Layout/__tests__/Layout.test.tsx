import { render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { Layout } from '../Layout';

vi.mock('preact-iso', () => ({
  useLocation: () => ({ path: '/about' }),
}));

describe('Layout nav', () => {
  it('marks the active route with aria-current="page"', () => {
    render(<Layout>content</Layout>);
    const current = screen.getByRole('link', { current: 'page' });
    expect(current.getAttribute('href')).toBe('/about');
  });

  it('renders the three primary nav routes in order', () => {
    render(<Layout>content</Layout>);
    const nav = screen.getByRole('navigation', { name: /primary/i });
    // Exclude the brand anchor (aria-label="Home") to leave just the nav items.
    const hrefs = [...nav.querySelectorAll('a')]
      .filter(a => a.getAttribute('aria-label') !== 'Home')
      .map(a => a.getAttribute('href'));
    expect(hrefs).toEqual(['/', '/about', '/contact']);
  });
});
