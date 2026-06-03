/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USER_API_BASE?: string;
  readonly VITE_ADMIN_API_BASE?: string;
  readonly VITE_PORTONE_IMP_CODE?: string;
  readonly VITE_PORTONE_PG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
