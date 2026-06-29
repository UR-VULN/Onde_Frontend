import axios from 'axios';
import { refresh_token_api } from '@/api/authApi';
import { ADMIN_API_BASE, USER_API_BASE } from '@/constants/apiConfig';
import { clearAuthSession, hasPostLogoutRedirect } from '@/utils/authSession';
import { getAccessToken, getMemberId, updateAccessToken } from '@/utils/authCookies';
import { isBackofficePath, isErrorPagePath, redirectByHttpStatus } from '@/utils/errorNavigation';
import { useTravelStore } from '@/store/useTravelStore';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipErrorRedirect?: boolean;
  }
}

const axiosDefaults = {
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
};

/** 고객·인증·결제·셀러 BO — 유저/셀러 통합 API 서버 */
export const userAxios = axios.create({
  baseURL: USER_API_BASE,
  ...axiosDefaults,
});

/** 판매자 API — userAxios와 동일 서버 */
export const sellerAxios = userAxios;

/** 어드민 BO 전용 API 서버 */
export const adminAxios = axios.create({
  baseURL: ADMIN_API_BASE,
  ...axiosDefaults,
});

const injectToken = (config: any) => {
  const url = config.url ?? '';
  if (url.includes('/api/v1/auth/refresh')) {
    return config;
  }
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

userAxios.interceptors.request.use(injectToken, (error) => Promise.reject(error));
adminAxios.interceptors.request.use(injectToken, (error) => Promise.reject(error));

let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];

function waitForRefresh(): Promise<string | null> {
  return new Promise((resolve) => {
    refreshWaiters.push(resolve);
  });
}

function flushRefreshWaiters(token: string | null) {
  refreshWaiters.forEach((cb) => cb(token));
  refreshWaiters = [];
}

function isRefreshable401(config: { url?: string; _retry?: boolean } | undefined): boolean {
  if (!config || config._retry) return false;
  const url = config.url ?? '';
  return !url.includes('/api/v1/auth/refresh') && !url.includes('/api/v1/auth/login');
}

const finalizeResponseError = (error: {
  response?: { status?: number; data?: unknown };
  config?: { url?: string; skipErrorRedirect?: boolean };
}) => {
  console.error('[API ERROR INTERCEPTOR]:', error);

  const status = error.response?.status;
  const onErrorPage = isErrorPagePath(window.location.pathname);
  const url = error.config?.url ?? '';
  const isLoginRequest = url.includes('/api/v1/auth/login') || url.includes('/api/v1/auth/admin/login');

  const suppressErrorRedirect = hasPostLogoutRedirect();

  if (status && !onErrorPage && !error.config?.skipErrorRedirect && !suppressErrorRedirect) {
    if (status === 401) {
      clearAuthSession();
      if (isLoginRequest) {
        const errorData = error.response?.data;
        return Promise.reject(
          errorData || { success: false, error: { message: '이메일 또는 비밀번호가 올바르지 않습니다.' } }
        );
      }
    }
    if (status === 403) {
      useTravelStore.getState().addToast('해당 기능을 수행할 권한이 없습니다.', 'warning');
      if (!isBackofficePath(window.location.pathname)) {
        redirectByHttpStatus(status);
      }
    } else {
      redirectByHttpStatus(status);
    }
  }

  const errorData = error.response?.data;
  return Promise.reject(
    errorData || { success: false, error: { message: '네트워크 연결 오류가 발생했습니다.' } }
  );
};

const createAuthAwareErrorHandler = (instance: typeof userAxios) => {
  return async (error: {
    response?: { status?: number; data?: unknown };
    config?: { url?: string; _retry?: boolean; headers: Record<string, string>; skipErrorRedirect?: boolean };
  }) => {
    const status = error.response?.status;
    const config = error.config;

    if (status === 401 && isRefreshable401(config) && getMemberId()) {
      if (isRefreshing) {
        const token = await waitForRefresh();
        if (token && config) {
          config.headers.Authorization = `Bearer ${token}`;
          config._retry = true;
          return instance.request(config);
        }
        return finalizeResponseError(error);
      }

      isRefreshing = true;
      try {
        const res = await refresh_token_api();
        if (res?.accessToken) {
          updateAccessToken(res.accessToken, res.expiresIn);
          flushRefreshWaiters(res.accessToken);
          if (config) {
            config.headers.Authorization = `Bearer ${res.accessToken}`;
            config._retry = true;
            return instance.request(config);
          }
        }
        flushRefreshWaiters(null);
      } catch {
        flushRefreshWaiters(null);
      } finally {
        isRefreshing = false;
      }
    }

    return finalizeResponseError(error);
  };
};

userAxios.interceptors.response.use((response) => response.data, createAuthAwareErrorHandler(userAxios));
adminAxios.interceptors.response.use((response) => response.data, createAuthAwareErrorHandler(adminAxios));
