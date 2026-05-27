import React from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { activePortal, activePage } = useTravelStore();

  const heroImages: Record<string, string> = {
    home: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1600', // 숙소/호텔
    flight: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1600', // 항공권
    car: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&q=80&w=1600', // 렌터카
    ins: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1600', // 여행자 보험
    map: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1600', // 지도 탐색
    feed: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=1600' // 여행기
  };

  const getBgImage = () => {
    if (activePortal === 'sell') return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600'; // 파트너 오피스
    if (activePortal === 'adm') return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600'; // 어드민
    return heroImages[activePage] || heroImages['home'];
  };

  const isCompressedPadding = activePage !== 'flight' && activePage !== 'home';

  const getHeroTitle = () => {
    if (activePortal === 'sell') return 'ONDE 파트너 Extranet';
    if (activePortal === 'adm') return 'ONDE HQ 스태프 어드민';
    
    switch (activePage) {
      case 'home':
        return <>완벽한 쉼의 완성,<br />온데 <span className="highlight-text">숙소</span>에서.</>;
      case 'flight':
        return <>모든 여행의 시작점,<br />내가 <span className="highlight-text">온 데</span>부터.</>;
      case 'car':
        return <>더 넓은 세상으로,<br />온데 <span className="highlight-text">드라이브</span>와 함께.</>;
      case 'ins':
        return <>낯선 설렘 속에서도 든든하게,<br />온데 <span className="highlight-text">안심 케어</span>.</>;
      case 'map':
        return <>시각적인 실시간 경로 탐색,<br />온데 <span className="highlight-text">인터랙티브 맵</span>.</>;
      case 'feed':
        return <>추억을 나누고 영감을 더하다,<br />온데 <span className="highlight-text">스토리 피드</span>.</>;
      case 'mypage':
        return <>나만의 여행 가방,<br /><span className="highlight-text">마이페이지</span>.</>;
      default:
        return <>모든 여행의 시작점,<br />내가 <span className="highlight-text">온 데</span>부터.</>;
    }
  };

  const getHeroSubtitle = () => {
    if (activePortal === 'sell') return '입점 판매자를 위한 실시간 재고 관리 및 상품 수수료 대시보드 인터페이스 영역입니다.';
    if (activePortal === 'adm') return '전체 승인 상태 대기 노선 목록 및 강제 환불 API 모니터링 관리 포탈 영역입니다.';
    
    switch (activePage) {
      case 'home':
        return '지친 일상에 특별함을 더해줄 전국 엄선 독채와 프리미엄 호텔 스위트를 만나보세요.';
      case 'flight':
        return '온데와 일상에서 벗어나, 당신만의 특별한 일상을 완성하세요.';
      case 'car':
        return '최신식 컴팩트 세단부터 럭셔리 패밀리 SUV까지 완전 무사고 보장 렌터카 비교.';
      case 'ins':
        return '단 1분의 초간편 가입으로, 항공 지연부터 소중한 휴대품 손상까지 완벽 보장.';
      case 'map':
        return 'ONDE 실시간 교통 정보 및 테마별 핫플레이스를 지도 위에서 직관적으로 훑어보세요.';
      case 'feed':
        return '전 세계의 진짜 로컬 코스와 감각적인 리얼 포토 후기를 탐색해 보세요.';
      case 'mypage':
        return '온데에서 확보하신 실시간 확정 예약과 맞춤 혜택을 한 눈에 관리해 드립니다.';
      default:
        return '온데와 일상에서 벗어나, 당신만의 특별한 일상을 완성하세요.';
    }
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
            paddingBottom: activePortal === 'cust' && isCompressedPadding ? '5rem' : '8rem',
            transition: 'background-image 0.6s ease-in-out, padding-bottom 0.4s ease'
          }}
        >
          <div className="max-w-[1280px] mx-auto text-center relative z-10 flex flex-col items-center px-4">
            <h1 className="hero-title">{getHeroTitle()}</h1>
            <p className="hero-subtitle">{getHeroSubtitle()}</p>
          </div>
        </section>

        {/* Dynamic canvas wrapper */}
        <div className="flex-1 w-full">
          {children}
        </div>
      </main>

      {/* 3. Global Footer */}
      <Footer />
    </div>
  );
};
