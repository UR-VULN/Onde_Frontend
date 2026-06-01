import { userAxios } from '@/api/axiosInstance';
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
  id: number;
  modelName: string;
  carType: string;
  price: number;
}

export interface CarListItemDto {
  carId: number;
  modelName: string;
  carType: string;
  dailyPrice: number;
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
  imageUrl: string;
  pricePerDay: number;
  seats: number;
  fuel: string;
  tags: string[];
}

export interface CarSearchResponse {
  total: number;
  page: number;
  size: number;
  cars: CarDto[];
}

const DEFAULT_CAR_IMAGE =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600';

function toDateTime(dateStr: string, time = '10:00:00'): string {
  return `${dateStr}T${time}`;
}

function mapBackendCar(item: BackendCarItem): CarListItemDto {
  return {
    carId: item.id,
    modelName: item.modelName,
    carType: item.carType,
    dailyPrice: item.price ?? 0,
  };
}

function mapCarListItemToDto(item: CarListItemDto): CarDto {
  return {
    id: item.carId,
    carId: item.carId,
    name: item.modelName,
    type: item.carType,
    typeLabel: item.carType,
    description: item.modelName,
    imageUrl: DEFAULT_CAR_IMAGE,
    pricePerDay: item.dailyPrice,
    seats: 5,
    fuel: '가솔린',
    tags: [item.carType],
  };
}

export const search_cars_list_api = async (
  params: CarSearchParams
): Promise<{ success: boolean; data: CarListResponse; message: string }> => {
  const raw = await userAxios.get('/api/v1/rental_cars/search', { params });
  const res = unwrapApi<{ cars: BackendCarItem[] }>(raw);
  const cars = (res.data?.cars ?? []).map(mapBackendCar);
  return {
    success: res.success,
    message: res.message,
    data: { cars, totalCount: cars.length },
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
  const raw = await userAxios.post('/api/v1/reservations/cars', {
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
