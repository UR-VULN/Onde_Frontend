/** 백엔드 회원 역할 */
export type ApiMemberRole =
  | 'USER'
  | 'SELLER'
  | 'GENERAL_ADMIN'
  | 'SALES_ADMIN'
  | 'SUPER_ADMIN'
  | string;

import { useTravelStore } from '@/store/useTravelStore';
import { getAdminHomePath } from '@/constants/adminPortal';

export function readStoredMemberRole(): string | null {
  return useTravelStore.getState().memberRole;
}

export function readStoredUsername(): string {
  return useTravelStore.getState().username;
}

export function readStoredMemberId(): number | null {
  return useTravelStore.getState().memberId;
}

const SELLER_ROLES = new Set(['SELLER', 'ROLE_SELLER']);

const ADMIN_ROLES = new Set([
  'USER_ADMIN',
  'ROLE_USER_ADMIN',
  'SELLER_ADMIN',
  'ROLE_SELLER_ADMIN',
  'SUPER_ADMIN',
  'ROLE_SUPER_ADMIN',
  'GENERAL_ADMIN',
  'ROLE_GENERAL_ADMIN',
  'SALES_ADMIN',
  'ROLE_SALES_ADMIN',
]);

function normalizeRole(role: string): string {
  return role.trim().toUpperCase();
}

export function isSellerRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return SELLER_ROLES.has(normalizeRole(role));
}

export function isAdminRole(role: string | null | undefined): boolean {
  if (!role || isSellerRole(role)) return false;
  return ADMIN_ROLES.has(normalizeRole(role));
}

export function isUserRole(role: string | null | undefined): boolean {
  return !!role && !isSellerRole(role) && !isAdminRole(role);
}

export function getDefaultPathForRole(role: string): string {
  if (isSellerRole(role)) return '/seller';
  if (isAdminRole(role)) return getAdminHomePath();
  return '/';
}
