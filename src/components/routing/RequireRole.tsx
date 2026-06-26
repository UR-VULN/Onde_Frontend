import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTravelStore } from '@/store/useTravelStore';
import { canAccessSettlement } from '@/utils/adminPermissions';
import { isAdminRole, isSellerRole } from '@/utils/memberRole';
import { consumePostLogoutRedirect, restoreSessionFromServer } from '@/utils/authSession';
import {
  getAdminHomePath,
  getAdminLoginPath,
  isAdminSettlementPath,
} from '@/constants/adminPortal';

export type RoleGuard = 'seller' | 'admin';

interface RequireRoleProps {
  guard: RoleGuard;
  children: React.ReactNode;
}

/**
 * 로그인 + 역할 검증
 * - 미로그인 → /401 (또는 관리자 로그인)
 * - 권한 불일치 → /403
 */
export const RequireRole: React.FC<RequireRoleProps> = ({ guard, children }) => {
  const isLoggedIn = useTravelStore((s) => s.isLoggedIn);
  const memberRole = useTravelStore((s) => s.memberRole);
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
  const role = useTravelStore.getState().memberRole;

  if (!authed) {
    if (guard === 'admin') {
      return <Navigate to={getAdminLoginPath()} replace state={{ from: location.pathname }} />;
    }
    const redirectTo = consumePostLogoutRedirect();
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return <Navigate to="/401" replace state={{ from: location.pathname }} />;
  }

  const allowed = guard === 'seller' ? isSellerRole(role) : isAdminRole(role);

  if (!allowed) {
    return <Navigate to="/403" replace />;
  }

  if (isAdminSettlementPath(location.pathname) && !canAccessSettlement(memberRole)) {
    useTravelStore.getState().addToast('해당 기능(정산 승인)에 접근할 권한이 없습니다.', 'warning');
    return <Navigate to={getAdminHomePath()} replace />;
  }

  return <>{children}</>;
};
