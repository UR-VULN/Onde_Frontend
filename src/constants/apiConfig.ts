/** 유저(고객) + 셀러 BO — 동일 API 서버 */
export const USER_API_BASE =
  import.meta.env.VITE_USER_API_BASE?.replace(/\/$/, '') || 'http://localhost:8080';

/** 어드민 BO 전용 API 서버 */
export const ADMIN_API_BASE =
  import.meta.env.VITE_ADMIN_API_BASE?.replace(/\/$/, '') || 'http://localhost:8081';

/** S3/MinIO 이미지 저장소 엔드포인트 */
export const STORAGE_BASE_URL =
  (import.meta.env.VITE_S3_ENDPOINT || 'http://localhost:9000/onde-local').replace(/\/$/, '');
