import { sellerAxios } from '@/api/axiosInstance';
import { unwrapApi } from '@/utils/apiResponse';

const PLATFORM_COMMISSION_RATE = 0.03;

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
  const raw = await sellerAxios.get('/api/v1/seller/settlements/accounts');
  return unwrapApi<SellerSettlementAccountDto>(raw);
};



export const put_seller_settlement_account_api = async (
  payload: SellerSettlementAccountPayload
): Promise<{ success: boolean; data: SellerSettlementAccountDto | null; message: string }> => {
  const raw = await sellerAxios.put('/api/v1/seller/settlements/accounts', payload);
  const res = unwrapApi<SellerSettlementAccountDto | null>(raw);
  return {
    success: res.success,
    message: res.message,
    data: res.data ?? null,
  };
};

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

export interface SellerSettlementDto {
  settlementId: number;
  settlementMonth: string;
  grossAmount: number;
  commission: number;
  netAmount: number;
  status: string;
}

function mapSettlementItem(raw: Record<string, unknown>): SellerSettlementDto {
  const dateRaw = raw.settlementDate ?? raw.settlementMonth;
  let settlementMonth = '';
  if (typeof dateRaw === 'string') {
    settlementMonth = dateRaw.length >= 7 ? dateRaw.slice(0, 7) : dateRaw;
  }
  return {
    settlementId: Number(raw.id ?? raw.settlementId ?? 0),
    settlementMonth,
    grossAmount: Number(raw.grossAmount ?? 0),
    commission: Number(raw.commission ?? 0),
    netAmount: Number(raw.netAmount ?? 0),
    status: String(raw.status ?? ''),
  };
}

export interface SellerSettlementsResponse {
  settlements: SellerSettlementDto[];
  totalCount: number;
}

export const get_seller_settlements_api = async (
  page = 0,
  size = 12
): Promise<{ success: boolean; data: SellerSettlementsResponse; message: string }> => {
  const raw = await sellerAxios.get('/api/v1/seller/settlements', { params: { page, size } });
  const res = unwrapApi<{ settlements: Array<Record<string, unknown>>; totalCount: number }>(raw);
  const settlements = (res.data?.settlements ?? []).map(mapSettlementItem);
  return {
    success: res.success,
    message: res.message,
    data: { settlements, totalCount: res.data?.totalCount ?? settlements.length },
  };
};

export const request_settlement_api = async (
  settlementId: number
): Promise<{ success: boolean; data: { settlementId: number; status: string }; message: string }> => {
  const raw = await sellerAxios.post(`/api/v1/seller/settlements/${settlementId}/request`);
  return unwrapApi<{ settlementId: number; status: string }>(raw);
};

export const request_monthly_settlement_api = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const list = await get_seller_settlements_api(0, 20);
  if (!list.success) return { success: false, message: list.message };
  const pending = list.data?.settlements?.find((s) => s.status === 'PENDING');
  if (!pending) {
    // PENDING 상태인 정산 건이 없는 경우, 실시간 집계 및 신청 API를 호출합니다.
    try {
      const raw = await sellerAxios.post('/api/v1/seller/settlements/request-realtime');
      const res = unwrapApi<{ settlementId: number; status: string }>(raw);
      return { success: res.success, message: res.message };
    } catch (err: any) {
      return { success: false, message: err?.error?.message || '실시간 정산 신청 중 오류가 발생했습니다.' };
    }
  }
  const res = await request_settlement_api(pending.settlementId);
  return { success: res.success, message: res.message };
};

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
  const now = new Date();
  const year = now.getFullYear();
  const defaults = {
    period: params?.period ?? 'MONTHLY',
    startDate: params?.startDate ?? `${year}-01-01`,
    endDate: params?.endDate ?? `${year}-12-31`,
  };
  const raw = await sellerAxios.get('/api/v1/seller/dashboard/statistics', { params: defaults });
  return unwrapApi<SellerDashboardStatisticsDto>(raw);
};

