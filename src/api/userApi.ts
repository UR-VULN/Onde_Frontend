import { userAxios } from '@/api/axiosInstance';

/** 회원 마이페이지 프로필 (마일리지·멤버십 등급) */
export interface MemberProfileDto {
  mileage: number;
  membershipGrade: string;
}

export const fetch_member_profile_api = async (): Promise<{
  success: boolean;
  data: MemberProfileDto;
  message: string;
}> => {
  return userAxios.get('/api/v1/members/me/profile');
};
