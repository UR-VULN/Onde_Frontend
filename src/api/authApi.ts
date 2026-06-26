import { userAxios } from '@/api/axiosInstance';
import { unwrapApi } from '@/utils/apiResponse';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  tokenType: string;
  expiresIn: number;
  role: string;
  passwordChangeRequired?: boolean;
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
  tokenType: string;
  expiresIn: number;
}

export const login_api = async (body: LoginRequest): Promise<LoginResponse> => {
  const raw = await userAxios.post('/api/v1/auth/login', body, { skipErrorRedirect: true });
  return unwrapApi<LoginResponse>(raw).data;
};

export const admin_login_api = async (body: LoginRequest): Promise<LoginResponse> => {
  const raw = await userAxios.post('/api/v1/auth/admin/login', body, { skipErrorRedirect: true });
  return unwrapApi<LoginResponse>(raw).data;
};

export const signup_api = async (body: SignupRequest): Promise<string> => {
  const raw = await userAxios.post('/api/v1/auth/signup', body, { skipErrorRedirect: true });
  const res = unwrapApi<SignupResponse>(raw);
  return res.message || '회원가입이 완료되었습니다.';
};

export const refresh_token_api = async (): Promise<TokenRefreshResponse> => {
  const raw = await userAxios.post('/api/v1/auth/refresh', {});
  return unwrapApi<TokenRefreshResponse>(raw).data;
};

export const logout_api = async (): Promise<void> => {
  await userAxios.post('/api/v1/auth/logout', {}, { skipErrorRedirect: true });
};
