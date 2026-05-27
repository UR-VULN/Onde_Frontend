import React from 'react';
import { useTravelStore } from '@/store/useTravelStore';

export const Header: React.FC = () => {
  const { 
    activePage, 
    isLoggedIn, 
    username, 
    setActivePage,
    logout,
    addToast,
    openAuthModal
  } = useTravelStore();

  const handlePageSwitch = (page: 'home' | 'flight' | 'car' | 'ins' | 'map' | 'feed' | 'mypage') => {
    setActivePage(page);
  };

  return (
    <header className="header select-none">
      <div className="navbar">
        {/* Brand Logo (Matching GmarketSans / Montserrat style) */}
        <div 
          className="logo select-none"
          onClick={() => handlePageSwitch('home')}
        >
          <div className="logo-box">
            <span className="logo-box-line">ON</span>
            <span className="logo-box-line">DE</span>
          </div>
          <span>온데</span>
        </div>

        {/* Navigation links (matching GNB capsule tab navigation) */}
        <nav className="nav-links">
          <button 
            type="button"
            className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => handlePageSwitch('home')}
          >
            <i className="fa-solid fa-hotel"></i>숙소
          </button>
          <button 
            type="button"
            className={`nav-item ${activePage === 'flight' ? 'active' : ''}`}
            onClick={() => handlePageSwitch('flight')}
          >
            <i className="fa-solid fa-plane"></i>항공권
          </button>
          <button 
            type="button"
            className={`nav-item ${activePage === 'car' ? 'active' : ''}`}
            onClick={() => handlePageSwitch('car')}
          >
            <i className="fa-solid fa-car"></i>렌터카
          </button>
          <button 
            type="button"
            className={`nav-item ${activePage === 'ins' ? 'active' : ''}`}
            onClick={() => handlePageSwitch('ins')}
          >
            <i className="fa-solid fa-shield-halved"></i>여행자 보험
          </button>
          <button 
            type="button"
            className={`nav-item ${activePage === 'map' ? 'active' : ''}`}
            onClick={() => handlePageSwitch('map')}
          >
            <i className="fa-solid fa-map-location-dot"></i>지도 탐색
          </button>
          <button 
            type="button"
            className={`nav-item ${activePage === 'feed' ? 'active' : ''}`}
            onClick={() => handlePageSwitch('feed')}
          >
            <i className="fa-solid fa-route"></i>여행기
          </button>
        </nav>

        {/* Actions / Auth */}
        <div className="nav-actions flex items-center gap-3 relative">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-black text-slate-700">
                👑 <span className="text-primary">{username ? username.split('@')[0] : '사용자'}</span> 님
              </span>
              
              <button 
                type="button"
                className={`nav-item ${activePage === 'mypage' ? 'active' : ''}`}
                onClick={() => handlePageSwitch('mypage')}
              >
                <i className="fa-solid fa-circle-user"></i>마이페이지
              </button>

              <button 
                type="button"
                className="text-sm font-black text-rose-500 px-2 py-1 hover:text-rose-600 transition-all"
                onClick={() => {
                  logout();
                  addToast("안전하게 로그아웃되었습니다.", "info");
                }}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <>
              <button 
                type="button"
                className="btn-primary cursor-pointer active:scale-95 transition-all" 
                style={{ padding: '0.6rem 1.3rem', fontSize: '0.82rem', fontWeight: 800 }}
                onClick={() => openAuthModal('login')}
              >
                로그인
              </button>
              <button 
                type="button"
                className="btn-secondary cursor-pointer active:scale-95 transition-all"
                style={{ padding: '0.6rem 1.3rem', fontSize: '0.82rem', fontWeight: 800 }}
                onClick={() => openAuthModal('signup')}
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
