interface ImportMetaEnv {
  readonly VITE_PUBLIC_WEBSITE_DOMAIN: string;
  readonly VITE_PUBLIC_ENV_NAME: "Production" | "Development";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
