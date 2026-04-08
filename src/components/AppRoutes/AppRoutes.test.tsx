import { fireEvent, render, screen } from '@testing-library/preact';
import { act } from 'preact/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('preact-iso', () => ({
  Router: ({
    onLoadStart,
    onLoadEnd,
  }: {
    onLoadStart?: (url: string) => void;
    onLoadEnd?: (url: string) => void;
  }) => (
    <div>
      <button type="button" data-testid="route-load-start" onClick={() => onLoadStart?.('/blog')}>
        Start
      </button>
      <button type="button" data-testid="route-load-end" onClick={() => onLoadEnd?.('/blog')}>
        End
      </button>
    </div>
  ),
  Route: () => null,
  lazy: (fn: () => Promise<{ default: unknown }>) => fn,
}));

import { AppRoutes } from './AppRoutes';

describe('AppRoutes', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows and hides the delayed route transition overlay using Router load hooks', () => {
    render(<AppRoutes />);

    expect(screen.queryByTestId('route-transition-overlay')).toBeNull();

    fireEvent.click(screen.getByTestId('route-load-start'));
    expect(screen.queryByTestId('route-transition-overlay')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(149);
    });
    expect(screen.queryByTestId('route-transition-overlay')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId('route-transition-overlay')).toBeTruthy();

    fireEvent.click(screen.getByTestId('route-load-end'));
    expect(screen.queryByTestId('route-transition-overlay')).toBeNull();
  });
});
