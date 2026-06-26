/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USER_API_BASE?: string;
  readonly VITE_ADMIN_API_BASE?: string;
  readonly VITE_S3_ENDPOINT?: string;
  readonly VITE_S3_BASE_URL?: string;
  readonly VITE_ADMIN_LOCAL_BASE_PATH?: string;
  readonly VITE_ADMIN_LOGIN_SEGMENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
