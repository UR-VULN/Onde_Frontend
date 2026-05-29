import { userAxios } from '@/api/axiosInstance';
import type { MapStayItem } from '@/types/mapStay';

/** 명세: GET /api/v1/accommodations */
export interface AccommodationSearchParams {
  location?: string;
  checkIn: string;
  checkOut: string;
  page?: number;
  size?: number;
}

export interface AccommodationDto {
  accommodationId: number;
  name: string;
  category: string;
  location: string;
  thumbnailUrl: string;
  minPrice: number;
  availableRooms: number;
}

export interface AccommodationSearchResponse {
  accommodations: AccommodationDto[];
  totalCount: number;
}

/** UI 호환 검색 파라미터 */
export interface StaySearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  page?: number;
  size?: number;
}

/** UI 카드용 (검색 결과 매핑) */
export interface StayDto {
  id: number;
  accommodationId: number;
  roomId?: number;
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

export function mapStayToStayDto(stay: MapStayItem): StayDto {
  return {
    id: stay.accommodationId,
    accommodationId: stay.accommodationId,
    roomId: stay.roomId,
    title: stay.title,
    location: stay.location,
    city: stay.city,
    country: stay.country,
    description: stay.description,
    imageUrl: stay.imageUrl,
    pricePerNight: stay.pricePerNight,
    rating: stay.rating,
    reviewCount: stay.reviewCount,
    tags: stay.tags,
  };
}

function mapAccommodationToStayDto(item: AccommodationDto): StayDto {
  const [city = '', country = ''] = item.location.split(',').map((s) => s.trim());
  return {
    id: item.accommodationId,
    accommodationId: item.accommodationId,
    title: item.name,
    location: item.location,
    city,
    country,
    description: item.name,
    imageUrl: item.thumbnailUrl,
    pricePerNight: item.minPrice,
    rating: 4.8,
    reviewCount: 0,
    tags: [item.category],
  };
}

export const search_accommodations_api = async (
  params: AccommodationSearchParams
): Promise<{ success: boolean; data: AccommodationSearchResponse; message: string }> => {
  return userAxios.get('/api/v1/accommodations', { params });
};

export const search_stays_api = async (
  params: StaySearchParams
): Promise<{ success: boolean; data: StaySearchResponse; message: string }> => {
  const res = await search_accommodations_api({
    location: params.destination,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    page: params.page ?? 0,
    size: params.size ?? 20,
  });

  if (!res.success || !res.data) {
    return { success: false, data: { total: 0, page: 0, size: 20, stays: [] }, message: res.message };
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
      stays: res.data.accommodations.map(mapAccommodationToStayDto),
    },
  };
};

export const get_stay_detail_api = async (
  accommodationId: number
): Promise<{ success: boolean; data: StayDto; message: string }> => {
  const res = await search_accommodations_api({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    page: 0,
    size: 100,
  });
  const found = res.data?.accommodations.find((a) => a.accommodationId === accommodationId);
  if (!found) {
    return { success: false, data: {} as StayDto, message: '숙소를 찾을 수 없습니다.' };
  }
  return { success: true, data: mapAccommodationToStayDto(found), message: '조회되었습니다.' };
};

/** 명세: POST /api/v1/reservations/rooms */
export interface RoomReservationPayload {
  roomId: number;
  checkIn: string;
  checkOut: string;
}

export interface RoomReservationResponse {
  reservationId: number;
  targetType: 'ROOM';
  targetId: number;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
}

export const book_room_api = async (
  payload: RoomReservationPayload
): Promise<{ success: boolean; data: RoomReservationResponse; message: string }> => {
  return userAxios.post('/api/v1/reservations/rooms', payload);
};

/** @deprecated book_room_api 사용 (roomId 필요) */
export interface StayBookingPayload {
  roomId: number;
  checkIn: string;
  checkOut: string;
}

export const book_stay_api = book_room_api;
