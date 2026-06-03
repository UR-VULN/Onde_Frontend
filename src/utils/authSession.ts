import { useTravelStore } from '@/store/useTravelStore';

/** 401 등 인증 실패 시 쿠키·스토어 세션 정리 */
export function clearAuthSession(): void {
  useTravelStore.getState().logout();
}
