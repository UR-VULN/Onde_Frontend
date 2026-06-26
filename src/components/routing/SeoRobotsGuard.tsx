import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyRobotsNoIndex, clearRobotsNoIndex, shouldBlockSearchIndexing } from '@/utils/robotsMeta';

/**
 * 관리자·판매자 등 비공개 화면에 robots noindex 메타 태그를 동적으로 적용합니다.
 */
export const SeoRobotsGuard: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const hostname = window.location.hostname;
    if (shouldBlockSearchIndexing(pathname, hostname)) {
      applyRobotsNoIndex();
      return () => clearRobotsNoIndex();
    }
    clearRobotsNoIndex();
    return undefined;
  }, [pathname]);

  return null;
};
