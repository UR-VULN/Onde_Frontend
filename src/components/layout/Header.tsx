import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTravelStore } from '@/store/useTravelStore';
import { RevealableMaskedText } from '@/components/common/RevealableMaskedText';
import { useMemberProfileReveal } from '@/hooks/useMemberProfileReveal';
import { maskEmail, maskName } from '@/utils/personalDataMask';
import { performLogout } from '@/utils/authSession';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isLoggedIn,
    username,
    name,
    nickname,
    addToast,
    openAuthModal,
  } = useTravelStore();

  const { revealField } = useMemberProfileReveal();

  // Active check by current URL pathname
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    void performLogout({ redirectTo: '/' }).then(() => {
      addToast('안전하게 로그아웃되었습니다.', 'info');
    });
  };

  const headerDisplayName = nickname ? (
    nickname
  ) : name ? (
    <RevealableMaskedText
      maskedValue={maskName(name)}
      getPlaintext={(password) => revealField('name', password)}
      showIcon={false}
    />
  ) : username ? (
    <RevealableMaskedText
      maskedValue={maskEmail(username)}
      getPlaintext={(password) => revealField('email', password)}
      showIcon={false}
    />
  ) : (
    '사용자'
  );

  return (
    <header className="header select-none">
      <div className="navbar">
        {/* Brand Logo */}
        <div
          className="logo select-none"
          onClick={() => navigate('/')}
        >
          <div className="logo-box">
            <span className="logo-box-line">ON</span>
            <span className="logo-box-line">DE</span>
          </div>
          <span>온데</span>
        </div>

        {/* Navigation links */}
        <nav className="nav-links">
          <button
            type="button"
            className={`nav-item ${isActive('/') ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <i className="fa-solid fa-hotel"></i>숙소
          </button>
          <button
            type="button"
            className={`nav-item ${isActive('/flight') ? 'active' : ''}`}
            onClick={() => navigate('/flight')}
          >
            <i className="fa-solid fa-plane"></i>항공권
          </button>
          <button
            type="button"
            className={`nav-item ${isActive('/car') ? 'active' : ''}`}
            onClick={() => navigate('/car')}
          >
            <i className="fa-solid fa-car"></i>렌터카
          </button>
          <button
            type="button"
            className={`nav-item ${isActive('/insurance') ? 'active' : ''}`}
            onClick={() => navigate('/insurance')}
          >
            <i className="fa-solid fa-shield-halved"></i>여행자 보험
          </button>
          <button
            type="button"
            className={`nav-item ${isActive('/map') ? 'active' : ''}`}
            onClick={() => navigate('/map')}
          >
            <i className="fa-solid fa-map-location-dot"></i>지도 탐색
          </button>
          <button
            type="button"
            className={`nav-item ${isActive('/feed') ? 'active' : ''}`}
            onClick={() => navigate('/feed')}
          >
            <i className="fa-solid fa-route"></i>여행기
          </button>
        </nav>

        {/* Auth Actions */}
        <div className="nav-actions flex items-center gap-3 relative">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-black text-slate-700">
                👑 <span className="text-primary">{headerDisplayName}</span> 님
              </span>

              <button
                type="button"
                className={`nav-item ${isActive('/mypage') ? 'active' : ''}`}
                onClick={() => navigate('/mypage')}
              >
                <i className="fa-solid fa-circle-user"></i>마이페이지
              </button>

              <button
                type="button"
                className="text-sm font-black text-rose-500 px-2 py-1 hover:text-rose-600 transition-all"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="btn-primary cursor-pointer active:scale-95 transition-all px-[21px] py-[10px] text-[0.82rem] font-extrabold"
                onClick={() => openAuthModal('login')}
              >
                로그인
              </button>
              <button
                type="button"
                className="btn-secondary cursor-pointer active:scale-95 transition-all px-[21px] py-[10px] text-[0.82rem] font-extrabold"
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
