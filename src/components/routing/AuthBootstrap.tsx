import { useEffect } from 'react';
import { fetch_member_profile_api } from '@/api/userApi';
import { fetch_my_reservations_api, mapReservationDtoToMyPage } from '@/api/reservationsApi';
import { useTravelStore } from '@/store/useTravelStore';
import { hasAuthSession, restoreSessionFromCookies } from '@/utils/authCookies';

/** 부팅 후 마일리지·등급 API 동기화 (쿠키 세션은 main.tsx에서 동기 복구) */
export const AuthBootstrap: React.FC = () => {
  const isLoggedIn = useTravelStore((s) => s.isLoggedIn);
  const setMemberProfile = useTravelStore((s) => s.setMemberProfile);
  const setReservations = useTravelStore((s) => s.setReservations);

  useEffect(() => {
    if (!hasAuthSession() && !isLoggedIn) return;

    if (!isLoggedIn) {
      restoreSessionFromCookies();
    }

    let cancelled = false;

    Promise.all([fetch_member_profile_api(), fetch_my_reservations_api()])
      .then(([profileRes, reservationsRes]) => {
        if (cancelled) return;
        if (profileRes.success && profileRes.data) {
          setMemberProfile(profileRes.data);
        }
        if (reservationsRes.success && reservationsRes.data?.reservations) {
          setReservations(reservationsRes.data.reservations.map(mapReservationDtoToMyPage));
        }
      })
      .catch(() => {
        /* Mock/오프라인 시 스토어 기본값 유지 */
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, setMemberProfile, setReservations]);

  return null;
};
