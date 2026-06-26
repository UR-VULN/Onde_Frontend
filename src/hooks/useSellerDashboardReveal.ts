import { useCallback, useRef } from 'react';
import { sellerAxios } from '@/api/axiosInstance';
import { unwrapApi } from '@/utils/apiResponse';

export interface SellerDashboardRevealDto {
  email: string;
  bankName: string | null;
  accountNumber: string | null;
}

/** 판매자 대시보드 원문 — 비밀번호 확인 후 POST /seller/dashboard/reveal */
export function useSellerDashboardReveal() {
  const cacheRef = useRef<SellerDashboardRevealDto | null>(null);
  const inflightRef = useRef<Promise<SellerDashboardRevealDto> | null>(null);

  const load = useCallback(async (password: string): Promise<SellerDashboardRevealDto> => {
    if (cacheRef.current) {
      return cacheRef.current;
    }
    if (!inflightRef.current) {
      inflightRef.current = sellerAxios
        .post('/api/v1/seller/dashboard/reveal', { password })
        .then((raw) => unwrapApi<SellerDashboardRevealDto>(raw))
        .then((res) => {
          if (!res.data) {
            throw new Error(res.message || '대시보드 원문을 불러오지 못했습니다.');
          }
          cacheRef.current = res.data;
          return res.data;
        })
        .finally(() => {
          inflightRef.current = null;
        });
    }
    return inflightRef.current;
  }, []);

  const revealField = useCallback(
    async (field: keyof SellerDashboardRevealDto, password: string): Promise<string> => {
      const data = await load(password);
      const value = data[field];
      return value ?? '';
    },
    [load],
  );

  const clearCache = useCallback(() => {
    cacheRef.current = null;
  }, []);

  return { revealField, clearCache };
}
