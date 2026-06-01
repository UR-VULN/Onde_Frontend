import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { prepare_payment_api, validate_payment_api } from '@/api/paymentApi';
import { confirm_flight_payment_api } from '@/api/flightApi';
import { PAYMENT_PRODUCT_NAME, PORTONE_PG } from '@/constants/paymentConfig';
import { MileageUsagePanel } from '@/components/common/MileageUsagePanel';
import { useTravelStore } from '@/store/useTravelStore';
import type { PaymentCheckoutState } from '@/types/payment';
import { calcPgAmount } from '@/utils/paymentCheckout';
import { requestPortOnePay } from '@/utils/portOne';

type PaymentStep = 'checkout' | 'processing' | 'success';

function getDisplayName(username: string): string {
  if (!username) return 'ONDE 회원';
  if (username.includes('@')) return username.split('@')[0] || username;
  return username;
}

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
  const { username, mileage: userMileage, addToast } = useTravelStore();

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

  const buyerName = getDisplayName(username);
  const buyerEmail = username.includes('@') ? username : `${username}@example.com`;

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

      const portOneRes = await requestPortOnePay({
        pg: PORTONE_PG,
        pay_method: 'card',
        merchant_uid: merchantUid,
        name: PAYMENT_PRODUCT_NAME,
        amount: serverPgAmount,
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        m_redirect_url: `${window.location.origin}/payment/callback`,
      });

      if (!portOneRes.success || !portOneRes.imp_uid || !portOneRes.merchant_uid) {
        throw new Error(portOneRes.error_msg || '결제가 취소되었거나 실패했습니다.');
      }

      const validateRes = await validate_payment_api({
        impUid: portOneRes.imp_uid,
        merchantUid: portOneRes.merchant_uid,
        pgAmount: portOneRes.paid_amount ?? serverPgAmount,
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
          포트원(PortOne) PG를 통해 결제 금액이 검증된 뒤 최종 승인됩니다.
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

            {checkout.productImageUrl && (
              <div className="payment-order-image-wrap">
                <img src={checkout.productImageUrl} alt={checkout.productTitle} className="payment-order-image" />
              </div>
            )}

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
                <i className="fa-solid fa-shield-halved"></i>
                <span>카드/간편결제는 포트원 결제창에서 안전하게 진행됩니다.</span>
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
