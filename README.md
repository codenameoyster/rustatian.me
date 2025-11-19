# 🚀 rustatian.me

**rustatian.me** is a modern web application built with [Preact](https://preactjs.com/), [Vite](https://vitejs.dev/), and [MUI](https://mui.com/), featuring SSR support, custom theming, and Markdown rendering.

---

## ⚡ Quick Start

### 1. 📦 Install dependencies

```bash
bun install
```

### 2. 🏃 Run the development server

```bash
bun run dev
```
The application will be available at: [http://localhost:5173](http://localhost:5173)

### 3. 🏗️ Build for production

```bash
bun run build:prod
```

After running the build command, the result will be in the `dist/` folder with all routes pre-rendered (static site generation).

### 3.1 🛠️ Build for development

```bash
bun run build
```

This will build the project using the default (development) environment variables.

### 4. 👀 Preview the production build

```bash
bun run preview
```

---

## 🛠️ Technologies

- **Preact** — ⚛️ lightweight alternative to React
- **Vite** — ⚡ fast build tool and dev server
- **MUI** — 🎨 modern UI component library
- **@tanstack/react-query** — 🔄 asynchronous data management
- **markdown-it** — 📝 Markdown rendering
- **TypeScript** — 🔒 type safety

---

## 📂 Project Structure

```
src/
  api/         # 🌐 API requests
  assets/      # 🖼️ Static resources (icons, images)
  components/  # 🧩 UI components
  hooks/       # 🪝 Custom hooks
  pages/       # 📄 Application pages
  state/       # 🗃️ Global state
  theme/       # 🎨 Theming and styles
  utils/       # 🛠️ Utilities
  index.tsx    # 🚪 Entry point
```

---

## ⚙️ Scripts

| Purpose                 | Command              |
| ----------------------- | -------------------- |
| 🚀 Start dev server      | `bun run dev`        |
| 🏗️ Build for production  | `bun run build:prod` |
| 🛠️ Build for development | `bun run build`      |
| 👀 Preview build         | `bun run preview`    |
| 🧹 Lint code             | `bun run lint`       |
| 🛠️ Lint & fix            | `bun run lint:fix`   |
| 📝 Check formatting      | `bun run format`     |
| ✨ Format & fix          | `bun run format:fix` |

---

## 🧪 Linting and Formatting

- **ESLint** and **Prettier** are used for code quality and formatting.
- Linting and formatting of changed files are automatically run before commits (via Husky and lint-staged).

---

## 📝 License

See the [LICENSE](./LICENSE) file.
