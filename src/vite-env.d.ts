/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USER_API_BASE?: string;
  readonly VITE_ADMIN_API_BASE?: string;
  readonly VITE_S3_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
