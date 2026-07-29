import { render, screen } from '@testing-library/preact';
import { LocationProvider } from 'preact-iso';
import { describe, expect, it, vi } from 'vitest';

// Stub the leaf pages, keep preact-iso real. The previous version did the
// opposite — it mocked the entire router (including a `lazy` export AppRoutes
// never imports) and asserted only on the callbacks its own mock invoked, so it
// covered none of the routing this component actually owns.
vi.mock('@pages/Home', () => ({ Home: () => <div>home-page</div> }));
vi.mock('@pages/About', () => ({ About: () => <div>about-page</div> }));
vi.mock('@pages/Contact', () => ({ Contact: () => <div>contact-page</div> }));
vi.mock('@pages/_404', () => ({ NotFound: () => <div>notfound-page</div> }));

import { AppRoutes } from './AppRoutes';

const renderAt = (path: string) => {
  window.history.replaceState(null, '', path);
  return render(
    <LocationProvider>
      <AppRoutes />
    </LocationProvider>,
  );
};

describe('AppRoutes', () => {
  it.each([
    ['/', 'home-page'],
    ['/about', 'about-page'],
    ['/contact', 'contact-page'],
  ])('routes %s to the right page', async (path, expected) => {
    renderAt(path);
    expect(await screen.findByText(expected)).toBeTruthy();
  });

  it('falls back to NotFound for an unmatched path', async () => {
    renderAt('/no-such-page');
    expect(await screen.findByText('notfound-page')).toBeTruthy();
  });

  it('does not match a retired /blog route', async () => {
    renderAt('/blog');
    expect(await screen.findByText('notfound-page')).toBeTruthy();
  });
});
