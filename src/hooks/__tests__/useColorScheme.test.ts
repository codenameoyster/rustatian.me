import { act, renderHook } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useColorScheme } from '../useColorScheme';

const STORAGE_KEY = 'rustatian-v2-theme';

const setSystemPrefersDark = (prefersDark: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('dark')
        ? prefersDark
        : query.includes('light')
          ? !prefersDark
          : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe('useColorScheme', () => {
  beforeEach(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
    setSystemPrefersDark(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without hydration mismatch; reconciles on mount', () => {
    const { result } = renderHook(() => useColorScheme());
    expect(['light', 'dark']).toContain(result.current.theme);
    expect(result.current.mounted).toBe(true);
  });

  it('reads light theme from localStorage on mount', () => {
    window.localStorage.setItem(STORAGE_KEY, 'light');
    const { result } = renderHook(() => useColorScheme());
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('reads dark theme from localStorage on mount', () => {
    window.localStorage.setItem(STORAGE_KEY, 'dark');
    const { result } = renderHook(() => useColorScheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('falls back to system preference when storage is empty', () => {
    setSystemPrefersDark(true);
    const { result } = renderHook(() => useColorScheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('ignores invalid stored values', () => {
    window.localStorage.setItem(STORAGE_KEY, 'tangerine');
    setSystemPrefersDark(true);
    const { result } = renderHook(() => useColorScheme());
    expect(result.current.theme).toBe('dark');
  });

  it('toggle flips and persists theme, updating data-theme attribute', () => {
    const { result } = renderHook(() => useColorScheme());
    expect(result.current.theme).toBe('light');

    act(() => result.current.toggle());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('dark');

    act(() => result.current.toggle());
    expect(result.current.theme).toBe('light');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('does not throw when localStorage.setItem raises (e.g. private mode)', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const { result } = renderHook(() => useColorScheme());
    expect(() => act(() => result.current.toggle())).not.toThrow();
    expect(result.current.theme).toBe('dark');
    setItemSpy.mockRestore();
  });
});
