import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTravelStore } from '@/store/useTravelStore';
import { hasAuthSession, restoreSessionFromCookies } from '@/utils/authCookies';
import { consumePostLogoutRedirect } from '@/utils/authSession';

interface RequireAuthProps {
  children: React.ReactNode;
}

/** 로그인 필요 라우트 — 미인증 시 /401 */
export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const isLoggedIn = useTravelStore((s) => s.isLoggedIn);
  const location = useLocation();

  if (!isLoggedIn && hasAuthSession()) {
    restoreSessionFromCookies();
  }

  const authed = useTravelStore((s) => s.isLoggedIn);

  if (!authed && !hasAuthSession()) {
    const redirectTo = consumePostLogoutRedirect();
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return <Navigate to="/401" replace state={{ from: location.pathname }} />;
  }

  if (!authed) {
    return null;
  }

  return <>{children}</>;
};
