import { userAxios } from '@/api/axiosInstance';
import { STORAGE_BASE_URL } from '@/constants/apiConfig';
import { unwrapApi } from '@/utils/apiResponse';
import { getMemberId } from '@/utils/authCookies';

export interface CarSearchParams {
  location?: string;
  pickup: string;
  returnTime: string;
  carType?: string;
  sort?: string;
}

interface BackendCarItem {
  id?: number;
  carId?: number;
  modelName: string;
  carType: string;
  price?: number;
  dailyPrice?: number;
  licensePlate?: string;
  thumbnailUrl?: string;
}

export interface CarListItemDto {
  carId: number;
  modelName: string;
  carType: string;
  dailyPrice: number;
  licensePlate?: string;
  thumbnailUrl?: string;
}

export interface CarListResponse {
  cars: CarListItemDto[];
  totalCount: number;
}

export interface CarSearchFormParams {
  pickupSpot: string;
  pickupDate: string;
  returnDate: string;
  carType: string;
  page?: number;
  size?: number;
}

export interface CarDto {
  id: number;
  carId: number;
  name: string;
  type: string;
  typeLabel: string;
  description: string;
  imageUrl?: string;
  pricePerDay: number;
  seats?: number;
  fuel?: string;
  tags: string[];
  licensePlate?: string;
}

export interface CarSearchResponse {
  total: number;
  page: number;
  size: number;
  cars: CarDto[];
}

function toDateTime(dateStr: string, time = '10:00:00'): string {
  return `${dateStr}T${time}`;
}

function mapBackendCar(item: BackendCarItem): CarListItemDto {
  return {
    carId: Number(item.carId ?? item.id ?? 0),
    modelName: item.modelName,
    carType: item.carType,
    dailyPrice: Number(item.dailyPrice ?? item.price ?? 0),
    licensePlate: item.licensePlate,
    thumbnailUrl: item.thumbnailUrl,
  };
}

function mapCarListItemToDto(item: CarListItemDto): CarDto {
  const rawUrl = item.thumbnailUrl?.trim();
  const imageUrl = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `${STORAGE_BASE_URL}/car/${rawUrl}`) : undefined;
  return {
    id: item.carId,
    carId: item.carId,
    name: item.modelName,
    type: item.carType,
    typeLabel: item.carType,
    description: item.modelName,
    pricePerDay: item.dailyPrice,
    tags: [item.carType],
    imageUrl,
    licensePlate: item.licensePlate,
  };
}


export const search_cars_list_api = async (
  params: CarSearchParams
): Promise<{ success: boolean; data: CarListResponse; message: string }> => {
  const raw = await userAxios.get('/api/v1/cars/search', { params });
  const res = unwrapApi<{ cars: BackendCarItem[]; totalCount?: number }>(raw);
  const cars = (res.data?.cars ?? []).map(mapBackendCar);
  return {
    success: res.success,
    message: res.message,
    data: { cars, totalCount: Number(res.data?.totalCount ?? cars.length) },
  };
};

export const search_cars_api = async (
  params: CarSearchFormParams
): Promise<{ success: boolean; data: CarSearchResponse; message: string }> => {
  const res = await search_cars_list_api({
    location: params.pickupSpot || undefined,
    carType: params.carType === 'ALL' ? undefined : params.carType,
    pickup: toDateTime(params.pickupDate),
    returnTime: toDateTime(params.returnDate, '18:00:00'),
  });

  if (!res.success || !res.data) {
    return { success: false, data: { total: 0, page: 0, size: 20, cars: [] }, message: res.message };
  }

  const page = params.page ?? 0;
  const size = params.size ?? 20;
  return {
    success: true,
    message: res.message,
    data: {
      total: res.data.totalCount,
      page,
      size,
      cars: res.data.cars.map(mapCarListItemToDto),
    },
  };
};

export const get_car_detail_api = async (
  carId: number
): Promise<{ success: boolean; data: CarDto; message: string }> => {
  const today = new Date().toISOString().split('T')[0];
  const end = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
  const res = await search_cars_list_api({
    pickup: toDateTime(today),
    returnTime: toDateTime(end, '18:00:00'),
  });
  const found = res.data?.cars.find((c) => c.carId === carId);
  if (!found) {
    return { success: false, data: {} as CarDto, message: '차량을 찾을 수 없습니다.' };
  }
  return { success: true, data: mapCarListItemToDto(found), message: '조회되었습니다.' };
};

export interface CarReservationPayload {
  memberId?: number;
  carId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

export interface CarReservationResponse {
  reservationId: number;
  status: string;
  message: string;
}

export const book_car_api = async (
  payload: CarReservationPayload
): Promise<{ success: boolean; data: CarReservationResponse & { totalPrice: number }; message: string }> => {
  const memberId = payload.memberId ?? getMemberId();
  if (!memberId) {
    return {
      success: false,
      message: '로그인이 필요합니다.',
      data: { reservationId: 0, status: '', message: '', totalPrice: 0 },
    };
  }
  const raw = await userAxios.post('/api/v1/accommodations/reservations/cars', {
    memberId,
    carId: payload.carId,
    startDate: payload.startDate,
    endDate: payload.endDate,
    totalPrice: payload.totalPrice,
  });
  const res = unwrapApi<{ reservationId: number; status: string; message?: string }>(raw);
  return {
    success: res.success,
    message: res.message,
    data: {
      reservationId: res.data.reservationId,
      status: String(res.data.status),
      message: res.data.message ?? res.message,
      totalPrice: payload.totalPrice,
    },
  };
};

export { get_inventory_calendar_api, type CalendarDayInfo, type InventoryCalendarResponse } from './stayApi';

