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
  name: string;
  role: 'USER' | 'SELLER';
}

export const login_api = async (
  body: LoginRequest
): Promise<{ success: boolean; data: LoginResponse; message: string }> => {
  return userAxios.post('/api/v1/auth/login', body);
};

export const signup_api = async (
  body: SignupRequest
): Promise<{ success: boolean; data: { memberId: number; email: string }; message: string }> => {
  return userAxios.post('/api/v1/auth/signup', body);
};

export const refresh_token_api = async (): Promise<{
  success: boolean;
  data: { accessToken: string; tokenType: string; expiresIn: number };
  message: string;
}> => {
  const refreshToken = getRefreshToken();
  return userAxios.post('/api/v1/auth/refresh', null, {
    headers: refreshToken ? { Authorization: `Bearer ${refreshToken}` } : {},
  });
};
