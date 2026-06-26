import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTravelStore } from '@/store/useTravelStore';
import { consumePostLogoutRedirect, restoreSessionFromServer } from '@/utils/authSession';

interface RequireAuthProps {
  children: React.ReactNode;
}

/** 로그인 필요 라우트 — 미인증 시 /401 */
export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const isLoggedIn = useTravelStore((s) => s.isLoggedIn);
  const location = useLocation();
  const [sessionChecked, setSessionChecked] = useState(isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      setSessionChecked(true);
      return;
    }

    let cancelled = false;
    restoreSessionFromServer().finally(() => {
      if (!cancelled) setSessionChecked(true);
    });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  if (!sessionChecked) {
    return null;
  }

  const authed = useTravelStore.getState().isLoggedIn;

  if (!authed) {
    const redirectTo = consumePostLogoutRedirect();
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return <Navigate to="/401" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};
