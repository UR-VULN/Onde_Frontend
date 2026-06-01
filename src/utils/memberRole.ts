/** 백엔드 회원 역할 */
export type ApiMemberRole =
  | 'USER'
  | 'SELLER'
  | 'GENERAL_ADMIN'
  | 'SALES_ADMIN'
  | 'SUPER_ADMIN'
  | string;

export { getMemberRole as readStoredMemberRole, getUsername as readStoredUsername } from '@/utils/authCookies';

const SELLER_ROLE = 'SELLER';

export function isSellerRole(role: string | null | undefined): boolean {
  return role === SELLER_ROLE;
}

export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return role === 'GENERAL_ADMIN' || role === 'SALES_ADMIN' || role === 'SUPER_ADMIN' || role.includes('ADMIN');
}

export function isUserRole(role: string | null | undefined): boolean {
  return !!role && !isSellerRole(role) && !isAdminRole(role);
}

export function getDefaultPathForRole(role: string): string {
  if (isSellerRole(role)) return '/seller';
  if (isAdminRole(role)) return '/admin';
  return '/';
}
