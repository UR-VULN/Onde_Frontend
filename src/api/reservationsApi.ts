import { userAxios } from '@/api/axiosInstance';
import type { MyPageReservation } from '@/store/useTravelStore';
import { unwrapApi } from '@/utils/apiResponse';

export interface MemberReservationDto {
  reservationId: number;
  category: 'stay' | 'flight' | 'car' | 'ins';
  title: string;
  badge: string;
  badgeType: string;
  date: string;
  details: string;
  price: string;
  status: string;
}

export interface MemberReservationsResponse {
  reservations: MemberReservationDto[];
  totalCount: number;
}

function formatPrice(amount: number | string | undefined): string {
  const n = Number(amount ?? 0);
  return `₩${n.toLocaleString('ko-KR')}`;
}

function statusBadge(status: string): { badge: string; badgeType: string } {
  const s = status?.toUpperCase() ?? '';
  if (s.includes('CONFIRM') || s.includes('COMPLET') || s.includes('PAID')) {
    return { badge: '확정', badgeType: 'active' };
  }
  if (s.includes('PENDING') || s.includes('HOLD')) {
    return { badge: '대기', badgeType: 'pending' };
  }
  if (s.includes('CANCEL')) {
    return { badge: '취소', badgeType: 'cancelled' };
  }
  return { badge: status, badgeType: 'default' };
}

interface MyPageList<T> {
  content?: T[];
  totalCount: number;
}

function mapFlightBooking(item: Record<string, unknown>): MemberReservationDto {
  const { badge, badgeType } = statusBadge(String(item.status ?? ''));
  const dep = item.departureTime ? String(item.departureTime).slice(0, 10) : '';
  return {
    reservationId: Number(item.bookingId ?? 0),
    category: 'flight',
    title: `✈️ ${item.flightNumber ?? '항공편'} (${item.seatClass ?? ''})`,
    badge,
    badgeType,
    date: dep,
    details: `${item.origin ?? ''} → ${item.destination ?? ''} | ${item.bookingCode ?? ''}`,
    price: formatPrice(item.totalPrice as number),
    status: String(item.status ?? ''),
  };
}

function mapRoomReservation(item: Record<string, unknown>): MemberReservationDto {
  const { badge, badgeType } = statusBadge(String(item.status ?? ''));
  const checkIn = item.checkIn ? String(item.checkIn).slice(0, 10) : '';
  const checkOut = item.checkOut ? String(item.checkOut).slice(0, 10) : '';
  return {
    reservationId: Number(item.reservationId ?? 0),
    category: 'stay',
    title: `🏡 ${item.accommodationName ?? item.roomName ?? '숙소'}`,
    badge,
    badgeType,
    date: `${checkIn} ~ ${checkOut}`,
    details: String(item.roomName ?? ''),
    price: formatPrice(item.totalPrice as number),
    status: String(item.status ?? ''),
  };
}

function mapCarReservation(item: Record<string, unknown>): MemberReservationDto {
  const { badge, badgeType } = statusBadge(String(item.status ?? ''));
  return {
    reservationId: Number(item.reservationId ?? 0),
    category: 'car',
    title: `🚗 ${item.modelName ?? '렌터카'}`,
    badge,
    badgeType,
    date: `${item.checkIn ?? ''} ~ ${item.checkOut ?? ''}`,
    details: String(item.carType ?? ''),
    price: formatPrice(item.totalPrice as number),
    status: String(item.status ?? ''),
  };
}

function mapInsurancePolicy(item: Record<string, unknown>): MemberReservationDto {
  const { badge, badgeType } = statusBadge(String(item.status ?? ''));
  return {
    reservationId: Number(item.policyId ?? 0),
    category: 'ins',
    title: `🛡️ ${item.productName ?? '여행자 보험'}`,
    badge,
    badgeType,
    date: `${item.startDate ?? ''} ~ ${item.endDate ?? ''}`,
    details: `피보험자: ${item.insuredName ?? ''} | ${item.policyCode ?? ''}`,
    price: formatPrice(item.totalPremium as number),
    status: String(item.status ?? ''),
  };
}

export const fetch_my_reservations_api = async (): Promise<{
  success: boolean;
  data: MemberReservationsResponse;
  message: string;
}> => {
  const [flightsRes, roomsRes, carsRes, insRes] = await Promise.allSettled([
    userAxios.get('/api/v1/members/me/reservations/flights'),
    userAxios.get('/api/v1/members/me/reservations/rooms'),
    userAxios.get('/api/v1/members/me/reservations/cars'),
    userAxios.get('/api/v1/members/me/insurances'),
  ]);

  const reservations: MemberReservationDto[] = [];

  if (flightsRes.status === 'fulfilled') {
    const data = unwrapApi<MyPageList<Record<string, unknown>>>(flightsRes.value).data;
    (data?.content ?? []).forEach((b) => reservations.push(mapFlightBooking(b)));
  }
  if (roomsRes.status === 'fulfilled') {
    const data = unwrapApi<MyPageList<Record<string, unknown>>>(roomsRes.value).data;
    (data?.content ?? []).forEach((r) => reservations.push(mapRoomReservation(r)));
  }
  if (carsRes.status === 'fulfilled') {
    const data = unwrapApi<MyPageList<Record<string, unknown>>>(carsRes.value).data;
    (data?.content ?? []).forEach((r) => reservations.push(mapCarReservation(r)));
  }
  if (insRes.status === 'fulfilled') {
    const data = unwrapApi<MyPageList<Record<string, unknown>>>(insRes.value).data;
    (data?.content ?? []).forEach((p) => reservations.push(mapInsurancePolicy(p)));
  }

  // 서버에서 내려온 상태가 '취소'인 데이터만 걸러냅니다. (localStorage ID 필터링은 제거됨)
  const activeReservations = reservations.filter((r) => r.badgeType !== 'cancelled');

  return {
    success: true,
    message: '예약 목록 조회 완료',
    data: { reservations: activeReservations, totalCount: activeReservations.length },
  };
};

export const cancel_member_reservation_api = async (
  reservationId: number,
  category: MemberReservationDto['category']
): Promise<{ success: boolean; message: string }> => {
  if (category === 'flight') {
    await userAxios.delete(`/api/v1/members/me/reservations/flights/${reservationId}`);
    return { success: true, message: '항공 예약이 취소되었습니다.' };
  }
  if (category === 'ins') {
    await userAxios.delete(`/api/v1/members/me/insurances/${reservationId}`);
    return { success: true, message: '보험 가입이 취소되었습니다.' };
  }

  const raw = await userAxios.delete(`/api/v1/reservations/${reservationId}`);
  const res = unwrapApi<unknown>(raw);
  
  return { success: res.success, message: res.message || '예약이 취소되었습니다.' };
};

export function mapReservationDtoToMyPage(dto: MemberReservationDto): MyPageReservation {
  return {
    id: String(dto.reservationId),
    category: dto.category,
    title: dto.title,
    badge: dto.badge,
    badgeType: dto.badgeType,
    date: dto.date,
    details: dto.details,
    price: dto.price,
  };
}
