/**
 * 관리자 포털 도메인·경로 설정.
 * 배포 시 VITE_ADMIN_LOGIN_SEGMENT 등으로 로그인 URL을 변경할 수 있습니다.
 */
const ADMIN_LOCAL_BASE_PATH = (
  import.meta.env.VITE_ADMIN_LOCAL_BASE_PATH || '/rookies-console'
).replace(/\/$/, '');

const ADMIN_LOGIN_SEGMENT = (
  import.meta.env.VITE_ADMIN_LOGIN_SEGMENT || 'onde-entry-8k2p'
).replace(/^\//, '');

/** 레거시 경로 — 접근 시 404 처리 */
export const LEGACY_ADMIN_PATH_PREFIX = '/admin';

export function isAdminPortalHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  if (normalized === 'localhost' || normalized === '127.0.0.1') {
    return false;
  }
  return normalized === 'rookies.onde.click' || normalized.startsWith('rookies.');
}

export function isAdminPortalContext(hostname: string, pathname: string): boolean {
  if (isAdminPortalHost(hostname)) {
    return true;
  }
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return (
      pathname === ADMIN_LOCAL_BASE_PATH ||
      pathname.startsWith(`${ADMIN_LOCAL_BASE_PATH}/`)
    );
  }
  return false;
}

export function getAdminLoginPath(hostname: string = window.location.hostname): string {
  if (isAdminPortalHost(hostname)) {
    return `/${ADMIN_LOGIN_SEGMENT}`;
  }
  return `${ADMIN_LOCAL_BASE_PATH}/${ADMIN_LOGIN_SEGMENT}`;
}

export function getAdminHomePath(hostname: string = window.location.hostname): string {
  return isAdminPortalHost(hostname) ? '/' : ADMIN_LOCAL_BASE_PATH;
}

export function getAdminSettlementPath(hostname: string = window.location.hostname): string {
  return isAdminPortalHost(hostname)
    ? '/settlement'
    : `${ADMIN_LOCAL_BASE_PATH}/settlement`;
}

export function isLegacyAdminPath(pathname: string): boolean {
  return (
    pathname === LEGACY_ADMIN_PATH_PREFIX ||
    pathname.startsWith(`${LEGACY_ADMIN_PATH_PREFIX}/`)
  );
}

export function isAdminSettlementPath(
  pathname: string,
  hostname: string = window.location.hostname
): boolean {
  const settlement = getAdminSettlementPath(hostname);
  return pathname === settlement || pathname.startsWith(`${settlement}/`);
}

export function isAdminBackofficePath(pathname: string): boolean {
  if (isLegacyAdminPath(pathname)) {
    return true;
  }

  const host = window.location.hostname;
  if (!isAdminPortalContext(host, pathname)) {
    return false;
  }

  const login = getAdminLoginPath(host);
  const settlement = getAdminSettlementPath(host);
  const home = getAdminHomePath(host);

  if (pathname === login || pathname === settlement) {
    return true;
  }

  if (home === '/') {
    return pathname === '/' || pathname === '/settlement';
  }

  return pathname === home || pathname.startsWith(`${home}/`);
}

/** 관리자 서브도메인 → 일반 서비스 메인 URL */
export function resolveMainSiteUrl(
  hostname: string = window.location.hostname,
  protocol: string = window.location.protocol,
  port: string = window.location.port
): string {
  const portSuffix = port ? `:${port}` : '';
  if (isAdminPortalHost(hostname)) {
    if (hostname.endsWith('.onde.click')) {
      return `${protocol}//onde.click${portSuffix}`;
    }
    const mainHost = hostname.replace(/^rookies\./, '');
    return `${protocol}//${mainHost}${portSuffix}`;
  }
  return '/';
}
