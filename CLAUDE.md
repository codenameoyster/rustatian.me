# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio site for rustatian.me. Static-rendered Preact frontend served by a Cloudflare Worker that also proxies the GitHub API. There is no blog and no CMS — all page content is hardcoded in `src/data/profile.ts`.

## Build & Development Commands

The project is Bun-first: `bun.lock` is the committed lockfile and CI runs Bun. Use `bun run <script>`, not npm.

```bash
bun run dev            # Worker + assets via wrangler on localhost:8787 — the realistic target
bun run dev:vite       # Vite dev server only (no worker; API routes will 404)

bun run build          # Development build
bun run build:prod     # Production build (what deploy ships)
bun run build:analyze  # Production build + bundle visualizer
bun run preview        # Preview the built output

bun run typecheck      # tsc --noEmit
bun run lint           # biome lint src/
bun run lint:fix       # biome lint --write src/
bun run format:fix     # biome format --write src/
bun run test           # vitest run
bun run test:coverage  # vitest run --coverage

bun run check          # typecheck + lint + test + build:prod — run this before calling work done
bun run deploy         # build:prod + wrangler deploy
```

Lint and format are **Biome** (`biome.json`). There is no ESLint or Prettier. The Husky pre-commit hook runs `biome check --write` via lint-staged.

## Architecture

**Frontend stack:** Preact (React aliased to `preact/compat`), `preact-iso` for routing and prerendering, `@tanstack/react-query` for the two GitHub queries, `react-helmet-async` for document head, Zod for response validation. Styling is **CSS Modules** plus global custom properties — there is no CSS-in-JS, no MUI, no Emotion.

**Backend:** `src/worker.ts` is the production entrypoint (`wrangler.toml` `main`, with `run_worker_first = true`). It serves static assets, handles the SPA/404 fallback, applies security headers and CSP, and proxies two GitHub endpoints behind an edge cache with per-IP token-bucket rate limiting. `GITHUB_TOKEN` is a Workers secret; locally it lives in `.dev.vars` (gitignored, never committed).

**Routes** (`src/components/AppRoutes/AppRoutes.tsx`): `/` Home, `/about` About, `/contact` Contact, and a default route rendering `NotFound`. The prerender list in `vite.config.ts` must be kept in sync with this table, and `public/sitemap.xml` with both.

**API layer:**
- Client: `src/api/fetchJson.ts` is the single fetch path — timeout signal, error taxonomy (`WorkerApiError` / `NetworkError`), and Zod validation. `src/api/routes.ts` holds the endpoint paths; `src/api/cachePolicy.ts` holds the TTLs shared with the worker.
- Worker: `src/worker/contributions.ts` (GraphQL query + transform) and `src/worker/user.ts` (field projection). **Every upstream route must project its response** — the requests carry the site's token, so proxying a body verbatim can leak owner-only GitHub fields.

**Theming:** `src/styles/tokens.css` defines custom properties for both themes, switched by a `data-theme` attribute on `<html>`. The attribute is resolved **before first paint** by a small inline script in `index.html`; that script is allowed by CSP via a sha256 hash pinned in `THEME_BOOTSTRAP_HASH` in `src/worker.ts`. **Editing the script — even its whitespace — requires recomputing that hash**, or theme resolution silently stops. `src/hooks/useColorScheme.ts` owns the runtime state and only persists to `localStorage` on an explicit toggle.

**Design tokens:** use the real token names — `--s-*` (spacing), `--r-*` (radius), `--fs-*` (font size), `--fg-*`/`--bg-*`/`--bd-*` (colors). Invented names silently produce invalid declarations that the browser drops.

## Path Aliases

`@/` → `src/`, plus `@components/`, `@pages/`, `@state/`. Prefer `@/` — it is what the codebase overwhelmingly uses.

## Testing

Vitest with jsdom (`vitest.config.ts`, setup in `src/setupTests.ts`). Tests live in `src/**/__tests__/` and alongside components. `src/__tests__/worker.test.ts` is the largest suite and covers routing, caching, rate limiting, CSP and error mapping.

When touching the worker's caching, note that the mock cache is a plain `Map` with no expiry — it cannot catch TTL/eviction behavior, so assert on stored headers rather than assuming time-based tests are meaningful.

## Conventions

- Components are plain arrow functions with a local props interface. No `FunctionalComponent`, no `React.FC`.
- Hooks come from `preact/hooks`.
- Shared UI primitives live in `src/components/ui/`; page-level components in `src/pages/`.
- Page `<head>` content goes through `src/components/Seo/Seo.tsx`, not a bare `<Helmet>` — it supplies canonical and Open Graph tags consistently.