export interface RecentReservationDto {
  id: number;
  customerName: string;
  targetType: 'STAY' | 'CAR' | 'FLIGHT';
  productName: string;
  schedule: string;
  price: number;
  status: string;
}

export interface SellerDashboardDto {
  email: string;
  accountStatus: string | null;
  bankName: string | null;
  accountNumber: string | null;
  accommodationCount: number;
  carCount: number;
  flightRouteCount: number;
  stayRevenue: number;
  carRevenue: number;
  flightRevenue: number;
  totalRevenue: number;
  recentReservations: RecentReservationDto[];
}

export const get_seller_dashboard_api = async (): Promise<{
  success: boolean;
  data: SellerDashboardDto;
  message: string;
}> => {
  const raw = await sellerAxios.get('/api/v1/seller/dashboard');
  return unwrapApi<SellerDashboardDto>(raw);
};


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
  const year = new Date().getFullYear();
  const [res, settlementsRes] = await Promise.all([
    get_seller_dashboard_statistics_api({
      period: 'MONTHLY',
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
    }),
    get_seller_settlements_api(0, 100).catch(() => null),
  ]);
  if (!res.success || !res.data) {
    return {
      success: false,
      data: {
        totalSalesAmount: 0,
        completedBookingsCount: 0,
        settlementPendingAmount: 0,
        commissionRate: PLATFORM_COMMISSION_RATE,
        month: '',
      },
      message: res.message,
    };
  }
  const last = res.data.breakdown?.[res.data.breakdown.length - 1];
  const completedBookingsCount =
    res.data.breakdown?.reduce((sum, item) => sum + Number(item.bookingCount ?? 0), 0) ?? 0;
  const totalSalesAmount = settlementsRes?.success
    ? settlementsRes.data.settlements
        .filter((s) => s.status === 'COMPLETED')
        .reduce((sum, item) => sum + item.netAmount, 0)
    : 0;
  const settlementPendingAmount =
    settlementsRes?.success
      ? settlementsRes.data.settlements
          .filter((s) => s.status === 'REQUESTED' || s.status === 'APPROVED_1ST')
          .reduce((sum, item) => sum + item.netAmount, 0)
      : 0;
  return {
    success: true,
    message: res.message,
    data: {
      totalSalesAmount,
      completedBookingsCount,
      settlementPendingAmount,
      commissionRate: PLATFORM_COMMISSION_RATE,
      month: last?.month ?? '',
    },
  };
};

export interface SellerSettlementHistoryDto {
  settlementId: number;
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
      settlementId: s.settlementId,
      settlementMonth: s.settlementMonth,
      netAmount: s.netAmount,
      status: s.status,
      requestedAt: s.settlementMonth,
    })) ?? [];
  return { success: res.success, data: mapped, message: res.message };
};

export interface SettlementDetailItemDto {
  paymentId: number;
  reservationId: number;
  targetType: string;
  productName: string;
  amount: number;
  paymentDate: string;
}

export interface SettlementDetailResponseDto {
  settlementId: number;
  settlementDate: string;
  details: SettlementDetailItemDto[];
}

export const get_seller_settlement_detail_api = async (
  settlementId: number
): Promise<{ success: boolean; data: SettlementDetailResponseDto | null; message: string }> => {
  const raw = await sellerAxios.get(`/api/v1/seller/settlements/${settlementId}/details`);
  return unwrapApi<SettlementDetailResponseDto | null>(raw);
};

export interface BusinessVerifyPayload {
  businessNumber: string;
  representativeName: string;
  openDate: string;
}

export const verify_business_api = async (
  payload: BusinessVerifyPayload
): Promise<{ success: boolean; verified: boolean; message: string }> => {
  const raw = await sellerAxios.post('/api/v1/seller/account/verify-business', {
    businessNumber: payload.businessNumber.replace(/\D/g, ''),
    representativeName: payload.representativeName.trim(),
    openDate: payload.openDate.replace(/\D/g, ''),
  });
  const res = unwrapApi<{ verified?: boolean }>(raw);
  return {
    success: res.success,
    verified: Boolean(res.data?.verified),
    message: res.message,
  };
};

