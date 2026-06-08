import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { prepare_payment_api, validate_payment_api } from '@/api/paymentApi';
import { confirm_flight_payment_api } from '@/api/flightApi';
import { MileageUsagePanel } from '@/components/common/MileageUsagePanel';
import { useTravelStore } from '@/store/useTravelStore';
import type { PaymentCheckoutState } from '@/types/payment';
import { calcPgAmount } from '@/utils/paymentCheckout';

type PaymentStep = 'checkout' | 'processing' | 'success';



function resolvePaymentErrorMessage(err: unknown): string {
  const apiMsg = (err as { error?: { message?: string }; message?: string })?.error?.message;
  const directMsg = (err as Error)?.message;
  return apiMsg || directMsg || '결제 처리 중 오류가 발생했습니다.';
}

function resolvePaymentToastType(message: string): 'warning' | 'info' {
  const lowered = message.toLowerCase();
  if (
    lowered.includes('취소') ||
    lowered.includes('cancel') ||
    lowered.includes('closed') ||
    lowered.includes('닫')
  ) {
    return 'info';
  }
  return 'warning';
}

export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mileage: userMileage, walletBalance, addToast } = useTravelStore();

  const checkout = location.state as PaymentCheckoutState | null;

  const [step, setStep] = useState<PaymentStep>('checkout');
  const [usedMileage, setUsedMileage] = useState(checkout?.usedMileage ?? 0);
  const [validatedPaymentId, setValidatedPaymentId] = useState<number | null>(null);

  const totalAmount = checkout?.totalAmount ?? 0;
  const pgAmount = useMemo(
    () => calcPgAmount(totalAmount, usedMileage),
    [totalAmount, usedMileage]
  );

  useEffect(() => {
    if (!checkout) {
      addToast('결제할 주문 정보가 없습니다.', 'warning');
      navigate('/', { replace: true });
    }
  }, [checkout, navigate, addToast]);

  useEffect(() => {
    if (checkout) {
      setUsedMileage(checkout.usedMileage);
    }
  }, [checkout]);

  if (!checkout) {
    return null;
  }

  const order = checkout;

  async function handlePay() {
    setStep('processing');

    try {
      const prepareRes = await prepare_payment_api({
        reservationId: order.reservationId,
        reservationType: order.reservationType,
        usedMileage,
        totalAmount,
      });

      if (!prepareRes.success || !prepareRes.data) {
        throw new Error(prepareRes.message || '결제 사전 검증에 실패했습니다.');
      }

      const { merchantUid, pgAmount: serverPgAmount } = prepareRes.data;

      // ONDE Wallet 결제 처리 (내부 지갑 결제)
      if (walletBalance < serverPgAmount) {
        throw new Error('지갑 잔액이 부족합니다. 마이페이지에서 가상 화폐를 충전해주세요.');
      }

      const mockImpUid = `wallet_tx_${Date.now()}`;
      const portOneRes = {
        success: true,
        imp_uid: mockImpUid,
        merchant_uid: merchantUid,
        paid_amount: serverPgAmount,
      };

      const validateRes = await validate_payment_api({
        impUid: portOneRes.imp_uid,
        merchantUid: portOneRes.merchant_uid,
        pgAmount: portOneRes.paid_amount,
      });

      if (!validateRes.success || !validateRes.data) {
        throw new Error(validateRes.message || '결제 사후 검증에 실패했습니다.');
      }

      if (order.reservationType === 'FLIGHT' && order.flightBookingCode) {
        await confirm_flight_payment_api(
          order.flightBookingCode,
          portOneRes.imp_uid,
          portOneRes.paid_amount ?? serverPgAmount
        );
      }

      setValidatedPaymentId(validateRes.data.paymentId);
      setStep('success');
      addToast('결제가 정상적으로 완료되었습니다!', 'success');
    } catch (err: unknown) {
      const msg = resolvePaymentErrorMessage(err);
      addToast(msg, resolvePaymentToastType(msg));
      setStep('checkout');
    }
  }

  return (
    <div className="payment-page page-hero-gap">
      <div className="payment-page-header">
        <h1 className="payment-page-title">
          <i className="fa-solid fa-credit-card" style={{ color: 'var(--primary)' }}></i>
          ONDE 안전 결제
        </h1>
        <p className="payment-page-desc">
          ONDE 지갑(가상 계좌) 잔액으로 빠르고 안전하게 결제됩니다.
        </p>
      </div>

      <div className="payment-steps" aria-label="결제 진행 단계">
        <div
          className={`payment-step${step === 'checkout' ? ' is-active' : ''}${
            step === 'processing' || step === 'success' ? ' is-done' : ''
          }`}
        >
          <span className="payment-step-num">1</span>
          <span>주문 확인</span>
        </div>
        <div
          className={`payment-step${step === 'processing' ? ' is-active' : ''}${
            step === 'success' ? ' is-done' : ''
          }`}
        >
          <span className="payment-step-num">2</span>
          <span>결제 진행</span>
        </div>
        <div className={`payment-step${step === 'success' ? ' is-active is-done' : ''}`}>
          <span className="payment-step-num">3</span>
          <span>완료</span>
        </div>
      </div>

      {step === 'success' ? (
        <div className="payment-shell payment-success-panel">
          <div className="payment-success-icon">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <h2 className="payment-success-title">결제가 완료되었습니다</h2>
          <p className="payment-success-desc">
            {checkout.productTitle} 예약 결제가 정상 승인되었습니다.
            {validatedPaymentId != null && (
              <>
                <br />
                결제 번호: <strong>#{validatedPaymentId}</strong>
              </>
            )}
          </p>
          <div className="payment-success-actions">
            <Link to="/mypage" className="btn-primary payment-success-btn">
              마이페이지에서 확인
            </Link>
            <Link to={checkout.returnPath} className="btn-secondary payment-success-btn">
              이전 화면으로
            </Link>
          </div>
        </div>
      ) : (
        <div className="payment-layout">
          <section className="payment-shell payment-order-card">
            <div className="payment-order-head">
              <span className={`payment-category-badge payment-category-badge--${checkout.reservationType.toLowerCase()}`}>
                <i className={`fa-solid ${checkout.categoryIcon}`}></i>
                {checkout.categoryLabel}
              </span>
              <h2 className="payment-order-title">{checkout.productTitle}</h2>
              <p className="payment-order-sub">{checkout.productSubtitle}</p>
            </div>

            {checkout.productImageUrl ? (
              <div className="payment-order-image-wrap">
                <img src={checkout.productImageUrl} alt={checkout.productTitle} className="payment-order-image" />
              </div>
            ) : checkout.reservationType === 'INSURANCE' ? (
              <div 
                style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  color: 'white',
                  aspectRatio: '16 / 7',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
                }}
              >
                {/* Decorative glowing gradient */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-30%',
                  width: '180px',
                  height: '180px',
                  background: 'radial-gradient(circle, rgba(0, 92, 230, 0.3) 0%, rgba(0,0,0,0) 70%)',
                  filter: 'blur(20px)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-50%',
                  left: '-30%',
                  width: '180px',
                  height: '180px',
                  background: 'radial-gradient(circle, rgba(255, 90, 95, 0.2) 0%, rgba(0,0,0,0) 70%)',
                  filter: 'blur(20px)',
                  pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                  <div>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      color: 'rgba(255,255,255,0.6)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      Traveler Insurance Certificate
                    </span>
                    <strong style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'GmarketSansBold, sans-serif' }}>
                      ONDE 안심 안심케어
                    </strong>
                  </div>
                  <i className="fa-solid fa-shield-halved" style={{ fontSize: '2rem', color: '#2ecc71', opacity: 0.9 }} />
                </div>

                <div style={{ zIndex: 1 }}>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>
                    <div>
                      <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', display: 'block' }}>COVERAGE LEVEL</span>
                      <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{checkout.productTitle.split('(')[1]?.replace(')', '') || 'STANDARD'} Plan</strong>
                    </div>
                    <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '1rem' }}>
                      <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', display: 'block' }}>PERIOD OF INSURANCE</span>
                      <strong style={{ color: '#fff', fontSize: '0.82rem' }}>{checkout.dateSummary}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="payment-order-meta">
              <div className="payment-order-meta-row">
                <span className="payment-order-meta-label">
                  <i className="fa-regular fa-calendar-check"></i> 일정
                </span>
                <strong>{checkout.dateSummary}</strong>
              </div>
              {checkout.detailLines?.map((line) => (
                <div key={line} className="payment-order-meta-row payment-order-meta-row--muted">
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </section>

          <aside className="payment-shell payment-summary-card">
            <h3 className="payment-summary-title">
              <i className="fa-solid fa-receipt"></i> 결제 정보
            </h3>

            <div className="payment-summary-rows">
              <div className="payment-summary-row">
                <span>주문 금액</span>
                <strong>₩{totalAmount.toLocaleString('ko-KR')}</strong>
              </div>
            </div>

            <MileageUsagePanel
              availableBalance={userMileage}
              orderTotal={totalAmount}
              value={usedMileage}
              onChange={setUsedMileage}
            />

            <div className="payment-summary-rows payment-summary-rows--total">
              <div className="payment-summary-row">
                <span>마일리지 차감</span>
                <strong className="payment-summary-discount">
                  − ₩{usedMileage.toLocaleString('ko-KR')}
                </strong>
              </div>
              <div className="payment-summary-row payment-summary-row--final">
                <span>결제 금액</span>
                <strong className="payment-summary-final">₩{pgAmount.toLocaleString('ko-KR')}</strong>
              </div>
            </div>

            <div className="payment-summary-foot">
              <div className="payment-pg-notice">
                <i className="fa-solid fa-wallet"></i>
                <span>결제는 회원님의 ONDE 가상 지갑에서 차감됩니다. (현재 잔액: ₩{walletBalance.toLocaleString('ko-KR')})</span>
              </div>

              <button
                type="button"
                className="btn-primary payment-submit-btn"
                disabled={step === 'processing'}
                onClick={handlePay}
              >
                {step === 'processing' ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> 결제 처리 중...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-lock"></i> ₩{pgAmount.toLocaleString('ko-KR')} 결제하기
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn-secondary payment-cancel-btn"
                disabled={step === 'processing'}
                onClick={() => navigate(checkout.returnPath)}
              >
                결제 취소
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
