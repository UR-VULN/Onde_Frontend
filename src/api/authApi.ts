import { userAxios } from '@/api/axiosInstance';
import { unwrapApi } from '@/utils/apiResponse';
import { getRefreshToken } from '@/utils/authCookies';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  memberId: number;
  role: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  role: 'USER' | 'SELLER';
  name?: string;
  phoneNumber?: string;
  nickname?: string;
  age?: number;
}

export interface SignupResponse {
  memberId: number;
  email: string;
  name?: string;
  role: string;
  nickname?: string;
  age?: number;
  createdAt?: string;
}

export const check_nickname_api = async (
  nickname: string
): Promise<{ success: boolean; data: boolean; message: string }> => {
  const raw = await userAxios.get('/api/v1/auth/check-nickname', { params: { nickname } });
  return unwrapApi<boolean>(raw);
};

export const check_email_api = async (
  email: string
): Promise<{ success: boolean; data: boolean; message: string }> => {
  const raw = await userAxios.get('/api/v1/auth/check-email', { params: { email } });
  return unwrapApi<boolean>(raw);
};


export interface TokenRefreshResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export const login_api = async (body: LoginRequest): Promise<LoginResponse> => {
  const raw = await userAxios.post('/api/v1/auth/login', body);
  return unwrapApi<LoginResponse>(raw).data;
};

export const admin_login_api = async (body: LoginRequest): Promise<LoginResponse> => {
  const raw = await userAxios.post('/api/v1/auth/admin/login', body);
  return unwrapApi<LoginResponse>(raw).data;
};

export const signup_api = async (body: SignupRequest): Promise<string> => {
  const raw = await userAxios.post('/api/v1/auth/signup', body);
  const res = unwrapApi<SignupResponse>(raw);
  return res.message || '회원가입이 완료되었습니다.';
};

export const refresh_token_api = async (): Promise<TokenRefreshResponse> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('Refresh token이 없습니다.');
  }
  const raw = await userAxios.post('/api/v1/auth/refresh', { refreshToken });
  return unwrapApi<TokenRefreshResponse>(raw).data;
};

export const send_email_verification_api = async (email: string): Promise<void> => {
  await userAxios.post('/api/v1/auth/email/send', { email });
};

export const verify_email_code_api = async (
  email: string,
  code: string
): Promise<Record<string, string>> => {
  const raw = await userAxios.post('/api/v1/auth/email/verify', { email, code });
  return unwrapApi<Record<string, string>>(raw).data;
};
