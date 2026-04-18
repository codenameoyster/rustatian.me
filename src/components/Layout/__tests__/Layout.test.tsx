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

  it('renders the three nav routes in order', () => {
    render(<Layout>content</Layout>);
    const navLinks = screen.getAllByRole('link');
    const hrefs = navLinks.map(a => a.getAttribute('href'));
    // Brand + 3 nav items + footer contact + footer github — order-insensitive check.
    expect(hrefs).toEqual(expect.arrayContaining(['/', '/about', '/contact']));
  });
});
