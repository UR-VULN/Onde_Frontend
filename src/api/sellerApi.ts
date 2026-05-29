import { sellerAxios } from '@/api/axiosInstance';

// ─── 명세: PUT/GET /api/v1/seller/settlements/accounts ───

export interface SellerSettlementAccountPayload {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  businessNumber: string;
  representativeName: string;
  openedAt: string;
}

export interface SellerSettlementAccountDto extends SellerSettlementAccountPayload {
  sellerId: number;
  createdAt?: string;
}

export const get_seller_settlement_account_api = async (): Promise<{
  success: boolean;
  data: SellerSettlementAccountDto;
  message: string;
}> => {
  return sellerAxios.get('/api/v1/seller/settlements/accounts');
};

export const put_seller_settlement_account_api = async (
  payload: SellerSettlementAccountPayload
): Promise<{ success: boolean; data: SellerSettlementAccountDto; message: string }> => {
  return sellerAxios.put('/api/v1/seller/settlements/accounts', payload);
};

/** @deprecated put_seller_settlement_account_api */
export const save_seller_profile_api = async (payload: {
  businessName: string;
  contactPhone: string;
  address: string;
  businessNumber: string;
  representativeName: string;
  openDate: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}): Promise<{ success: boolean; message: string }> => {
  const res = await put_seller_settlement_account_api({
    bankName: payload.bankName,
    accountNumber: payload.accountNumber,
    accountHolder: payload.accountHolder,
    businessNumber: payload.businessNumber,
    representativeName: payload.representativeName,
    openedAt: payload.openDate.replace(/-/g, ''),
  });
  return { success: res.success, message: res.message };
};

// ─── 명세: GET /api/v1/seller/settlements ───

export interface SellerSettlementDto {
  settlementId: number;
  settlementMonth: string;
  grossAmount: number;
  commission: number;
  netAmount: number;
  status: string;
}

export interface SellerSettlementsResponse {
  settlements: SellerSettlementDto[];
  totalCount: number;
}

export const get_seller_settlements_api = async (
  year?: number,
  page = 0,
  size = 12
): Promise<{ success: boolean; data: SellerSettlementsResponse; message: string }> => {
  return sellerAxios.get('/api/v1/seller/settlements', { params: { year, page, size } });
};

/** 명세: POST /api/v1/seller/settlements/{settlementId}/request */
export const request_settlement_api = async (
  settlementId: number
): Promise<{ success: boolean; data: { settlementId: number; status: string }; message: string }> => {
  return sellerAxios.post(`/api/v1/seller/settlements/${settlementId}/request`);
};

/** @deprecated request_settlement_api(settlementId) — UI에서 settlementId 전달 필요 */
export const request_monthly_settlement_api = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const list = await get_seller_settlements_api(new Date().getFullYear());
  const pending = list.data?.settlements?.[0];
  if (!pending) {
    return { success: false, message: '정산 대상이 없습니다.' };
  }
  const res = await request_settlement_api(pending.settlementId);
  return { success: res.success, message: res.message };
};

// ─── 명세: GET /api/v1/seller/dashboard/statistics ───

export interface SellerDashboardStatisticsDto {
  period: string;
  totalRevenue: number;
  dailyRevenue?: number[];
  breakdown: Array<{ month: string; revenue: number; bookingCount: number }>;
}

