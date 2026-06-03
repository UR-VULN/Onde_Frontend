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
      className="premium-popup-backdrop flex items-center justify-center p-4 fixed top-0 left-0 w-screen h-screen z-[99999] bg-black/60 backdrop-blur-md"
    >
      <div 
        className="animate-[scaleUp_0.4s_cubic-bezier(0.34,1.56,0.64,1)] relative w-full max-w-[540px] rounded-[24px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Image Section - Compact & High Speed Animation */}
        <div className="bg-[#f8faff] pt-10 pb-[15px] text-center relative">
          <div className="animate-[tilt_0.2s_ease-in-out_infinite_alternate] inline-block">
            <img 
              src={welcomeImg} 
              alt="Welcome" 
              className="w-[320px] h-[320px] object-contain"
            />
          </div>
          
          <button 
            onClick={closeWelcomePopup} 
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] cursor-pointer text-[#bbb] text-base flex items-center justify-center z-10"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content Section - Compact Padding */}
        <div className="px-[50px] pt-[30px] pb-10 text-center">
          <div className="mb-[25px]">
            <h2 className="font-logo text-[2.4rem] font-black leading-snug text-[#1a1a1a] tracking-[-1.5px]">
              반가워요!<br/>
              <span className="highlight-text">온데 ONDE</span>와 시작해요
            </h2>
            <div className="w-[50px] h-[3px] bg-[#005ce6]/10 mx-auto my-5 rounded-[10px]"></div>
            <p className="text-[1.2rem] text-[#94a3b8] font-bold">
              가입을 진심으로 축하드립니다! 🎉
            </p>
          </div>

          <div className="mb-[30px]">
            <p className="text-[1.4rem] text-[#334155] font-extrabold leading-normal">
              "당신이 머문 모든 곳이<br/>아름다운 추억이 되도록"
            </p>
          </div>
          
          <div className="px-2.5">
            <button 
              type="button"
              className="btn-primary w-full p-[18px] text-[1.25rem] font-black rounded-2xl shadow-[0_10px_20px_rgba(0,92,230,0.2)]"
              onClick={closeWelcomePopup}
            >
              여정 시작하기
            </button>
          </div>
          
          <div className="mt-[35px] flex items-center justify-center gap-[15px] opacity-15">
            <div className="h-[1px] flex-1 bg-[#444]"></div>
            <span className="text-[0.7rem] font-black tracking-[5px] text-[#111]">PREMIUM JOURNEY</span>
            <div className="h-[1px] flex-1 bg-[#444]"></div>
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
