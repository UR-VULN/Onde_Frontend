import { userAxios } from '@/api/axiosInstance';

/** 명세: GET /api/v1/members/me */
export interface MemberMeDto {
  memberId: number;
  email: string;
  name: string;
  role: string;
  provider: string;
  status: string;
  createdAt: string;
}

/** 명세: GET /api/v1/members/me/mileage */
export interface MileageSummaryDto {
  memberId: number;
  memberGrade: string;
  mileageBalance: number;
  accumulationRate: number;
  nextGradeThreshold: number;
}

export interface MileageLogDto {
  logId: number;
  logType: 'EARN' | 'USE' | 'RESTORE' | 'REVOKE';
  amount: number;
  description: string;
  createdAt: string;
}

export interface MileageHistoryResponse {
  logs: MileageLogDto[];
  totalCount: number;
  page: number;
  size: number;
}

/** UI 마이페이지용 */
export interface MemberProfileDto {
  mileage: number;
  membershipGrade: string;
}

export const fetch_member_me_api = async (): Promise<{
  success: boolean;
  data: MemberMeDto;
  message: string;
}> => {
  return userAxios.get('/api/v1/members/me');
};

export const fetch_member_mileage_api = async (): Promise<{
  success: boolean;
  data: MileageSummaryDto;
  message: string;
}> => {
  return userAxios.get('/api/v1/members/me/mileage');
};

export const fetch_member_mileage_history_api = async (
  page = 0,
  size = 20
): Promise<{ success: boolean; data: MileageHistoryResponse; message: string }> => {
  return userAxios.get('/api/v1/members/me/mileage/history', { params: { page, size } });
};

/** 마이페이지: 마일리지 요약 → UI 프로필 DTO */
export const fetch_member_profile_api = async (): Promise<{
  success: boolean;
  data: MemberProfileDto;
  message: string;
}> => {
  const res = await fetch_member_mileage_api();
  if (!res.success || !res.data) {
    return { success: false, data: { mileage: 0, membershipGrade: 'BASIC MEMBER' }, message: res.message };
  }
  return {
    success: true,
    message: res.message,
    data: {
      mileage: res.data.mileageBalance,
      membershipGrade: `${res.data.memberGrade} MEMBER`,
    },
  };
};
