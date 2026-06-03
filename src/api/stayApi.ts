import { userAxios } from '@/api/axiosInstance';
import type { MapStayItem } from '@/types/mapStay';
import { unwrapApi } from '@/utils/apiResponse';
import { getMemberId } from '@/utils/authCookies';

export interface AccommodationSearchParams {
  region?: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
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
  availableRooms?: number;
}

export interface AccommodationSearchResponse {
  accommodations: AccommodationDto[];
  totalCount: number;
}

export interface StaySearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  page?: number;
  size?: number;
}

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

interface BackendAccommodationItem {
  id?: number;
  accommodationId?: number;
  name: string;
  category: string;
  location: string;
  thumbnailUrl: string;
  minPrice: number;
  availableRooms?: number;
}

function mapBackendItem(item: BackendAccommodationItem): AccommodationDto {
  let thumbnailUrl = item.thumbnailUrl ?? '';
  if (thumbnailUrl && !thumbnailUrl.startsWith('http://') && !thumbnailUrl.startsWith('https://')) {
    thumbnailUrl = `http://localhost:9000/onde-local/${thumbnailUrl}`;
  }
  return {
    accommodationId: Number(item.accommodationId ?? item.id ?? 0),
    name: item.name,
    category: item.category,
    location: item.location,
    thumbnailUrl: thumbnailUrl,
    minPrice: item.minPrice ?? 0,
    availableRooms: item.availableRooms,
  };
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
    /** 백엔드 room 상세 API 없음 — 1:1 매핑 가정 */
    roomId: item.accommodationId,
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
  const raw = await userAxios.get('/api/v1/accommodations/search', { params });
  const res = unwrapApi<{ accommodations: BackendAccommodationItem[]; totalCount?: number }>(raw);
  const list = res.data?.accommodations ?? [];
  const accommodations = list.map(mapBackendItem);
  return {
    success: res.success,
    message: res.message,
    data: { accommodations, totalCount: Number(res.data?.totalCount ?? accommodations.length) },
  };
};

export const search_stays_api = async (
  params: StaySearchParams
): Promise<{ success: boolean; data: StaySearchResponse; message: string }> => {
  const res = await search_accommodations_api({
    region: params.destination || undefined,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    guests: params.guests,
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

export interface RoomReservationPayload {
  memberId?: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
}

export interface RoomReservationResponse {
  reservationId: number;
  status: string;
  message: string;
}

export const book_room_api = async (
  payload: RoomReservationPayload
): Promise<{ success: boolean; data: RoomReservationResponse; message: string }> => {
  const memberId = payload.memberId ?? getMemberId();
  if (!memberId) {
    return {
      success: false,
      message: '로그인이 필요합니다.',
      data: { reservationId: 0, status: '', message: '' },
    };
  }
  const raw = await userAxios.post('/api/v1/reservations/rooms', {
    memberId,
    roomId: payload.roomId,
    checkInDate: payload.checkInDate,
    checkOutDate: payload.checkOutDate,
    guests: payload.guests,
  });
  const res = unwrapApi<{ reservationId: number; status: string; message?: string; totalPrice?: number }>(raw);
  return {
    success: res.success,
    message: res.message,
    data: {
      reservationId: res.data.reservationId,
      status: String(res.data.status),
      message: res.data.message ?? res.message,
    },
  };
};

/** UI 호환 래퍼 */
export interface StayBookingPayload {
  roomId: number;
  checkIn: string;
  checkOut: string;
  guests?: number;
  totalPrice?: number;
}

export const book_stay_api = async (
  payload: StayBookingPayload
): Promise<{ success: boolean; data: RoomReservationResponse & { totalPrice?: number }; message: string }> => {
  const res = await book_room_api(
    {
      roomId: payload.roomId,
      checkInDate: payload.checkIn,
      checkOutDate: payload.checkOut,
      guests: payload.guests ?? 2,
    }
  );
  return {
    ...res,
    data: { ...res.data, totalPrice: payload.totalPrice },
  };
};
