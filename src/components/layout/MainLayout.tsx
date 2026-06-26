import React, { useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useTravelStore } from '@/store/useTravelStore';
import { isSellerRole, isAdminRole, getDefaultPathForRole } from '@/utils/memberRole';

// Import local assets for Hero section background images
import stayBg from '@/assets/stay.avif';
import flightBg from '@/assets/flight.avif';
import carBg from '@/assets/car.avif';
import insureBg from '@/assets/insure.avif';
import mapBg from '@/assets/map.avif';
import diaryBg from '@/assets/diary.avif';
import mypageBg from '@/assets/mypage.avif';

interface MainLayoutProps {
  children?: React.ReactNode; // optional: still supports direct usage (AdminPage)
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, memberRole, addToast } = useTravelStore();

  useEffect(() => {
    if (isLoggedIn) {
      if (isSellerRole(memberRole)) {
        addToast('잘못된 접근입니다. 판매자 페이지로 이동합니다.', 'warning');
      } else if (isAdminRole(memberRole)) {
        addToast('잘못된 접근입니다. 관리자 페이지로 이동합니다.', 'warning');
      }
    }
  }, [isLoggedIn, memberRole, addToast]);

  if (isLoggedIn) {
    if (isSellerRole(memberRole)) {
      return <Navigate to="/seller" replace />;
    }
    if (isAdminRole(memberRole)) {
      return <Navigate to={getDefaultPathForRole(memberRole ?? '')} replace />;
    }
  }


  const heroImages: Record<string, string> = {
    '/':           stayBg,
    '/flight':     flightBg,
    '/car':        carBg,
    '/insurance':  insureBg,
    '/map':        mapBg,
    '/feed':       diaryBg,
    '/mypage':     mypageBg,
  };

  const getBgImage = () => heroImages[location.pathname] ?? heroImages['/'];

  const getHeroTitle = () => (
    <>
      모든 여행의 시작점,<br />내가 <span className="highlight-text">온 데</span>부터.
    </>
  );

  const getHeroSubtitle = () =>
    '가장 나다운 일상에서 출발하여, 온전한 나로 되돌아오는 따뜻한 여정';

  const heroPaddingBottom = '5.5rem';

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fa] text-slate-700 font-main">
      {/* 1. Global Header GNB */}
      <Header />

      {/* 2. Main content area */}
      <main className="flex-1 w-full flex flex-col">
        {/* Giant Hero Banner with Dynamic background */}
        <section
          className="hero select-none"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url("${getBgImage()}")`,
            paddingBottom: heroPaddingBottom,
            transition: 'background-image 0.6s ease-in-out'
          }}
        >
          <div className="max-w-[1280px] mx-auto text-center relative z-10 flex flex-col items-center px-4">
            <h1 className="hero-title">{getHeroTitle()}</h1>
            <p className="hero-subtitle">{getHeroSubtitle()}</p>
          </div>
        </section>

        {/* Dynamic canvas wrapper — max-width + self-centered, hero above is unaffected */}
        <div className="self-center w-full max-w-[1280px] px-8 pb-20 flex flex-col items-stretch animate-[fadeIn_0.3s_ease]">
          {children ?? <Outlet />}
        </div>
      </main>

      {/* 3. Global Footer */}
      <Footer />
    </div>
  );
};
