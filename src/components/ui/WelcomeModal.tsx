import React from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import welcomeImg from '@/assets/welcome.png';

export const WelcomeModal: React.FC = () => {
  const { 
    isWelcomePopupOpen, 
    closeWelcomePopup, 
  } = useTravelStore();

  // Handle ESC key press
  React.useEffect(() => {
    if (!isWelcomePopupOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWelcomePopup();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isWelcomePopupOpen, closeWelcomePopup]);

  if (!isWelcomePopupOpen) return null;

  return (
    <div 
      className="premium-popup-backdrop flex items-center justify-center p-4"
      style={{ 
        display: 'flex', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 99999,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)'
      }}
    >      <div 
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
          flexDirection: 'column'
        }}
      >
        {/* Top Image Section - Compact & High Speed Animation */}
        <div style={{ background: '#f8faff', padding: '40px 0 15px 0', textAlign: 'center', position: 'relative' }}>
          <div className="animate-[tilt_0.3s_ease-in-out_infinite_alternate]" style={{ display: 'inline-block' }}>
            <img 
              src={welcomeImg} 
              alt="Welcome" 
              style={{ width: '320px', height: '320px', objectFit: 'contain' }}
            />
          </div>
          
          <button 
            onClick={closeWelcomePopup} 
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
              zIndex: 10
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content Section - Compact Padding */}
        <div style={{ padding: '30px 50px 40px 50px', textAlign: 'center' }}>
          <div style={{ marginBottom: '25px' }}>
            <h2 className="font-logo" style={{ fontSize: '2.4rem', fontWeight: 900, lineHeight: 1.25, color: '#1a1a1a', letterSpacing: '-1.5px' }}>
              반가워요!<br/>
              <span className="highlight-text">온데 ONDE</span>와 시작해요
            </h2>
            <div style={{ width: '50px', height: '3px', background: '#005ce615', margin: '20px auto', borderRadius: '10px' }}></div>
            <p style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 700 }}>
              가입을 진심으로 축하드립니다! 🎉
            </p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <p style={{ fontSize: '1.4rem', color: '#334155', fontWeight: 800, lineHeight: 1.5 }}>
              "당신이 머문 모든 곳이<br/>아름다운 추억이 되도록"
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
                boxShadow: '0 10px 20px rgba(0, 92, 230, 0.2)'
              }}
              onClick={closeWelcomePopup}
            >
              여정 시작하기
            </button>
          </div>
          
          <div style={{ marginTop: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', opacity: 0.15 }}>
            <div style={{ height: '1px', flex: 1, background: '#444' }}></div>
            <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '5px', color: '#111' }}>PREMIUM JOURNEY</span>
            <div style={{ height: '1px', flex: 1, background: '#444' }}></div>
          </div>
        </div>
      </div>
      
      {/* Custom Keyframe Animations */}
      <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes tilt {
          0% { transform: rotate(-3deg) scale(1); }
          100% { transform: rotate(3deg) scale(1.05); }
        }
      `}</style>
    </div>
  );
};
