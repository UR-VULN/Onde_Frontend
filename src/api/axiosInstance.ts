import axios from 'axios';
import { refresh_token_api } from '@/api/authApi';
import { ADMIN_API_BASE, USER_API_BASE } from '@/constants/apiConfig';
import { hasPostLogoutRedirect, performLogout } from '@/utils/authSession';
import { toClientSafeErrorPayload } from '@/utils/apiResponse';
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

let isRefreshing = false;
let refreshWaiters: Array<(success: boolean) => void> = [];

function waitForRefresh(): Promise<boolean> {
  return new Promise((resolve) => {
    refreshWaiters.push(resolve);
  });
}

function flushRefreshWaiters(success: boolean) {
  refreshWaiters.forEach((cb) => cb(success));
  refreshWaiters = [];
}

function isRefreshable401(config: { url?: string; _retry?: boolean } | undefined): boolean {
  if (!config || config._retry) return false;
  const url = config.url ?? '';
  return (
    !url.includes('/api/v1/auth/refresh') &&
    !url.includes('/api/v1/auth/login') &&
    !url.includes('/api/v1/auth/admin/login') &&
    !url.includes('/api/v1/auth/logout')
  );
}

const finalizeResponseError = (error: {
  response?: { status?: number; data?: unknown };
  config?: { url?: string; skipErrorRedirect?: boolean };
}) => {
  console.error('[API ERROR INTERCEPTOR]:', error);

  const status = error.response?.status;
  const onErrorPage = isErrorPagePath(window.location.pathname);
  const url = error.config?.url ?? '';
  const isAuthRequest =
    url.includes('/api/v1/auth/login') ||
    url.includes('/api/v1/auth/admin/login') ||
    url.includes('/api/v1/auth/signup');

  const suppressErrorRedirect = hasPostLogoutRedirect();

  if (status && !onErrorPage && !error.config?.skipErrorRedirect && !suppressErrorRedirect) {
    if ((status === 401 || status === 403) && isAuthRequest) {
      const errorData = error.response?.data;
      const fallback =
        status === 403
          ? '접근이 제한된 계정입니다. 고객센터로 문의해 주세요.'
          : '이메일 또는 비밀번호가 올바르지 않습니다.';
      return Promise.reject(toClientSafeErrorPayload(errorData, status, fallback));
    }
    if (status === 423 && isAuthRequest) {
      const errorData = error.response?.data;
      return Promise.reject(
        toClientSafeErrorPayload(
          errorData,
          423,
          '로그인 시도 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요.',
        ),
      );
    }
    if (status === 401) {
      void performLogout();
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
  const fallback =
    status && status >= 500
      ? '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      : '요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.';
  return Promise.reject(toClientSafeErrorPayload(errorData, status, fallback));
};

const createAuthAwareErrorHandler = (instance: typeof userAxios) => {
  return async (error: {
    response?: { status?: number; data?: unknown };
    config?: { url?: string; _retry?: boolean; headers: Record<string, string>; skipErrorRedirect?: boolean };
  }) => {
    const status = error.response?.status;
    const config = error.config;

    if (status === 401 && isRefreshable401(config)) {
      if (isRefreshing) {
        const refreshed = await waitForRefresh();
        if (refreshed && config) {
          config._retry = true;
          return instance.request(config);
        }
        return finalizeResponseError(error);
      }

      isRefreshing = true;
      try {
        await refresh_token_api();
        flushRefreshWaiters(true);
        if (config) {
          config._retry = true;
          return instance.request(config);
        }
      } catch {
        flushRefreshWaiters(false);
      } finally {
        isRefreshing = false;
      }
    }

    return finalizeResponseError(error);
  };
};

userAxios.interceptors.response.use((response) => response.data, createAuthAwareErrorHandler(userAxios));
adminAxios.interceptors.response.use((response) => response.data, createAuthAwareErrorHandler(adminAxios));
