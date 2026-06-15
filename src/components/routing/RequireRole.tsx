import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTravelStore } from '@/store/useTravelStore';
import { canAccessSettlement } from '@/utils/adminPermissions';
import { isAdminRole, isSellerRole } from '@/utils/memberRole';
import { consumePostLogoutRedirect } from '@/utils/authSession';

export type RoleGuard = 'seller' | 'admin';

interface RequireRoleProps {
  guard: RoleGuard;
  children: React.ReactNode;
}

/**
 * 로그인 + 역할 검증
 * - 미로그인 → /401
 * - 권한 불일치 → /403
 */
export const RequireRole: React.FC<RequireRoleProps> = ({ guard, children }) => {
  const isLoggedIn = useTravelStore((s) => s.isLoggedIn);
  const memberRole = useTravelStore((s) => s.memberRole);
  const location = useLocation();

  if (!isLoggedIn) {
    if (guard === 'admin') {
      return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    }
    const redirectTo = consumePostLogoutRedirect();
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return <Navigate to="/401" replace state={{ from: location.pathname }} />;
  }

  const allowed = guard === 'seller' ? isSellerRole(memberRole) : isAdminRole(memberRole);

  if (!allowed) {
    return <Navigate to="/403" replace />;
  }

  if (location.pathname.startsWith('/admin/settlement') && !canAccessSettlement(memberRole)) {
    useTravelStore.getState().addToast('해당 기능(정산 승인)에 접근할 권한이 없습니다.', 'warning');
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
