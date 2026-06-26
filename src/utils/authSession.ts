import { fetch_member_identity_api, fetch_member_me_api, fetch_member_profile_api } from '@/api/userApi';
import { DEFAULT_MEMBERSHIP_GRADE } from '@/constants/appConstants';
import { purgeLegacyAuthStorage } from '@/utils/authCookies';
import { useTravelStore } from '@/store/useTravelStore';

const POST_LOGOUT_REDIRECT_KEY = 'onde_post_logout';
const SKIP_SESSION_RESTORE_KEY = 'onde_skip_session_restore';

/** 의도적 로그아웃 직후 자동 세션 복구 방지 */
export function markSkipSessionRestore(): void {
  try {
    sessionStorage.setItem(SKIP_SESSION_RESTORE_KEY, '1');
  } catch {
    /* ignore */
  }
}

function consumeSkipSessionRestore(): boolean {
  try {
    const skip = sessionStorage.getItem(SKIP_SESSION_RESTORE_KEY) === '1';
    if (skip) {
      sessionStorage.removeItem(SKIP_SESSION_RESTORE_KEY);
    }
    return skip;
  } catch {
    return false;
  }
}

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

/** 서버 HttpOnly 쿠키 무효화 후 클라이언트 세션 정리 */
export async function performLogout(options?: { redirectTo?: string }): Promise<void> {
  markSkipSessionRestore();
  sessionRestoreInFlight = null;

  try {
    const { userAxios } = await import('@/api/axiosInstance');
    await userAxios.post('/api/v1/auth/logout', {}, { skipErrorRedirect: true });
  } catch {
    /* 네트워크 오류 시에도 로컬 세션은 정리 */
  }
  useTravelStore.getState().logout(options);
}

/** 백오피스(판매자·관리자) 로그아웃 — 메인(/)으로 이동 */
export function logoutToHome(): void {
  void performLogout({ redirectTo: '/' });
}

/** 401 등 인증 실패 시 쿠키·스토어 세션 정리 */
export function clearAuthSession(): void {
  void performLogout();
}

let sessionRestoreInFlight: Promise<boolean> | null = null;

/** HttpOnly 쿠키 기반 세션을 서버에서 조회해 Zustand 스토어에 반영 */
export function restoreSessionFromServer(): Promise<boolean> {
  if (consumeSkipSessionRestore()) {
    return Promise.resolve(false);
  }
  if (useTravelStore.getState().isLoggedIn) {
    return Promise.resolve(true);
  }
  if (!sessionRestoreInFlight) {
    sessionRestoreInFlight = (async () => {
      try {
        const identityRes = await fetch_member_identity_api();
        if (!identityRes.success || !identityRes.data?.memberId) {
          return false;
        }

        const { memberId, email, role } = identityRes.data;

        let name = '';
        let nickname = '';
        try {
          const profileRes = await fetch_member_me_api();
          if (profileRes.success && profileRes.data) {
            name = profileRes.data.name || '';
            nickname = profileRes.data.nickname || '';
          }
        } catch {
          /* 프로필 필드는 선택 */
        }

        let profile = { mileage: 0, membershipGrade: DEFAULT_MEMBERSHIP_GRADE };
        try {
          const mileageRes = await fetch_member_profile_api();
          if (mileageRes.success && mileageRes.data) {
            profile = mileageRes.data;
          }
        } catch {
          /* 마일리지 필드는 선택 */
        }

        useTravelStore.getState().login(email, role, profile, memberId, name, nickname);
        return true;
      } catch {
        purgeLegacyAuthStorage();
        return false;
      }
    })().finally(() => {
      sessionRestoreInFlight = null;
    });
  }
  return sessionRestoreInFlight;
}
