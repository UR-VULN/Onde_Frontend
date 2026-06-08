import { useTravelStore } from '@/store/useTravelStore';

const POST_LOGOUT_REDIRECT_KEY = 'onde_post_logout';

/** 백오피스 등 의도적 로그아웃 후 가드가 /401 대신 이동할 경로 */
export function setPostLogoutRedirect(path: string): void {
  try {
    sessionStorage.setItem(POST_LOGOUT_REDIRECT_KEY, path);
  } catch {
    /* ignore */
  }
}

export function hasPostLogoutRedirect(): boolean {
  try {
    return sessionStorage.getItem(POST_LOGOUT_REDIRECT_KEY) != null;
  } catch {
    return false;
  }
}

export function consumePostLogoutRedirect(): string | null {
  try {
    const path = sessionStorage.getItem(POST_LOGOUT_REDIRECT_KEY);
    if (path) sessionStorage.removeItem(POST_LOGOUT_REDIRECT_KEY);
    return path;
  } catch {
    return null;
  }
}

export function clearPostLogoutRedirect(): void {
  try {
    sessionStorage.removeItem(POST_LOGOUT_REDIRECT_KEY);
  } catch {
    /* ignore */
  }
}

/** 백오피스(판매자·관리자) 로그아웃 — 메인(/)으로 이동 */
export function logoutToHome(): void {
  useTravelStore.getState().logout({ redirectTo: '/' });
}

/** 401 등 인증 실패 시 쿠키·스토어 세션 정리 */
export function clearAuthSession(): void {
  useTravelStore.getState().logout();
}
