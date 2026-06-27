import { useCallback, useRef } from 'react';
import { adminAxios } from '@/api/axiosInstance';
import { unwrapApi } from '@/utils/apiResponse';

export interface AdminSettlementRevealDto {
  settlementId: number;
  sellerName: string;
  bankName: string;
  accountNumber: string;
}

/** 관리자 정산 원문 — 비밀번호 확인 후 POST /admin/settlements/{id}/reveal */
export function useAdminSettlementReveal() {
  const cacheRef = useRef<Map<number, AdminSettlementRevealDto>>(new Map());
  const inflightRef = useRef<Map<number, Promise<AdminSettlementRevealDto>>>(new Map());

  const load = useCallback(async (settlementId: number, password: string): Promise<AdminSettlementRevealDto> => {
    const cached = cacheRef.current.get(settlementId);
    if (cached) {
      return cached;
    }

    let inflight = inflightRef.current.get(settlementId);
    if (!inflight) {
      inflight = adminAxios
        .post(`/api/v1/admin/settlements/${settlementId}/reveal`, { password })
        .then((raw) => unwrapApi<AdminSettlementRevealDto>(raw))
        .then((res) => {
          if (!res.data) {
            throw new Error(res.message || '정산 원문을 불러오지 못했습니다.');
          }
          cacheRef.current.set(settlementId, res.data);
          return res.data;
        })
        .finally(() => {
          inflightRef.current.delete(settlementId);
        });
      inflightRef.current.set(settlementId, inflight);
    }
    return inflight;
  }, []);

  const revealField = useCallback(
    async (
      settlementId: number,
      field: keyof AdminSettlementRevealDto,
      password: string,
    ): Promise<string> => {
      const data = await load(settlementId, password);
      if (field === 'settlementId') {
        return String(data.settlementId);
      }
      return data[field] ?? '';
    },
    [load],
  );

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return { revealField, clearCache };
}
