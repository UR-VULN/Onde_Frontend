import { isAdminRole } from '@/utils/memberRole';

/** 관리자 포탈 탭 ID */
export type AdminTabId = 'stat' | 'approve' | 'book' | 'user' | 'lbs';

const USER_ADMIN_ROLES = new Set([
  'USER_ADMIN',
  'ROLE_USER_ADMIN',
  'GENERAL_ADMIN',
  'ROLE_GENERAL_ADMIN',
]);

const SELLER_ADMIN_ROLES = new Set([
  'SELLER_ADMIN',
  'ROLE_SELLER_ADMIN',
  'SALES_ADMIN',
  'ROLE_SALES_ADMIN',
]);

const SUPER_ADMIN_ROLES = new Set(['SUPER_ADMIN', 'ROLE_SUPER_ADMIN']);

const SETTLEMENT_ACCESS_ROLES = new Set([
  'SUPER_ADMIN',
  'ROLE_SUPER_ADMIN',
  'SELLER_ADMIN',
  'ROLE_SELLER_ADMIN',
  'SALES_ADMIN',
  'ROLE_SALES_ADMIN',
]);

function normalizeRole(role: string): string {
  return role.trim().toUpperCase();
}

export function isUserAdmin(role: string | null | undefined): boolean {
  if (!role) return false;
  return USER_ADMIN_ROLES.has(normalizeRole(role));
}

/** 영업·판매 관리자 (정산·검수 실행 권한) */
export function isSellerAdmin(role: string | null | undefined): boolean {
  if (!role) return false;
  return SELLER_ADMIN_ROLES.has(normalizeRole(role));
}

export function isSuperAdmin(role: string | null | undefined): boolean {
  if (!role) return false;
  return SUPER_ADMIN_ROLES.has(normalizeRole(role));
}

/** USER_ADMIN — 상품 검수·예약 제어 없이 조회만 */
export function isViewOnlyAdmin(role: string | null | undefined): boolean {
  return isUserAdmin(role);
}

export function canApproveProducts(role: string | null | undefined): boolean {
  if (!role || !isAdminRole(role)) return false;
  return !isViewOnlyAdmin(role);
}

export function canManageMembers(role: string | null | undefined): boolean {
  return isSuperAdmin(role);
}

export function canAccessSettlement(role: string | null | undefined): boolean {
  if (!role || !isAdminRole(role)) return false;
  return SETTLEMENT_ACCESS_ROLES.has(normalizeRole(role));
}

export function canDeployLbsMarkers(role: string | null | undefined): boolean {
  return isSuperAdmin(role) || isUserAdmin(role);
}

export function canAccessLbsCommunity(role: string | null | undefined): boolean {
  return isSuperAdmin(role) || isUserAdmin(role);
}

export function canExportBookingCsv(role: string | null | undefined): boolean {
  return canApproveProducts(role);
}

export function canReadDashboardSummary(role: string | null | undefined): boolean {
  return isSuperAdmin(role) || isSellerAdmin(role);
}

export function canReadDashboardOperational(role: string | null | undefined): boolean {
  return isUserAdmin(role);
}

export function canReadDashboardCharts(role: string | null | undefined): boolean {
  return isSuperAdmin(role) || isSellerAdmin(role);
}

/** 관리자 포탈 탭 접근 — LBS/커뮤니티는 SUPER_ADMIN, USER_ADMIN 전용 */
export function canAccessAdminTab(role: string | null | undefined, tab: AdminTabId): boolean {
  if (!role || !isAdminRole(role)) return false;
  if (tab === 'lbs') return canAccessLbsCommunity(role);
  return true;
}
