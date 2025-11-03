# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal portfolio/blog website built with Preact, Vite, and MUI. The site features SSR/SSG support, dynamic Markdown rendering from GitHub repositories, and custom theming.

## Build & Development Commands

```bash
# Development
npm run dev          # Start dev server at localhost:5173
npm run prod         # Start dev server with production env vars

# Building
npm run build        # Development build
npm run build:prod   # Production build (uses NODE_ENV=production)
npm run preview      # Preview production build

# Code Quality
npm run lint         # Check TypeScript/TSX files
npm run lint:fix     # Auto-fix linting issues
npm run format       # Check formatting
npm run format:fix   # Auto-format code
```

## Architecture

**Framework Stack:**
- **Preact** instead of React (via compatibility layer using preact/compat)
- **preact-iso** for routing and SSR/SSG
- **MUI (Material-UI)** with custom theming
- **@tanstack/react-query** for async state management
- **Emotion** for CSS-in-JS styling

**Path Aliases** (defined in vite.config.ts and tsconfig.json):
- `@/` → `src/`
- `@components/` → `src/components/`
- `@pages/` → `src/pages/`
- `@api/` → `src/api/`
- `@state/` → `src/state/`
- `@hooks/` → `src/hooks/`
- `@utils/` → `src/utils/`
- `@constants/` → `src/constants/`
- `@assets/` → `src/assets/`

**SSR/SSG Configuration:**
Vite's prerender plugin is enabled in vite.config.ts. The application is pre-rendered at build time:
- All routes are statically generated
- `prerender()` function in src/index.tsx handles SSR
- `hydrate()` enables client-side interactivity

**State Management:**
- `src/state/appContext/appContext.tsx` provides global app state (user, error)
- `src/state/appContext/ThemeContext.tsx` manages theme (light/dark mode)
- Local storage via `src/state/storage.ts` for theme persistence
- React Query handles all API data fetching

**Content Architecture:**
- Blog content is fetched from GitHub repositories via GitHub API
- `src/api/githubRequests.ts` handles all GitHub API calls
- Markdown is rendered using markdown-it with plugins (emoji, anchor, sanitizer, TOC)
- `src/components/MarkdownDocumentContainer/` wraps content fetching and rendering

**Routing:**
- Defined in `src/components/AppRoutes/AppRoutes.tsx`
- `/` → Home page (About Me)
- `/blog` → Blog listing
- `/blog/*` → Individual blog posts
- `*` → 404 page

**Theming:**
- Light and dark themes defined in `src/theme/index.ts`
- Custom theme properties extend MUI's theme (sidebar width, header height, scrollbar colors)
- Theme persistence via localStorage
- Material UI's `ThemeProvider` wrapped in custom `CustomThemeProvider`

**Component Organization:**
- Presentational components live in `src/components/`
- Page-level components in `src/pages/`
- Layout components include sidebar navigation and top bar
- Nested component folders contain related sub-components (e.g., Layout/components/)

## Key Development Notes

**Preact Compatibility:**
- React imports are aliased to preact/compat
- Use Preact hooks from 'preact/hooks' not 'react'
- FunctionalComponent type from 'preact' instead of React.FC

**Environment Variables:**
- `.env.development` and `.env.production` files exist
- Access via `import.meta.env` (Vite convention)
- `__APP_ENV__` is defined in vite.config.ts

**Pre-commit Hooks:**
- Husky + lint-staged configured in package.json
- Auto-runs ESLint and Prettier on staged TypeScript/TSX files

**GitHub API Integration:**
- Profile data fetched from GitHub Users API
- Blog content fetched from raw GitHub repository URLs
- Constants defined in `src/constants.ts` (PROFILE_NAME, PROFILE_REPO_NAME, etc.)
