import { useEffect } from 'react';

import { fetch_member_profile_api } from '@/api/userApi';

import { fetch_my_reservations_api, mapReservationDtoToMyPage } from '@/api/reservationsApi';

import { useTravelStore } from '@/store/useTravelStore';

import { consumePostLogoutRedirect, hasPostLogoutRedirect, restoreSessionFromServer } from '@/utils/authSession';



/** 부팅 후 서버 세션 복구 및 마일리지·예약 API 동기화 */

export const AuthBootstrap: React.FC = () => {

  const isLoggedIn = useTravelStore((s) => s.isLoggedIn);

  const setMemberProfile = useTravelStore((s) => s.setMemberProfile);

  const setReservations = useTravelStore((s) => s.setReservations);



  useEffect(() => {

    let cancelled = false;



    const bootstrap = async () => {

      if (!isLoggedIn) {

        if (hasPostLogoutRedirect()) {
          consumePostLogoutRedirect();
          return;
        }

        await restoreSessionFromServer();

      }

      if (cancelled || !useTravelStore.getState().isLoggedIn) return;



      try {

        const [profileRes, reservationsRes] = await Promise.all([

          fetch_member_profile_api({ skipErrorRedirect: true }),

          fetch_my_reservations_api({ skipErrorRedirect: true }),

        ]);

        if (cancelled) return;

        if (profileRes.success && profileRes.data) {

          setMemberProfile(profileRes.data);

        }

        if (reservationsRes.success && reservationsRes.data?.reservations) {

          setReservations(reservationsRes.data.reservations.map(mapReservationDtoToMyPage));

        }

      } catch {

        /* 프로필/예약 API 실패 시 스토어 기본값 유지 */

      }

    };



    void bootstrap();



    return () => {

      cancelled = true;

    };

  }, [isLoggedIn, setMemberProfile, setReservations]);



  return null;

};

