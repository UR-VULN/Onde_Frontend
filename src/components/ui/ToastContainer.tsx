import React from 'react';
import { useTravelStore } from '@/store/useTravelStore';

export const ToastContainer: React.FC = () => {
  const { toastStack, removeToast } = useTravelStore();

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success': return <i className="fa-solid fa-circle-check"></i>;
      case 'warning': return <i className="fa-solid fa-triangle-exclamation"></i>;
      case 'info': return <i className="fa-solid fa-circle-info"></i>;
      default: return <i className="fa-solid fa-bell"></i>;
    }
  };

  return (
    <div className="toast-container" id="toast-stack-container">
      {toastStack.map((toast) => (
        <div 
          key={toast.id}
          className="premium-toast flex items-center min-h-[64px] px-[1.2rem] py-[0.8rem]"
        >
          {/* Left Premium Icon Wrapper */}
          <div className="toast-icon-wrapper" style={{ 
            color: toast.type === 'success' ? '#10b981' : toast.type === 'warning' ? '#f59e0b' : '#005ce6' 
          }}>
            {getToastIcon(toast.type)}
          </div>

          {/* Main Content Area - Single bold line layout */}
          <div className="toast-content flex items-center ml-4">
            <h4 className="toast-title m-0 font-extrabold text-[0.9rem] text-[var(--text-dark)]">
              {toast.message}
            </h4>
          </div>

          {/* Dismiss Button */}
          <button 
            className="toast-close-btn"
            onClick={() => removeToast(toast.id)}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          {/* Animated Progress Bar */}
          <div className="toast-progress-bar"></div>
        </div>
      ))}
    </div>
  );
};
