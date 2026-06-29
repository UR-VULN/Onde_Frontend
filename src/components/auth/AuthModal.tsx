import React, { useEffect } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export const AuthModal: React.FC = () => {
  const { 
    authModalTab, 
    closeAuthModal, 
  } = useTravelStore();

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeAuthModal]);

  return (
    <div 
      className="modal-backdrop flex" 
    >
      <div 
        className="app-modal animate-[zoomIn_0.25s_ease] w-[450px] relative" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={closeAuthModal} 
          className="absolute top-[20px] right-[20px] text-[1.2rem] bg-none border-none cursor-pointer z-50 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* 1. LOGIN VIEW */}
        {authModalTab === 'login' && <LoginForm />}

        {/* 2. SIGNUP VIEW */}
        {authModalTab === 'signup' && <SignupForm />}
      </div>
    </div>
  );
};
