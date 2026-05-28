import React from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import waitingImg from '@/assets/waiting.png';

export const SellerPendingModal: React.FC = () => {
  const { isSellerPendingPopupOpen, closeSellerPendingPopup } = useTravelStore();

  React.useEffect(() => {
    if (!isSellerPendingPopupOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSellerPendingPopup();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isSellerPendingPopupOpen, closeSellerPendingPopup]);

  if (!isSellerPendingPopupOpen) return null;

  return (
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="animate-[scaleUp_0.4s_cubic-bezier(0.34,1.56,0.64,1)]"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '540px',
          borderRadius: '24px',
          background: 'white',
          boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Image Section */}
        <div style={{ background: '#f8faff', padding: '40px 0 15px 0', textAlign: 'center', position: 'relative' }}>
          <div className="animate-[glowPulse_2.8s_ease-in-out_infinite]" style={{ display: 'inline-block' }}>
            <img
              src={waitingImg}
              alt="Waiting for approval"
              style={{ width: '320px', height: '320px', objectFit: 'contain' }}
            />
          </div>

          <button
            onClick={closeSellerPendingPopup}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'white',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              color: '#bbb',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content Section */}
        <div style={{ padding: '30px 50px 40px 50px', textAlign: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 className="font-logo" style={{ fontSize: '2.4rem', fontWeight: 900, lineHeight: 1.25, color: '#1a1a1a', letterSpacing: '-1.5px' }}>
              판매자 신청이<br />
              <span className="highlight-text">완료</span>되었습니다!
            </h2>
            <div style={{ width: '50px', height: '3px', background: '#005ce615', margin: '20px auto', borderRadius: '10px' }}></div>
          </div>

          {/* Notice Box */}
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '14px',
              padding: '18px 20px',
              marginBottom: '28px',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', marginBottom: '10px' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#f59e0b', fontSize: '1.1rem' }}></i>
              <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#92400e' }}>
                승인 대기 중
              </p>
            </div>
            <p style={{ fontSize: '1rem', color: '#a16207', fontWeight: 700, lineHeight: 1.7 }}>
              관리자가 계정을 승인하기 전까지는<br />
              판매자 포탈에 로그인할 수 없습니다.
            </p>
          </div>

          <div style={{ padding: '0 10px' }}>
            <button
              type="button"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '18px',
                fontSize: '1.25rem',
                fontWeight: 900,
                borderRadius: '16px',
                boxShadow: '0 10px 20px rgba(0, 92, 230, 0.2)',
              }}
              onClick={closeSellerPendingPopup}
            >
              확인했습니다
            </button>
          </div>

          <div style={{ marginTop: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', opacity: 0.15 }}>
            <div style={{ height: '1px', flex: 1, background: '#444' }}></div>
            <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '5px', color: '#111' }}>ONDE PARTNER</span>
            <div style={{ height: '1px', flex: 1, background: '#444' }}></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes glowPulse {
          0%   { filter: drop-shadow(0 0 0px rgba(0,92,230,0)); transform: scale(1); }
          50%  { filter: drop-shadow(0 0 18px rgba(0,92,230,0.22)); transform: scale(1.04); }
          100% { filter: drop-shadow(0 0 0px rgba(0,92,230,0)); transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