export interface SellerPropertyDto {
  propertyId: number;
  name: string;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
  basePrice: number;
}

export interface SellerCarInventoryDto {
  propertyId: number;
  name: string;
  stock: number;
  basePrice: number;
  status?: 'ACTIVE' | 'PENDING' | 'REJECTED';
}

/** 동일 모델명(차종)끼리 묶은 판매자 렌터카 그룹 */
export interface SellerCarModelGroup {
  modelName: string;
  groupKey: string;
  vehicles: SellerCarInventoryDto[];
  vehicleCount: number;
  totalStock: number;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
}

export function groupSellerCarsByModel(cars: SellerCarInventoryDto[]): SellerCarModelGroup[] {
  const byModel = new Map<string, SellerCarInventoryDto[]>();

  for (const car of cars) {
    const key = car.name.trim();
    const list = byModel.get(key) ?? [];
    list.push(car);
    byModel.set(key, list);
  }

  return Array.from(byModel.entries())
    .map(([modelName, vehicles]) => {
      const prices = vehicles.map((v) => v.basePrice);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return {
        modelName,
        groupKey: `model:${modelName}`,
        vehicles,
        vehicleCount: vehicles.length,
        totalStock: vehicles.reduce((sum, v) => sum + v.stock, 0),
        basePrice: vehicles[0].basePrice,
        minPrice,
        maxPrice,
      };
    })
    .sort((a, b) => a.modelName.localeCompare(b.modelName, 'ko'));
}

export interface SellerAccommodationRegisterPayload {
  name: string;
  description: string;
  category: string;
  location: string;
  businessLicense: string;
  thumbnailUrl?: string;
  thumbnailFile?: File | null;
  latitude?: number;
  longitude?: number;
  rooms: Array<{
    name: string;
    capacity: number;
    baseCapacity: number;
    extraPersonFee: number;
  }>;
}

export interface SellerCarRegisterPayload {
  licensePlate: string;
  modelName: string;
  carType: string;
  dailyPrice: number;
  location?: string;
  thumbnailFile?: File | null;
}

