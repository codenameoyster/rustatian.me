import { describe, expect, it } from 'vitest';
import type { Repo } from '@/api/githubRequests';
import { computeFeaturedState, type QueryLikeState } from '../useGitHub';

const repo = (overrides: Partial<Repo> = {}): Repo => ({
  name: 'sample',
  description: 'A sample repo',
  html_url: 'https://github.com/rustatian/sample',
  stargazers_count: 1,
  forks_count: 0,
  language: 'Go',
  ...overrides,
});

const loadingState: QueryLikeState = {
  isLoading: true,
  isError: false,
  isSuccess: false,
};
const idleState: QueryLikeState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
};
const success = (data: Repo[]): QueryLikeState => ({
  data,
  isLoading: false,
  isError: false,
  isSuccess: true,
});
const errored: QueryLikeState = {
  isLoading: false,
  isError: true,
  isSuccess: false,
};

describe('computeFeaturedState', () => {
  it('returns pinned sorted desc by stars, sliced to the limit, source=pinned', () => {
    const state = computeFeaturedState(
      success([
        repo({ name: 'low', stargazers_count: 5 }),
        repo({ name: 'high', stargazers_count: 100 }),
        repo({ name: 'mid', stargazers_count: 50 }),
      ]),
      idleState,
      2,
    );
    expect(state.source).toBe('pinned');
    expect(state.data?.map(r => r.name)).toEqual(['high', 'mid']);
    expect(state.isError).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('filters repos with no description and zero stars', () => {
    const state = computeFeaturedState(
      success([
        repo({ name: 'keep-desc', description: 'useful', stargazers_count: 0 }),
        repo({ name: 'keep-star', description: null, stargazers_count: 3 }),
        repo({ name: 'drop', description: null, stargazers_count: 0 }),
      ]),
      idleState,
      10,
    );
    expect(state.data?.map(r => r.name)).toEqual(['keep-star', 'keep-desc']);
  });

  it('falls back to /repos when pinned resolves empty', () => {
    const state = computeFeaturedState(
      success([]),
      success([repo({ name: 'alpha', stargazers_count: 10 })]),
      5,
    );
    expect(state.source).toBe('repos');
    expect(state.data?.map(r => r.name)).toEqual(['alpha']);
  });

  it('falls back to /repos when pinned errors', () => {
    const state = computeFeaturedState(
      errored,
      success([repo({ name: 'beta', stargazers_count: 2 })]),
      5,
    );
    expect(state.source).toBe('repos');
    expect(state.data?.map(r => r.name)).toEqual(['beta']);
  });

  it('surfaces isError when pinned succeeds empty AND fallback errors', () => {
    const state = computeFeaturedState(success([]), errored, 5);
    expect(state.isError).toBe(true);
    expect(state.source).toBe('repos');
    expect(state.data).toBeUndefined();
  });

  it('surfaces isError when pinned errors AND fallback errors', () => {
    const state = computeFeaturedState(errored, errored, 5);
    expect(state.isError).toBe(true);
  });

  it('does not surface isError when pinned errored but fallback succeeded', () => {
    const state = computeFeaturedState(
      errored,
      success([repo({ name: 'gamma', stargazers_count: 7 })]),
      5,
    );
    expect(state.isError).toBe(false);
    expect(state.source).toBe('repos');
  });

  it('reports loading while pinned is in-flight', () => {
    const state = computeFeaturedState(loadingState, idleState, 5);
    expect(state.isLoading).toBe(true);
    expect(state.isError).toBe(false);
  });

  it('reports loading while fallback is in-flight after pinned empty', () => {
    const state = computeFeaturedState(success([]), loadingState, 5);
    expect(state.isLoading).toBe(true);
    expect(state.source).toBe('repos');
  });

  it('does not treat pinned isLoading=false AND fallback not yet enabled as loading', () => {
    // Pinned just succeeded with items — no fallback, not loading.
    const state = computeFeaturedState(
      success([repo({ name: 'x', stargazers_count: 1 })]),
      idleState,
      5,
    );
    expect(state.isLoading).toBe(false);
  });
});
