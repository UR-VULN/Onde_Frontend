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
        className="premium-popup-modal"
        style={{ width: '420px', textAlign: 'center', padding: '2.5rem 2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(0, 92, 230, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)', fontSize: '2.2rem', border: '1.5px solid rgba(0, 92, 230, 0.15)' }}>
          <i className="fa-regular fa-circle-question"></i>
        </div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.8rem', letterSpacing: '-0.5px' }}>
          {confirmTitle || '해당 예약을 취소하시겠습니까?'}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
          {confirmDescription || '취소 시 규정에 따라 위약금이 발생할 수 있으며,\n한 번 취소된 내역은 복구가 불가능합니다.'}
        </p>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button 
            className="btn-primary" 
            style={{ flex: 1.2, padding: '0.75rem', fontWeight: 800 }}
            onClick={() => closeConfirmPopup(true)}
          >
            {confirmYesLabel || '네, 취소하겠습니다'}
          </button>
          <button 
            className="btn-secondary" 
            style={{ flex: 1, padding: '0.75rem', borderColor: '#ddd', color: 'var(--text-muted)' }}
            onClick={() => closeConfirmPopup(false)}
          >
            {confirmNoLabel || '아니오, 유지할게요'}
          </button>
        </div>
      </div>
    </div>
  );
};