export const register_seller_accommodation_api = async (
  payload: SellerAccommodationRegisterPayload
): Promise<{
  success: boolean;
  message: string;
  data: { accommodationId: number; name: string; approvalStatus?: string } | null;
}> => {
  if (payload.thumbnailFile) {
    const form = new FormData();
    form.append('thumbnail', payload.thumbnailFile);
    form.append('name', payload.name);
    form.append('description', payload.description);
    form.append('category', payload.category);
    form.append('location', payload.location);
    if (payload.businessLicense) form.append('businessLicense', payload.businessLicense);
    if (payload.rooms) form.append('rooms', JSON.stringify(payload.rooms));
    if (payload.latitude != null) form.append('latitude', String(payload.latitude));
    if (payload.longitude != null) form.append('longitude', String(payload.longitude));

    const raw = await sellerAxios.post('/api/v1/seller/accommodations', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const res = unwrapApi<{ accommodationId: number; name: string; approvalStatus?: string }>(raw);
    return { success: res.success, message: res.message, data: res.data ?? null };
  }

  const { thumbnailFile: _thumbnailFile, ...jsonPayload } = payload;
  const raw = await sellerAxios.post('/api/v1/seller/accommodations', jsonPayload);
  const res = unwrapApi<{ accommodationId: number; name: string; approvalStatus?: string }>(raw);
  return { success: res.success, message: res.message, data: res.data ?? null };
};

export const register_seller_car_api = async (
  payload: SellerCarRegisterPayload
): Promise<{ success: boolean; message: string; data: number | null }> => {
  if (payload.thumbnailFile) {
    const form = new FormData();
    form.append('thumbnail', payload.thumbnailFile);
    form.append('licensePlate', payload.licensePlate);
    form.append('modelName', payload.modelName);
    form.append('carType', payload.carType);
    form.append('dailyPrice', String(payload.dailyPrice));
    if (payload.location) form.append('location', payload.location);

    const raw = await sellerAxios.post('/api/v1/seller/cars', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const res = unwrapApi<number>(raw);
    return { success: res.success, message: res.message, data: res.data ?? null };
  }

  const { thumbnailFile: _thumbnailFile, ...jsonPayload } = payload;
  const raw = await sellerAxios.post('/api/v1/seller/cars', jsonPayload);
  const res = unwrapApi<number>(raw);
  return { success: res.success, message: res.message, data: res.data ?? null };
};

export const get_seller_accommodations_api = async (): Promise<{
  success: boolean;
  data: SellerPropertyDto[];
  message: string;
}> => {
  const raw = await sellerAxios.get('/api/v1/seller/accommodations');
  const res = unwrapApi<{ accommodations: SellerPropertyDto[] }>(raw);
  return {
    success: res.success,
    message: res.message,
    data: res.data?.accommodations ?? [],
  };
};

export const get_seller_cars_inventory_api = async (): Promise<{
  success: boolean;
  data: SellerCarInventoryDto[];
  message: string;
}> => {
  const raw = await sellerAxios.get('/api/v1/seller/cars');
  const res = unwrapApi<{ cars: Array<{ propertyId: number; name: string; status?: string; basePrice: number }> }>(
    raw
  );
  const cars = (res.data?.cars ?? []).map((c) => ({
    propertyId: c.propertyId,
    name: c.name,
    stock: 1,
    basePrice: c.basePrice,
    status: (c.status as SellerCarInventoryDto['status']) ?? 'ACTIVE',
  }));
  return { success: res.success, message: res.message, data: cars };
};

export interface SellerCalendarCellDto {
  stock: number;
  price: number;
  isClosed?: boolean;
}

function defaultMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export const get_seller_inventory_calendar_api = async (params: {
  propertyKey: string;
  month?: string;
}): Promise<{ success: boolean; data: Record<string, SellerCalendarCellDto>; message: string }> => {
  const raw = await sellerAxios.get('/api/v1/seller/inventory/calendar', {
    params: { propertyKey: params.propertyKey, month: params.month ?? defaultMonth() },
  });
  return unwrapApi<Record<string, SellerCalendarCellDto>>(raw);
};

export const patch_seller_inventory_day_api = async (payload: {
  propertyKey: string;
  day: number;
  stock: number;
  price: number;
  month?: string;
}): Promise<{ success: boolean; message: string }> => {
  const raw = await sellerAxios.patch('/api/v1/seller/inventory/calendar', {
    propertyKey: payload.propertyKey,
    day: payload.day,
    stock: payload.stock,
    price: payload.price,
    month: payload.month ?? defaultMonth(),
  });
  const res = unwrapApi<unknown>(raw);
  return { success: res.success, message: res.message };
};

export const get_seller_schedule_calendar_api = async (params?: {
  year?: number;
  month?: number;
}): Promise<{ success: boolean; data: unknown[]; message: string }> => {
  const now = new Date();
  const year = params?.year ?? now.getFullYear();
  const month = params?.month ?? now.getMonth() + 1;
  const raw = await sellerAxios.get('/api/v1/seller/flights/calendar', { params: { year, month } });
  const res = unwrapApi<unknown[]>(raw);
  return { success: res.success, data: res.data ?? [], message: res.message };
};

export const register_seller_flight_api = async (
  payload: Record<string, unknown>
): Promise<{ success: boolean; message: string }> => {
  const raw = await sellerAxios.post('/api/v1/seller/flights', payload);
  const res = unwrapApi<unknown>(raw);
  return { success: res.success, message: res.message };
};

/** 판매자 개인 프로필 수정 (계정 정보) */
export const update_seller_profile_api = async (
  payload: any
): Promise<{ success: boolean; data: any; message: string }> => {
  const raw = await sellerAxios.patch('/api/v1/seller/profile', payload);
  return unwrapApi<any>(raw);
};
