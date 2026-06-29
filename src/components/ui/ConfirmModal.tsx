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
    <div className="premium-popup-backdrop">
      <div 
        className="premium-popup-modal w-[420px] text-center px-8 py-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-[70px] h-[70px] rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6 text-[var(--primary)] text-[2.2rem] border-[1.5px] border-blue-500/15">
          <i className="fa-regular fa-circle-question"></i>
        </div>
        <h3 className="text-[1.3rem] font-extrabold text-[var(--text-dark)] mb-3 tracking-[-0.5px]">
          {confirmTitle || '해당 예약을 취소하시겠습니까?'}
        </h3>
        <p className="text-[0.9rem] text-[var(--text-muted)] leading-[1.6] mb-8">
          {confirmDescription || '취소 시 규정에 따라 위약금이 발생할 수 있으며,\n한 번 취소된 내역은 복구가 불가능합니다.'}
        </p>
        <div className="flex gap-3">
          <button 
            className="btn-primary flex-[1.2] p-3 font-extrabold" 
            onClick={() => closeConfirmPopup(true)}
          >
            {confirmYesLabel || '네, 취소하겠습니다'}
          </button>
          <button 
            className="btn-secondary flex-1 p-3 border-[#ddd] text-[var(--text-muted)]" 
            onClick={() => closeConfirmPopup(false)}
          >
            {confirmNoLabel || '아니오, 유지할게요'}
          </button>
        </div>
      </div>
    </div>
  );
};
