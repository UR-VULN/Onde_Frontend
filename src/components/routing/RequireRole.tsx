import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTravelStore } from '@/store/useTravelStore';
import { isAdminRole, isSellerRole } from '@/utils/memberRole';

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
    return <Navigate to="/401" replace state={{ from: location.pathname }} />;
  }

  const allowed = guard === 'seller' ? isSellerRole(memberRole) : isAdminRole(memberRole);

  if (!allowed) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
