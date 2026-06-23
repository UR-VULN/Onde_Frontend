/**
 * 인증 정보 쿠키 저장소
 */
import { useTravelStore } from '@/store/useTravelStore';

const NAMES = {
  ACCESS: 'onde_access_token',
  REFRESH: 'onde_refresh_token',
  MEMBER_ID: 'onde_member_id',
  ROLE: 'onde_member_role',
  USERNAME: 'onde_username',
  NAME: 'onde_name',
  NICKNAME: 'onde_nickname',
} as const;

const LEGACY_NAMES = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
} as const;

const DEFAULT_ACCESS_MAX_AGE = 60 * 60 * 24 * 7;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
const META_MAX_AGE = 60 * 60 * 24 * 30;

function cookieFlags(maxAge?: number): string {
  const parts = ['path=/', 'SameSite=Lax'];
  if (maxAge != null) parts.push(`max-age=${maxAge}`);
  if (import.meta.env.PROD && window.location.protocol === 'https:') parts.push('Secure');
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
  return getCookie(NAMES.ACCESS) ?? getCookie(LEGACY_NAMES.ACCESS);
}

export function getRefreshToken(): string | null {
  return getCookie(NAMES.REFRESH) ?? getCookie(LEGACY_NAMES.REFRESH);
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

export function getName(): string | null {
  return getCookie(NAMES.NAME);
}

export function getNickname(): string | null {
  return getCookie(NAMES.NICKNAME);
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

export function updateAccessToken(accessToken: string, expiresIn?: number): void {
  const accessMaxAge = expiresIn && expiresIn > 0 ? expiresIn : DEFAULT_ACCESS_MAX_AGE;
  deleteCookie(LEGACY_NAMES.ACCESS);
  if (accessToken) setCookie(NAMES.ACCESS, accessToken, accessMaxAge);
}

export function persistAuthSession(payload: PersistAuthPayload): void {
  const accessMaxAge = payload.expiresIn && payload.expiresIn > 0 ? payload.expiresIn : DEFAULT_ACCESS_MAX_AGE;
  deleteCookie(LEGACY_NAMES.ACCESS);
  deleteCookie(LEGACY_NAMES.REFRESH);
  if (payload.accessToken) setCookie(NAMES.ACCESS, payload.accessToken, accessMaxAge);
  if (payload.refreshToken) setCookie(NAMES.REFRESH, payload.refreshToken, REFRESH_MAX_AGE);
  setCookie(NAMES.MEMBER_ID, String(payload.memberId), META_MAX_AGE);
  setCookie(NAMES.ROLE, payload.role, META_MAX_AGE);
  setCookie(NAMES.USERNAME, payload.username, META_MAX_AGE);
  setCookie(NAMES.NAME, payload.name ?? '', META_MAX_AGE);
  setCookie(NAMES.NICKNAME, payload.nickname ?? '', META_MAX_AGE);
}

export function clearAllAuthCookies(): void {
  (Object.values(NAMES) as string[]).forEach(deleteCookie);
  (Object.values(LEGACY_NAMES) as string[]).forEach(deleteCookie);
}

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
  }
  localStorage.removeItem('onde_auth_token');
  localStorage.removeItem('onde_refresh_token');
  localStorage.removeItem('onde_member_id');
  localStorage.removeItem('onde_member_role');
  localStorage.removeItem('onde_username');
}