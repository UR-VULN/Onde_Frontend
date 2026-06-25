/**
 * 인증 정보 저장소 (Session Storage 활용)
 *
 * - 중요 토큰(JWT)은 Spring 백엔드가 발급하는 HttpOnly + Secure 쿠키에만 의존하며,
 *   axios `withCredentials: true` 설정을 통해 자동으로 전송되므로 JS 레벨에서 다루지 않습니다.
 * - UI 및 회원 인증 확인용 비민감 메타데이터(memberId, role 등)는 sessionStorage를 통해 관리합니다.
 */
import { useTravelStore } from '@/store/useTravelStore';

const STORAGE_KEYS = {
  MEMBER_ID: 'onde_member_id',
  ROLE: 'onde_member_role',
  USERNAME: 'onde_username',
  NAME: 'onde_name',
  NICKNAME: 'onde_nickname',
} as const;

export function getAccessToken(): string | null {
  return null; // HttpOnly 쿠키는 JS에서 읽을 수 없습니다.
}

export function getRefreshToken(): string | null {
  return null; // HttpOnly 쿠키는 JS에서 읽을 수 없습니다.
}

export function getMemberId(): number | null {
  const raw = sessionStorage.getItem(STORAGE_KEYS.MEMBER_ID);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export function getMemberRole(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.ROLE);
}

export function getUsername(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.USERNAME);
}

export function getName(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.NAME);
}

export function getNickname(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.NICKNAME);
}

export function hasAuthSession(): boolean {
  return !!(getMemberId() && getMemberRole() && getUsername());
}

export interface PersistAuthPayload {
  accessToken?: string;
  refreshToken?: string;
  memberId: number;
  role: string;
  username: string;
  name?: string;
  nickname?: string;
  expiresIn?: number;
}

export function updateAccessToken(_accessToken: string, _expiresIn?: number): void {
  // Access Token은 백엔드에서 HttpOnly Set-Cookie 헤더로 갱신되므로 프론트엔드 직접 저장은 불필요합니다.
}


export function persistAuthSession(payload: PersistAuthPayload): void {
  sessionStorage.setItem(STORAGE_KEYS.MEMBER_ID, String(payload.memberId));
  sessionStorage.setItem(STORAGE_KEYS.ROLE, payload.role);
  sessionStorage.setItem(STORAGE_KEYS.USERNAME, payload.username);
  sessionStorage.setItem(STORAGE_KEYS.NAME, payload.name ?? '');
  sessionStorage.setItem(STORAGE_KEYS.NICKNAME, payload.nickname ?? '');
}

export function clearAllAuthCookies(): void {
  // 브라우저 자바스크립트로 구웠던 레거시 쿠키를 정리합니다.
  const legacyCookies = ['onde_access_token', 'onde_refresh_token', 'accessToken', 'refreshToken', 'onde_member_id', 'onde_member_role', 'onde_username', 'onde_name', 'onde_nickname'];
  legacyCookies.forEach(name => {
    document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
  });
  
  // sessionStorage 클리어
  Object.values(STORAGE_KEYS).forEach(key => sessionStorage.removeItem(key));
}

/** 앱 부팅 시 동기 복구 (RequireAuth 레이스 방지) */
export function restoreSessionFromCookies(): boolean {
  if (!hasAuthSession()) return false;

  const { isLoggedIn } = useTravelStore.getState();
  if (isLoggedIn) return true;

  useTravelStore.setState({
    isLoggedIn: true,
    username: getUsername() ?? '',
    name: getName() ?? '',
    nickname: getNickname() ?? '',
    memberRole: getMemberRole(),
    memberId: getMemberId(),
  });

  return true;
}

/** 예전 localStorage 토큰 → sessionStorage 이전 */
export function migrateLegacyLocalStorageAuth(): void {
  const memberId = localStorage.getItem('onde_member_id');
  const role = localStorage.getItem('onde_member_role');
  const username = localStorage.getItem('onde_username');

  if (memberId && role && username) {
    persistAuthSession({
      memberId: Number(memberId),
      role,
      username,
    });
  }


  localStorage.removeItem('onde_auth_token');
  localStorage.removeItem('onde_refresh_token');
  localStorage.removeItem('onde_member_id');
  localStorage.removeItem('onde_member_role');
  localStorage.removeItem('onde_username');
}

