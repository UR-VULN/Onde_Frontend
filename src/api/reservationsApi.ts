import { userAxios } from '@/api/axiosInstance';
import type { MyPageReservation } from '@/store/useTravelStore';

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

export const fetch_my_reservations_api = async (): Promise<{
  success: boolean;
  data: MemberReservationsResponse;
  message: string;
}> => {
  return userAxios.get('/api/v1/members/me/reservations');
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
