import { userAxios } from '@/api/axiosInstance';

/** 명세: GET /api/v1/cars */
export interface CarSearchParams {
  carType?: string;
  pickupDate: string;
  returnDate: string;
  page?: number;
  size?: number;
}

export interface CarListItemDto {
  carId: number;
  modelName: string;
  carType: string;
  licensePlate: string;
  dailyPrice: number;
  available: boolean;
}

export interface CarListResponse {
  cars: CarListItemDto[];
  totalCount: number;
}

/** UI 호환 */
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
  return userAxios.get('/api/rental_cars/search', { params });
};

export const search_cars_api = async (
  params: CarSearchFormParams
): Promise<{ success: boolean; data: CarSearchResponse; message: string }> => {
  const res = await search_cars_list_api({
    carType: params.carType === 'ALL' ? undefined : params.carType,
    pickupDate: params.pickupDate,
    returnDate: params.returnDate,
    page: params.page ?? 0,
    size: params.size ?? 20,
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
  const res = await search_cars_list_api({ pickupDate: '2026-06-01', returnDate: '2026-06-03', page: 0, size: 100 });
  const found = res.data?.cars.find((c) => c.carId === carId);
  if (!found) {
    return { success: false, data: {} as CarDto, message: '차량을 찾을 수 없습니다.' };
  }
  return { success: true, data: mapCarListItemToDto(found), message: '조회되었습니다.' };
};

/** 명세: POST /api/v1/reservations/cars */
export interface CarReservationPayload {
  carId: number;
  insuranceType: 'BASIC' | 'FULL';
  pickupDate: string;
  returnDate: string;
}

export interface CarReservationResponse {
  reservationId: number;
  targetType: 'CAR';
  targetId: number;
  modelName: string;
  pickupDate: string;
  returnDate: string;
  totalPrice: number;
  status: string;
}

export const book_car_api = async (
  payload: CarReservationPayload
): Promise<{ success: boolean; data: CarReservationResponse; message: string }> => {
  return userAxios.post('/api/rental_cars/reservations', payload);
};
