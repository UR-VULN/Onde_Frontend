import { useCallback, useRef } from 'react';
import { adminAxios } from '@/api/axiosInstance';
import { unwrapApi } from '@/utils/apiResponse';

export interface AdminMemberRevealDto {
  memberId: number;
  email: string;
  name: string;
}

/** 관리자 회원 원문 — 비밀번호 확인 후 POST /admin/members/{id}/reveal */
export function useAdminMemberReveal() {
  const cacheRef = useRef<Map<number, AdminMemberRevealDto>>(new Map());
  const inflightRef = useRef<Map<number, Promise<AdminMemberRevealDto>>>(new Map());

  const load = useCallback(async (memberId: number, password: string): Promise<AdminMemberRevealDto> => {
    const cached = cacheRef.current.get(memberId);
    if (cached) {
      return cached;
    }

    let inflight = inflightRef.current.get(memberId);
    if (!inflight) {
      inflight = adminAxios
        .post(`/api/v1/admin/members/${memberId}/reveal`, { password })
        .then((raw) => unwrapApi<AdminMemberRevealDto>(raw))
        .then((res) => {
          if (!res.data) {
            throw new Error(res.message || '회원 원문을 불러오지 못했습니다.');
          }
          cacheRef.current.set(memberId, res.data);
          return res.data;
        })
        .finally(() => {
          inflightRef.current.delete(memberId);
        });
      inflightRef.current.set(memberId, inflight);
    }
    return inflight;
  }, []);

  const revealField = useCallback(
    async (
      memberId: number,
      field: keyof AdminMemberRevealDto,
      password: string,
    ): Promise<string> => {
      const data = await load(memberId, password);
      if (field === 'memberId') {
        return String(data.memberId);
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
