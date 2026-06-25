/** 유저(고객) + 셀러 BO — 동일 API 서버 */
export const USER_API_BASE =
  import.meta.env.VITE_USER_API_BASE?.replace(/\/$/, '') || '/user-api';

/** 어드민 BO 전용 API 서버 */
export const ADMIN_API_BASE =
  import.meta.env.VITE_ADMIN_API_BASE?.replace(/\/$/, '') || '/admin-api';

/** S3/MinIO 이미지 저장소 엔드포인트 */
export const STORAGE_BASE_URL =
  (import.meta.env.VITE_S3_ENDPOINT || '').replace(/\/$/, '');
