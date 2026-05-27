import React, { useState } from 'react';
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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handlePageSwitch = (page: 'home' | 'flight' | 'car' | 'ins' | 'map' | 'feed' | 'mypage') => {
    setActivePage(page);
    setIsDropdownOpen(false);
  };

  const handlePortalSwitch = (portal: 'cust' | 'sell' | 'adm') => {
    useTravelStore.getState().setActivePortal(portal);
    setIsDropdownOpen(false);
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
          
          {/* MyPage tab appears ONLY when logged in! */}
          {isLoggedIn && (
            <button 
              type="button"
              className={`nav-item ${activePage === 'mypage' ? 'active' : ''}`}
              onClick={() => handlePageSwitch('mypage')}
            >
              <i className="fa-solid fa-circle-user"></i>마이페이지
            </button>
          )}
        </nav>

        {/* Actions / Auth */}
        <div className="nav-actions flex items-center gap-3 relative">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 hidden sm:block">
                👑 <span className="text-primary">{username}</span> 님
              </span>
              
              {/* User Avatar Menu Trigger */}
              <div 
                className="user-menu border border-slate-200/80 rounded-full hover:shadow-sm relative" 
                id="cust-user-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <i className="fa-solid fa-bars" style={{ color: 'var(--text-muted)' }}></i>
                <div className="avatar" id="avatar-circle">HM</div>

                {/* Glassmorphism Dropdown Menu */}
                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 top-[120%] w-48 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl py-2 flex flex-col z-50 animate-[fadeIn_0.15s_ease-out]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      type="button"
                      className="px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-primary transition-all flex items-center gap-2"
                      onClick={() => handlePageSwitch('mypage')}
                    >
                      <i className="fa-solid fa-circle-user text-primary"></i> 마이페이지
                    </button>
                    <button 
                      type="button"
                      className="px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-secondary transition-all flex items-center gap-2"
                      onClick={() => handlePortalSwitch('sell')}
                    >
                      <i className="fa-solid fa-hotel text-secondary"></i> 판매자 백오피스
                    </button>
                    <button 
                      type="button"
                      className="px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-all flex items-center gap-2"
                      onClick={() => handlePortalSwitch('adm')}
                    >
                      <i className="fa-solid fa-users-gear text-emerald-500"></i> 본사 관리자
                    </button>
                    <div className="h-[1px] bg-slate-100 my-1"></div>
                    <button 
                      type="button"
                      className="px-4 py-2.5 text-left text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all flex items-center gap-2"
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                        addToast("안전하게 로그아웃되었습니다.", "info");
                      }}
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket"></i> 로그아웃
                    </button>
                  </div>
                )}
              </div>
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
