import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravelStore } from '@/store/useTravelStore';

/** 모바일 결제 리다이렉트 콜백 — PC 결제는 PaymentPage 인라인 처리 사용 */
export const PaymentCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useTravelStore();

  useEffect(() => {
    addToast('결제 결과를 확인 중입니다. 잠시만 기다려 주세요.', 'info');
    navigate('/mypage', { replace: true });
  }, [navigate, addToast]);

  return (
    <div className="payment-page page-hero-gap">
      <div className="payment-shell payment-success-panel">
        <div className="payment-success-icon">
          <i className="fa-solid fa-spinner fa-spin"></i>
        </div>
        <h2 className="payment-success-title">결제 결과 확인 중</h2>
        <p className="payment-success-desc">잠시 후 마이페이지로 이동합니다.</p>
      </div>
    </div>
  );
};
