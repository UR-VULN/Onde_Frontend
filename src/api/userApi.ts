import { userAxios } from '@/api/axiosInstance';
import { unwrapApi } from '@/utils/apiResponse';

/** GET /api/v1/members/me */
export interface MemberMeDto {
  memberId: number;
  email: string;
  name: string;
  phoneNumber: string;
  nickname: string;
  role: string;
  status: string;
}

export interface ProfileUpdatePayload {
  name: string;
  phoneNumber: string;
  nickname: string;
  password?: string;
}

/** GET /api/v1/members/me/mileage */
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
  walletBalance?: number;
  membershipGrade: string;
}

export const fetch_wallet_balance_api = async (): Promise<{ success: boolean; data: number; message: string }> => {
  try {
    const raw = await userAxios.get('/api/v1/members/me/wallet');
    const res = unwrapApi<{ balance: number }>(raw);
    return { success: res.success, data: res.data?.balance ?? 0, message: res.message };
  } catch {
    return { success: false, data: 0, message: '지갑 잔액 조회 실패' };
  }
};

export const charge_wallet_api = async (amount: number): Promise<{ success: boolean; data: number; message: string }> => {
  try {
    const raw = await userAxios.post('/api/v1/members/me/wallet/charge', { amount });
    const res = unwrapApi<{ balance: number }>(raw);
    return { success: res.success, data: res.data?.balance ?? 0, message: res.message };
  } catch {
    return { success: false, data: 0, message: '지갑 충전 실패' };
  }
};

export const fetch_member_me_api = async (): Promise<{
  success: boolean;
  data: MemberMeDto;
  message: string;
}> => {
  const raw = await userAxios.get('/api/v1/members/me/profile');
  return unwrapApi<MemberMeDto>(raw);
};

export const fetch_member_mileage_api = async (): Promise<{
  success: boolean;
  data: MileageSummaryDto;
  message: string;
}> => {
  const raw = await userAxios.get('/api/v1/members/me/mileage');
  return unwrapApi<MileageSummaryDto>(raw);
};

export const fetch_member_mileage_history_api = async (
  page = 0,
  size = 20
): Promise<{ success: boolean; data: MileageHistoryResponse; message: string }> => {
  const raw = await userAxios.get('/api/v1/members/me/mileage/history', { params: { page, size } });
  const res = unwrapApi<{
    logs?: Array<Record<string, unknown>>;
    totalCount?: number;
    page?: number;
    size?: number;
  }>(raw);
  const logs: MileageLogDto[] = (res.data?.logs ?? []).map((log) => ({
    logId: Number(log.logId ?? log.id ?? 0),
    logType: String(log.logType ?? 'EARN') as MileageLogDto['logType'],
    amount: Number(log.amount ?? 0),
    description: String(log.description ?? ''),
    createdAt: String(log.createdAt ?? ''),
  }));
  return {
    success: res.success,
    message: res.message,
    data: {
      logs,
      totalCount: Number(res.data?.totalCount ?? logs.length),
      page: Number(res.data?.page ?? page),
      size: Number(res.data?.size ?? size),
    },
  };
};

/** 마이페이지: 마일리지 요약 → UI 프로필 DTO */
export const fetch_member_profile_api = async (): Promise<{
  success: boolean;
  data: MemberProfileDto;
  message: string;
}> => {
  const [res, walletRes] = await Promise.all([
    fetch_member_mileage_api(),
    fetch_wallet_balance_api()
  ]);
  
  if (!res.success || !res.data) {
    return { success: false, data: { mileage: 0, walletBalance: walletRes.data, membershipGrade: 'BASIC MEMBER' }, message: res.message };
  }
  return {
    success: true,
    message: res.message,
    data: {
      mileage: res.data.mileageBalance,
      walletBalance: walletRes.data,
      membershipGrade: `${res.data.memberGrade} MEMBER`,
    },
  };
};

export const update_member_profile_api = async (
  payload: ProfileUpdatePayload
): Promise<{ success: boolean; data: any; message: string }> => {
  const raw = await userAxios.patch('/api/v1/members/me/profile', payload);
  return unwrapApi<any>(raw);
};
