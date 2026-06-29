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
      className="fixed top-0 left-0 w-screen h-screen z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        className="animate-[scaleUp_0.4s_cubic-bezier(0.34,1.56,0.64,1)] relative w-full max-w-[540px] rounded-[24px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Image Section */}
        <div className="bg-[#f8faff] pt-10 pb-[15px] text-center relative">
          <div className="animate-[glowPulse_2.8s_ease-in-out_infinite] inline-block">
            <img
              src={waitingImg}
              alt="Waiting for approval"
              className="w-[320px] h-[320px] object-contain"
            />
          </div>

          <button
            onClick={closeSellerPendingPopup}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] cursor-pointer text-[#bbb] text-base flex items-center justify-center z-10"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content Section */}
        <div className="px-[50px] pt-[30px] pb-10 text-center">
          <div className="mb-5">
            <h2 className="font-logo text-[2.4rem] font-black leading-snug text-[#1a1a1a] tracking-[-1.5px]">
              판매자 신청이<br />
              <span className="highlight-text">완료</span>되었습니다!
            </h2>
            <div className="w-[50px] h-[3px] bg-[#005ce6]/10 mx-auto my-5 rounded-[10px]"></div>
          </div>

          {/* Notice Box */}
          <div className="bg-[#fffbeb] border border-[#fde68a] rounded-[14px] px-5 py-[18px] mb-7 text-center">
            <div className="flex items-center justify-start gap-2 mb-2.5">
              <i className="fa-solid fa-triangle-exclamation text-[#f59e0b] text-[1.1rem]"></i>
              <p className="text-[1.05rem] font-extrabold text-[#92400e]">
                승인 대기 중
              </p>
            </div>
            <p className="text-[1rem] text-[#a16207] font-bold leading-[1.7]">
              관리자가 계정을 승인하기 전까지는<br />
              판매자 포탈에 로그인할 수 없습니다.
            </p>
          </div>

          <div className="px-2.5">
            <button
              type="button"
              className="btn-primary w-full p-[18px] text-[1.25rem] font-black rounded-2xl shadow-[0_10px_20px_rgba(0, 92, 230, 0.2)]"
              onClick={closeSellerPendingPopup}
            >
              확인했습니다
            </button>
          </div>

          <div className="mt-[35px] flex items-center justify-center gap-[15px] opacity-15">
            <div className="h-[1px] flex-1 bg-[#444]"></div>
            <span className="text-[0.7rem] font-black tracking-[5px] text-[#111]">ONDE PARTNER</span>
            <div className="h-[1px] flex-1 bg-[#444]"></div>
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
