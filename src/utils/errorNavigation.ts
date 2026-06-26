import { getDefaultPathForRole, readStoredMemberRole } from '@/utils/memberRole';
import { isAdminBackofficePath } from '@/constants/adminPortal';

const ERROR_PATHS = ['/401', '/403', '/404', '/500', '/503'] as const;

export type AppErrorPath = (typeof ERROR_PATHS)[number];

const ERROR_RETURN_KEY = 'onde_error_return_to';

const BACKOFFICE_PATH_PREFIXES = ['/seller'] as const;

export function isErrorPagePath(pathname: string): boolean {
  return ERROR_PATHS.includes(pathname as AppErrorPath);
}

export function isBackofficePath(pathname: string): boolean {
  if (isAdminBackofficePath(pathname)) {
    return true;
  }
  return BACKOFFICE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** 에러 페이지 이동 직전 백오피스·관리자 URL 저장 (복귀 버튼용) */
export function saveErrorReturnPath(): void {
  const path = window.location.pathname;
  if (isErrorPagePath(path) || !isBackofficePath(path)) return;
  try {
    sessionStorage.setItem(ERROR_RETURN_KEY, path);
  } catch {
    /* ignore */
  }
}

export function consumeErrorReturnPath(): string | null {
  try {
    const path = sessionStorage.getItem(ERROR_RETURN_KEY);
    if (path) sessionStorage.removeItem(ERROR_RETURN_KEY);
    if (path && isBackofficePath(path)) return path;
  } catch {
    /* ignore */
  }
  return null;
}

/** 에러 화면 «돌아가기»: 저장 path → role 기본 경로 → 고객 메인 */
export function resolveErrorHomePath(role: string | null | undefined): string {
  const saved = consumeErrorReturnPath();
  if (saved) return saved;

  const effectiveRole = role ?? readStoredMemberRole();
  if (effectiveRole) return getDefaultPathForRole(effectiveRole);

  return '/';
}

/** API/가드에서 에러 전용 페이지로 이동 (백오피스·고객 포탈 공통) */
export function redirectToErrorPage(path: AppErrorPath): void {
  if (window.location.pathname === path) return;
  saveErrorReturnPath();
  window.location.assign(path);
}

export function redirectByHttpStatus(status: number): void {
  switch (status) {
    case 401:
      redirectToErrorPage('/401');
      break;
    case 403:
      redirectToErrorPage('/403');
      break;
    case 404:
      redirectToErrorPage('/404');
      break;
    case 500:
      redirectToErrorPage('/500');
      break;
    case 503:
      redirectToErrorPage('/503');
      break;
    default:
      break;
  }
}
