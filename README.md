# 🚀 rustatian.me

**rustatian.me** is a modern web application built with [Preact](https://preactjs.com/), [Vite](https://vitejs.dev/), and [MUI](https://mui.com/), featuring SSR support, custom theming, and Markdown rendering.

---

## ⚡ Quick Start

### 1. 📦 Install dependencies

You can use **Yarn**, **npm**, or **Bun**:

```bash
# With Yarn
yarn install

# With npm
npm install

# With Bun
bun install
```

### 2. 🏃 Run the development server

```bash
yarn dev
# or
npm run dev
# or
bun run dev
```
The application will be available at: [http://localhost:5173](http://localhost:5173)

### 3. 🏗️ Build for production

```bash
yarn build
# or
npm run build
# or
bun run build
```

After running the build command, the result will be in the `dist/` folder with all routes pre-rendered (static site generation).

### 4. 👀 Preview the production build

```bash
yarn preview
# or
npm run preview
# or
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

All scripts can be run with **Yarn**, **npm**, or **Bun**:

| Purpose                | Yarn Command         | npm Command         | Bun Command         |
|------------------------|---------------------|---------------------|---------------------|
| 🚀 Start dev server    | `yarn dev`          | `npm run dev`       | `bun run dev`       |
| 🏗️ Build for production | `yarn build`        | `npm run build`     | `bun run build`     |
| 👀 Preview build       | `yarn preview`      | `npm run preview`   | `bun run preview`   |
| 🧹 Lint code           | `yarn lint`         | `npm run lint`      | `bun run lint`      |
| 🛠️ Lint & fix         | `yarn lint:fix`     | `npm run lint:fix`  | `bun run lint:fix`  |
| 📝 Check formatting    | `yarn format`       | `npm run format`    | `bun run format`    |
| ✨ Format & fix        | `yarn format:fix`   | `npm run format:fix`| `bun run format:fix`|

---

## 🧪 Linting and Formatting

- **ESLint** and **Prettier** are used for code quality and formatting.
- Linting and formatting of changed files are automatically run before commits (via Husky and lint-staged).

---

## 📝 License

See the [LICENSE](./LICENSE) file.
