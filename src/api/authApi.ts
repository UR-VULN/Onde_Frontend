import { userAxios } from '@/api/axiosInstance';
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
  phoneNumber?: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export const login_api = async (body: LoginRequest): Promise<LoginResponse> => {
  const raw = await userAxios.post('/api/v1/auth/login', body);
  return raw as unknown as LoginResponse;
};

export const signup_api = async (body: SignupRequest): Promise<string> => {
  const raw = await userAxios.post('/api/v1/auth/signup', body);
  return typeof raw === 'string' ? raw : String(raw);
};

export const refresh_token_api = async (): Promise<TokenRefreshResponse> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('Refresh token이 없습니다.');
  }
  const raw = await userAxios.post('/api/v1/auth/refresh', { refreshToken });
  return raw as unknown as TokenRefreshResponse;
};

export const send_email_verification_api = async (email: string): Promise<void> => {
  await userAxios.post('/api/v1/auth/email/send', { email });
};

export const verify_email_code_api = async (
  email: string,
  code: string
): Promise<Record<string, string>> => {
  const raw = await userAxios.post('/api/v1/auth/email/verify', { email, code });
  return raw as unknown as Record<string, string>;
};