export const get_seller_dashboard_statistics_api = async (params?: {
  period?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ success: boolean; data: SellerDashboardStatisticsDto; message: string }> => {
  return sellerAxios.get('/api/v1/seller/dashboard/statistics', { params });
};

/** UI 호환 */
export interface SellerSalesStatDto {
  totalSalesAmount: number;
  completedBookingsCount: number;
  settlementPendingAmount: number;
  commissionRate: number;
  month: string;
}

export const get_seller_sales_stat_api = async (): Promise<{
  success: boolean;
  data: SellerSalesStatDto;
  message: string;
}> => {
  const res = await get_seller_dashboard_statistics_api({
    period: 'MONTHLY',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  });
  if (!res.success || !res.data) {
    return {
      success: false,
      data: {
        totalSalesAmount: 0,
        completedBookingsCount: 0,
        settlementPendingAmount: 0,
        commissionRate: 0.1,
        month: '',
      },
      message: res.message,
    };
  }
  const last = res.data.breakdown[res.data.breakdown.length - 1];
  return {
    success: true,
    message: res.message,
    data: {
      totalSalesAmount: res.data.totalRevenue,
      completedBookingsCount: last?.bookingCount ?? 0,
      settlementPendingAmount: Math.floor(res.data.totalRevenue * 0.1),
      commissionRate: 0.1,
      month: last?.month ?? '',
    },
  };
};

export interface SellerSettlementHistoryDto {
  settlementMonth: string;
  netAmount: number;
  status: string;
  requestedAt: string;
}

export const get_seller_settlement_history_api = async (): Promise<{
  success: boolean;
  data: SellerSettlementHistoryDto[];
  message: string;
}> => {
  const res = await get_seller_settlements_api();
  const mapped =
    res.data?.settlements.map((s) => ({
      settlementMonth: s.settlementMonth,
      netAmount: s.netAmount,
      status: s.status,
      requestedAt: s.settlementMonth,
    })) ?? [];
  return { success: res.success, data: mapped, message: res.message };
};

// ─── 명세 외 UI 전용 (Mock에서만 응답) ───

export interface BusinessVerifyPayload {
  businessNumber: string;
  representativeName: string;
  openDate: string;
}

export const verify_business_api = async (
  payload: BusinessVerifyPayload
): Promise<{ success: boolean; verified: boolean; message: string }> => {
  return sellerAxios.post('/api/v1/seller/account/verify-business', payload);
};

export interface SellerReviewDto {
  reviewId: number;
  guestName: string;
  guestInitials: string;
  guestColor?: string;
  rating: number;
  content: string;
  productName: string;
  reviewedAt: string;
  hostReply?: string;
  repliedAt?: string;
}

export const get_seller_reviews_api = async (): Promise<{
  success: boolean;
  data: SellerReviewDto[];
  message: string;
}> => {
  return sellerAxios.get('/api/v1/seller/reviews');
};

export const post_seller_review_reply_api = async (
  reviewId: number,
  reply: string
): Promise<{ success: boolean; message: string }> => {
  return sellerAxios.post(`/api/v1/seller/reviews/${reviewId}/reply`, { reply });
};

export const update_seller_review_reply_api = async (
  reviewId: number,
  reply: string
): Promise<{ success: boolean; message: string }> => {
  return sellerAxios.put(`/api/v1/seller/reviews/${reviewId}/reply`, { reply });
};

export const delete_seller_review_reply_api = async (
  reviewId: number
): Promise<{ success: boolean; message: string }> => {
  return sellerAxios.delete(`/api/v1/seller/reviews/${reviewId}/reply`);
};

// ─── 판매자 숙소·렌터카 재고 ───

export interface SellerPropertyDto {
  propertyId: number;
  name: string;
  status: 'ACTIVE' | 'PENDING';
  basePrice: number;
}

export interface SellerCarInventoryDto {
  propertyId: number;
  name: string;
  stock: number;
  basePrice: number;
}

export const get_seller_accommodations_api = async (): Promise<{
  success: boolean;
  data: SellerPropertyDto[];
  message: string;
}> => {
  return sellerAxios.get('/api/v1/seller/accommodations');
};

export const get_seller_cars_inventory_api = async (): Promise<{
  success: boolean;
  data: SellerCarInventoryDto[];
  message: string;
}> => {
  return sellerAxios.get('/api/v1/seller/cars');
};

export interface SellerCalendarCellDto {
  scheduleId?: number;
  day?: number;
  stock: number;
  price: number;
  isClosed?: boolean;
}

export const get_seller_inventory_calendar_api = async (params: {
  propertyKey: string;
  month?: string;
}): Promise<{ success: boolean; data: Record<number, SellerCalendarCellDto>; message: string }> => {
  return sellerAxios.get('/api/v1/seller/inventory/calendar', { params });
};

export const patch_seller_inventory_day_api = async (payload: {
  propertyKey: string;
  day: number;
  stock: number;
  price: number;
}): Promise<{ success: boolean; message: string }> => {
  return sellerAxios.patch('/api/v1/seller/inventory/calendar', payload);
};

export const get_seller_schedule_calendar_api = async (params?: {
  origin?: string;
  dest?: string;
  month?: string;
}): Promise<{ success: boolean; data: unknown[]; message: string }> => {
  return sellerAxios.get('/api/v1/seller/schedules/calendar', { params });
};

export const register_seller_flight_api = async (
  payload: Record<string, unknown>
): Promise<{ success: boolean; message: string }> => {
  return sellerAxios.post('/api/v1/seller/flights', payload);
};
