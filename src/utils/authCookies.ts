/**
 * 레거시 JS 접근 가능 인증 저장소 정리.
 * JWT·세션 메타는 서버 HttpOnly 쿠키 + API(/members/me)만 사용.
 */

const LEGACY_COOKIE_NAMES = [
  'onde_access_token',
  'onde_refresh_token',
  'onde_member_id',
  'onde_member_role',
  'onde_username',
  'onde_name',
  'onde_nickname',
  'accessToken',
  'refreshToken',
] as const;

const LEGACY_LOCAL_STORAGE_KEYS = [
  'onde_auth_token',
  'onde_refresh_token',
  'onde_member_id',
  'onde_member_role',
  'onde_username',
] as const;

function deleteCookie(name: string): void {
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
}

/** 예전 JS 쿠키·localStorage 잔여물 삭제 */
export function purgeLegacyAuthStorage(): void {
  LEGACY_COOKIE_NAMES.forEach(deleteCookie);
  LEGACY_LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}
