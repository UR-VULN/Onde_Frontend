import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTravelStore } from '@/store/useTravelStore';
import { Header } from './Header';
import { Footer } from './Footer';

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
  const { activePortal } = useTravelStore();
  const location = useLocation();

  const heroImages: Record<string, string> = {
    '/':           stayBg,
    '/flight':     flightBg,
    '/car':        carBg,
    '/insurance':  insureBg,
    '/map':        mapBg,
    '/feed':       diaryBg,
    '/mypage':     mypageBg,
  };

  const getBgImage = () => {
    if (activePortal === 'sell') return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600';
    if (activePortal === 'adm')  return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600';
    return heroImages[location.pathname] ?? heroImages['/'];
  };

  const getHeroTitle = () => {
    if (activePortal === 'sell') return 'ONDE 파트너 Extranet';
    if (activePortal === 'adm')  return 'ONDE HQ 스태프 어드민';
    return <>모든 여행의 시작점,<br />내가 <span className="highlight-text">온 데</span>부터.</>;
  };

  const getHeroSubtitle = () => {
    if (activePortal === 'sell') return '입점 판매자를 위한 실시간 재고 관리 및 상품 수수료 대시보드 인터페이스 영역입니다.';
    if (activePortal === 'adm')  return '전체 승인 상태 대기 노선 목록 및 강제 환불 API 모니터링 관리 포탈 영역입니다.';
    return '가장 나다운 일상에서 출발하여, 온전한 나로 되돌아오는 따뜻한 여정';
  };

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
            paddingBottom: '8rem',
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
