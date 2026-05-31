/**
 * 인증 정보 쿠키 저장소
 *
 * - Mock/SPA: 로그인 응답 JWT를 쿠키에 저장 후 Bearer 헤더로 전송
 * - 실서버 권장: Spring이 HttpOnly + Secure Set-Cookie → axios `withCredentials: true`만 사용
 *   (HttpOnly는 JS에서 읽을 수 없으므로 프론트 setAccessToken은 제거)
 */
import { useTravelStore } from '@/store/useTravelStore';

const NAMES = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
  MEMBER_ID: 'onde_member_id',
  ROLE: 'onde_member_role',
  USERNAME: 'onde_username',
} as const;

const DEFAULT_ACCESS_MAX_AGE = 60 * 60 * 24 * 7; // 7일
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30일
const META_MAX_AGE = 60 * 60 * 24 * 30;

function cookieFlags(maxAge?: number): string {
  const parts = ['path=/', 'SameSite=Lax'];
  if (maxAge != null) parts.push(`max-age=${maxAge}`);
  if (import.meta.env.PROD) parts.push('Secure');
  return parts.join('; ');
}

function setCookie(name: string, value: string, maxAge?: number): void {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ${cookieFlags(maxAge)}`;
}

function getCookie(name: string): string | null {
  const escaped = encodeURIComponent(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string): void {
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  return getCookie(NAMES.ACCESS);
}

export function getRefreshToken(): string | null {
  return getCookie(NAMES.REFRESH);
}

export function getMemberId(): number | null {
  const raw = getCookie(NAMES.MEMBER_ID);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export function getMemberRole(): string | null {
  return getCookie(NAMES.ROLE);
}

export function getUsername(): string | null {
  return getCookie(NAMES.USERNAME);
}

export function hasAuthSession(): boolean {
  // 🛡️ HttpOnly 쿠키는 JS에서 읽을 수 없으므로, 메타데이터 쿠키 존재 여부로 세션 확인
  return !!(getMemberId() && getMemberRole() && getUsername());
}

export interface PersistAuthPayload {
  accessToken: string;
  refreshToken: string;
  memberId: number;
  role: string;
  username: string;
  expiresIn?: number;
}

/** 로그인 성공 시 쿠키 + 스토어 동기화 */
export function updateAccessToken(accessToken: string, expiresIn?: number): void {
  const accessMaxAge = expiresIn && expiresIn > 0 ? expiresIn : DEFAULT_ACCESS_MAX_AGE;
  setCookie(NAMES.ACCESS, accessToken, accessMaxAge);
}

export function persistAuthSession(payload: PersistAuthPayload): void {
  const accessMaxAge = payload.expiresIn && payload.expiresIn > 0 ? payload.expiresIn : DEFAULT_ACCESS_MAX_AGE;

  setCookie(NAMES.ACCESS, payload.accessToken, accessMaxAge);
  setCookie(NAMES.REFRESH, payload.refreshToken, REFRESH_MAX_AGE);
  setCookie(NAMES.MEMBER_ID, String(payload.memberId), META_MAX_AGE);
  setCookie(NAMES.ROLE, payload.role, META_MAX_AGE);
  setCookie(NAMES.USERNAME, payload.username, META_MAX_AGE);
}

export function clearAllAuthCookies(): void {
  (Object.values(NAMES) as string[]).forEach(deleteCookie);
}

/** 앱 부팅 시 동기 복구 (RequireAuth 레이스 방지) */
export function restoreSessionFromCookies(): boolean {
  if (!hasAuthSession()) return false;

  const { isLoggedIn } = useTravelStore.getState();
  if (isLoggedIn) return true;

  useTravelStore.setState({
    isLoggedIn: true,
    username: getUsername() ?? '',
    memberRole: getMemberRole(),
    memberId: getMemberId(),
  });

  return true;
}

/** 예전 localStorage 토큰 → 쿠키 1회 이전 */
export function migrateLegacyLocalStorageAuth(): void {
  const legacyToken = localStorage.getItem('onde_auth_token');
  if (!legacyToken || getAccessToken()) return;

  const refresh = localStorage.getItem('onde_refresh_token') ?? '';
  const memberId = localStorage.getItem('onde_member_id');
  const role = localStorage.getItem('onde_member_role');
  const username = localStorage.getItem('onde_username');

  if (memberId && role && username) {
    persistAuthSession({
      accessToken: legacyToken,
      refreshToken: refresh,
      memberId: Number(memberId),
      role,
      username,
    });
  } else {
    setCookie(NAMES.ACCESS, legacyToken, DEFAULT_ACCESS_MAX_AGE);
    if (refresh) setCookie(NAMES.REFRESH, refresh, REFRESH_MAX_AGE);
    if (memberId) setCookie(NAMES.MEMBER_ID, memberId, META_MAX_AGE);
    if (role) setCookie(NAMES.ROLE, role, META_MAX_AGE);
    if (username) setCookie(NAMES.USERNAME, username, META_MAX_AGE);
  }

  localStorage.removeItem('onde_auth_token');
  localStorage.removeItem('onde_refresh_token');
  localStorage.removeItem('onde_member_id');
  localStorage.removeItem('onde_member_role');
  localStorage.removeItem('onde_username');
}
