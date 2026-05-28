import { userAxios } from '@/api/axiosInstance';

export interface CarSearchParams {
  pickupSpot: string;
  pickupDate: string;
  returnDate: string;
  carType: string;
}

export interface CarDto {
  id: number;
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

// 1. 렌터카 실시간 검색 (지점 · 날짜 · 차종)
export const search_cars_api = async (
  params: CarSearchParams
): Promise<{ success: boolean; data: CarSearchResponse; message: string }> => {
  return userAxios.get('/api/v1/cars/search', { params });
};

// 2. 렌터카 상세 조회
export const get_car_detail_api = async (
  carId: number
): Promise<{ success: boolean; data: CarDto; message: string }> => {
  return userAxios.get(`/api/v1/cars/${carId}`);
};

// 3. 렌터카 예약 신청
export interface CarBookingPayload {
  carId: number;
  pickupSpot: string;
  pickupDate: string;
  returnDate: string;
}

export const book_car_api = async (
  payload: CarBookingPayload
): Promise<{ success: boolean; data: { bookingId: number; bookingCode: string }; message: string }> => {
  return userAxios.post('/api/v1/cars/bookings', payload);
};
