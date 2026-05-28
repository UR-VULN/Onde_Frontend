import { userAxios } from '@/api/axiosInstance';

export interface StaySearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export interface StayDto {
  id: number;
  title: string;
  location: string;
  city: string;
  country: string;
  description: string;
  imageUrl: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  tags: string[];
}

export interface StaySearchResponse {
  total: number;
  page: number;
  size: number;
  stays: StayDto[];
}

// 1. 숙소 실시간 검색 (목적지 · 날짜 · 인원 · 객실)
export const search_stays_api = async (
  params: StaySearchParams
): Promise<{ success: boolean; data: StaySearchResponse; message: string }> => {
  return userAxios.get('/api/v1/stays/search', { params });
};

// 2. 숙소 상세 조회
export const get_stay_detail_api = async (
  stayId: number
): Promise<{ success: boolean; data: StayDto; message: string }> => {
  return userAxios.get(`/api/v1/stays/${stayId}`);
};

// 3. 숙소 예약 신청
export interface StayBookingPayload {
  stayId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export const book_stay_api = async (
  payload: StayBookingPayload
): Promise<{ success: boolean; data: { bookingId: number; bookingCode: string }; message: string }> => {
  return userAxios.post('/api/v1/stays/bookings', payload);
};
