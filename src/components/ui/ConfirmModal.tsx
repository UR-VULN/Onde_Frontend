import React from 'react';
import { useTravelStore } from '@/store/useTravelStore';

export const ConfirmModal: React.FC = () => {
  const { 
    isConfirmPopupOpen, 
    closeConfirmPopup,
    confirmTitle,
    confirmDescription,
    confirmYesLabel,
    confirmNoLabel
  } = useTravelStore();

  // Handle ESC key press
  React.useEffect(() => {
    if (!isConfirmPopupOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeConfirmPopup(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isConfirmPopupOpen, closeConfirmPopup]);

  if (!isConfirmPopupOpen) return null;

  return (
    <div 
      className="premium-popup-backdrop flex items-center justify-center p-4"
      style={{ display: 'flex' }}
    >
      <div 
        className="premium-popup-modal max-w-[420px] text-center p-10 animate-[scaleUp_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        <div className="w-[70px] h-[70px] rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 text-primary text-[2.2rem]">
          <i className="fa-regular fa-circle-question"></i>
        </div>
        <h3 className="text-[1.3rem] font-extrabold text-slate-800 mb-3 tracking-tight">
          {confirmTitle || '해당 예약을 취소하시겠습니까?'}
        </h3>
        <p className="text-[0.9rem] text-slate-500 leading-relaxed mb-8 whitespace-pre-wrap">
          {confirmDescription || '취소 시 규정에 따라 위약금이 발생할 수 있으며,\n한 번 취소된 내역은 복구가 불가능합니다.'}
        </p>
        <div className="flex gap-3 text-xs font-bold select-none">
          <button 
            className="btn-primary flex-[1.2] py-3.5 font-extrabold" 
            onClick={() => closeConfirmPopup(true)}
          >
            {confirmYesLabel || '네, 취소하겠습니다'}
          </button>
          <button 
            className="btn-secondary flex-1 py-3.5 border-slate-200 text-slate-400" 
            onClick={() => closeConfirmPopup(false)}
          >
            {confirmNoLabel || '아니오, 유지할게요'}
          </button>
        </div>
      </div>
    </div>
  );
};
