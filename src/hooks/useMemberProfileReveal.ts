import { useCallback, useRef } from 'react';
import { userAxios } from '@/api/axiosInstance';
import { unwrapApi } from '@/utils/apiResponse';

export interface MemberProfileRevealDto {
  email: string;
  name: string;
  phoneNumber: string;
}

/** 프로필 원문 — 비밀번호 확인 후 POST /profile/reveal */
export function useMemberProfileReveal() {
  const cacheRef = useRef<MemberProfileRevealDto | null>(null);
  const inflightRef = useRef<Promise<MemberProfileRevealDto> | null>(null);

  const load = useCallback(async (password: string): Promise<MemberProfileRevealDto> => {
    if (cacheRef.current) {
      return cacheRef.current;
    }
    if (!inflightRef.current) {
      inflightRef.current = userAxios
        .post('/api/v1/members/me/profile/reveal', { password })
        .then((raw) => unwrapApi<MemberProfileRevealDto>(raw))
        .then((res) => {
          if (!res.data) {
            throw new Error(res.message || '프로필 원문을 불러오지 못했습니다.');
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
    async (field: keyof MemberProfileRevealDto, password: string): Promise<string> => {
      const data = await load(password);
      return data[field] ?? '';
    },
    [load],
  );

  const clearCache = useCallback(() => {
    cacheRef.current = null;
  }, []);

  return { revealField, clearCache };
}
