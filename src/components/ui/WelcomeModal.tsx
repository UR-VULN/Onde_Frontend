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
    >      <div 
        className="premium-popup-modal animate-[scaleUp_0.4s_cubic-bezier(0.34,1.56,0.64,1)] overflow-visible max-w-[440px] w-full"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', borderRadius: '32px', border: 'none', background: 'white' }}
      >
        {/* Close Button */}
        <button 
          onClick={closeWelcomePopup} 
          className="absolute top-5 right-5 z-30 text-slate-300 hover:text-rose-500 transition-colors duration-200 text-2xl"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Mascot Image Section - Redesigned for better integration */}
        <div className="relative h-44 overflow-visible flex justify-center">
           {/* Background decorative circle */}
           <div className="absolute top-[-60px] w-64 h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl -z-10 animate-pulse"></div>
           
           <div className="absolute -top-24 w-52 h-52 drop-shadow-[0_25px_35px_rgba(0,0,0,0.18)] animate-[float_3s_ease-in-out_infinite]">
             <img 
               src={welcomeImg} 
               alt="Welcome ONDE" 
               className="w-full h-full object-contain transform scale-110"
             />
           </div>
        </div>
        
        {/* Celebration Content */}
        <div className="pb-12 px-10 text-center select-none bg-gradient-to-b from-white via-white to-primary/5 rounded-b-[32px]">
          <h2 className="font-logo font-[900] text-[2.2rem] leading-tight mb-3 tracking-tighter text-[#1e293b]">
            반가워요!<br/>
            <span className="highlight-text">온데 ONDE</span>의 새로운 친구
          </h2>
          
          <div className="w-16 h-1.5 bg-gradient-to-r from-primary to-secondary mx-auto mb-8 rounded-full opacity-80"></div>

          <div className="space-y-2 mb-10">
            <p className="text-[1.6rem] text-[#1e293b] font-extrabold tracking-tight">
              온데에 오신 것을 환영합니다! 🎉
            </p>
            <p className="text-[1.05rem] leading-relaxed text-slate-500 font-medium">
              세상의 모든 장소가 특별한 추억이 되는<br/>
              온데만의 여정을 지금 바로 시작해보세요. ✨
            </p>
          </div>
          
          {/* Decorative Message Card */}
          <div className="bg-gradient-to-r from-primary/[0.03] to-secondary/[0.03] border border-primary/10 rounded-2xl p-5 mb-8 relative">
             <p className="text-[0.9rem] text-slate-600 font-bold italic leading-relaxed">
               "당신이 머문 모든 곳이<br/>아름다운 추억이 되도록 온데가 함께할게요."
             </p>
          </div>

          <button 
            type="button"
            className="btn-primary w-full py-4.5 text-[1.15rem] font-[900] shadow-[0_15px_35px_-5px_rgba(0,92,230,0.4)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 rounded-2xl" 
            onClick={closeWelcomePopup}
          >
            기분 좋게 여정 시작하기 <i className="fa-solid fa-heart ml-2 animate-pulse"></i>
          </button>
          
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-slate-200"></div>
            <span className="text-[0.7rem] text-slate-400 font-extrabold tracking-[0.3em] uppercase">
              Start Your ONDE
            </span>
            <div className="h-[1px] w-8 bg-slate-200"></div>
          </div>
        </div>
      </div>
      
      {/* Custom Keyframe Animations */}
      <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};