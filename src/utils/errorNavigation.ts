const ERROR_PATHS = ['/401', '/403', '/404', '/500', '/503'] as const;

export type AppErrorPath = (typeof ERROR_PATHS)[number];

export function isErrorPagePath(pathname: string): boolean {
  return ERROR_PATHS.includes(pathname as AppErrorPath);
}

/** API/가드에서 에러 전용 페이지로 이동 (백오피스·고객 포탈 공통) */
export function redirectToErrorPage(path: AppErrorPath): void {
  if (window.location.pathname === path) return;
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
