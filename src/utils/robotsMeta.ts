const ROBOTS_META_NAME = 'robots';
const NOINDEX_CONTENT = 'noindex, nofollow';

export function applyRobotsNoIndex(): void {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${ROBOTS_META_NAME}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = ROBOTS_META_NAME;
    document.head.appendChild(meta);
  }
  meta.content = NOINDEX_CONTENT;
}

export function clearRobotsNoIndex(): void {
  document.querySelector(`meta[name="${ROBOTS_META_NAME}"]`)?.remove();
}

export function shouldBlockSearchIndexing(pathname: string, hostname: string): boolean {
  if (pathname === '/seller' || pathname.startsWith('/seller/')) {
    return true;
  }

  const normalizedHost = hostname.toLowerCase();
  if (normalizedHost === 'rookies.onde.click' || normalizedHost.startsWith('rookies.')) {
    return true;
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    if (pathname === '/rookies-console' || pathname.startsWith('/rookies-console/')) {
      return true;
    }
  }

  return false;
}
