import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPaymentCheckout } from '@/utils/paymentCheckout';
import { useTravelStore } from '@/store/useTravelStore';

interface Passenger {
  name: string;
  passportNumber: string;
  birthdate: string;
}

interface FlightPassengerInputModalProps {
  flightInfo?: {
    flightNumber: string;
    departureAirport: string;
    departureTime?: string;
    arrivalAirport: string;
    arrivalTime?: string;
    classType: string;
    basePrice: number;
    passengerCount: number;
  };
  onClose: () => void;
}

export const FlightPassengerInputModal: React.FC<FlightPassengerInputModalProps> = ({
  flightInfo = {
    flightNumber: 'OD-702',
    departureAirport: 'ICN (서울/인천)',
    departureTime: '10:15',
    arrivalAirport: 'NRT (도쿄/나리타)',
    arrivalTime: '12:45',
    classType: 'Business Class',
    basePrice: 650000,
    passengerCount: 2,
  },
  onClose,
}) => {
  const navigate = useNavigate();
  const { addToast } = useTravelStore();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPassengers(
      Array.from({ length: flightInfo.passengerCount }, () => ({
        name: '',
        passportNumber: '',
        birthdate: '',
      }))
    );
  }, [flightInfo.passengerCount]);

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index] = {
      ...updated[index],
      [field]: field === 'name' ? value.toUpperCase() : value, // 영문 대문자 변환 자동화
    };
    setPassengers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 브라우저 required를 완전히 걷어내고 수동 100% 검증 & 이쁜 토스트 메시지 연동
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name || !p.name.trim()) {
        addToast(`탑승객 ${i + 1}의 영문 성명을 입력해 주세요.`, 'warning');
        return;
      }
      if (!p.passportNumber || !p.passportNumber.trim()) {
        addToast(`탑승객 ${i + 1}의 여권번호를 입력해 주세요.`, 'warning');
        return;
      }
      if (!p.birthdate) {
        addToast(`탑승객 ${i + 1}의 생년월일을 선택해 주세요.`, 'warning');
        return;
      }
    }

    setIsSubmitting(true);
    addToast('탑승객 정보를 확인하고 예약 조율을 마쳤습니다. 결제 단계로 진입합니다.', 'success');

    const totalAmount = flightInfo.basePrice * flightInfo.passengerCount;
    const checkoutState = buildPaymentCheckout({
      reservationType: 'FLIGHT',
      reservationId: Math.floor(100000 + Math.random() * 900000),
      productTitle: `${flightInfo.flightNumber} (${flightInfo.classType})`,
      productSubtitle: `${flightInfo.departureAirport} → ${flightInfo.arrivalAirport}`,
      categoryLabel: '항공권',
      categoryIcon: 'fa-plane',
      totalAmount,
      usedMileage: 0,
      dateSummary: `탑승객 ${flightInfo.passengerCount}명`,
      detailLines: [
        `₩${flightInfo.basePrice.toLocaleString()} × ${flightInfo.passengerCount}명`,
        ...passengers.map((p, idx) => `Passenger ${idx + 1}: ${p.name}`),
      ],
      returnPath: '/flight',
    });

    setTimeout(() => {
      onClose();
      navigate('/payment', { state: checkoutState });
    }, 850);
  };

  const totalAmount = flightInfo.basePrice * flightInfo.passengerCount;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 20000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: 'Pretendard, -apple-system, sans-serif',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '32px',
          width: '640px',
          maxWidth: '95%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          animation: 'modalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 럭셔리 라인 */}
        <div
          style={{
            height: '6px',
            background: 'linear-gradient(90deg, #005ce6 0%, #ff5a5f 100%)',
          }}
        />

        {/* ── Header ── */}
        <div
          style={{
            padding: '1.8rem 2rem 1.4rem 2rem',
            borderBottom: '1px solid #f0f2f5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 900,
                color: '#005ce6',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Secure Passenger Boarding Pass
            </span>
            <h3
              style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                color: '#1e293b',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i className="fa-solid fa-passport" style={{ color: '#005ce6' }}></i>
              탑승객 정보 예약 등록
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '6px 0 0 0', fontWeight: 500 }}>
              출입국 규정에 근거해 여권 정보와 완전히 동일하게 기재해 주세요.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              transition: 'all 0.2s',
            }}
            className="modal-close-btn"
          >
            <i className="fa-solid fa-xmark" style={{ fontSize: '1.1rem' }}></i>
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div
          style={{
            padding: '1.5rem 2rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
          className="passenger-modal-body"
        >
          {/* 보딩패스 여정 개요 요약 */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(0, 92, 230, 0.03) 0%, rgba(255, 90, 95, 0.03) 100%)',
              border: '1px dashed rgba(0, 92, 230, 0.2)',
              borderRadius: '20px',
              padding: '1.2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>
                FLIGHT NO:{' '}
                <strong style={{ color: '#005ce6', fontFamily: 'GmarketSansBold' }}>
                  {flightInfo.flightNumber}
                </strong>
              </span>
              <span
                style={{
                  background: '#005ce6',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                }}
              >
                {flightInfo.classType}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.6rem',
                borderTop: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.6rem', color: '#94a3b8', display: 'block', fontWeight: 700 }}>ORIGIN</span>
                <strong style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 800 }}>
                  {flightInfo.departureAirport}
                </strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '0 1rem' }}>
                <i className="fa-solid fa-plane" style={{ color: '#005ce6', fontSize: '0.9rem' }}></i>
                <div
                  style={{
                    height: '2px',
                    width: '100%',
                    background: 'linear-gradient(90deg, #005ce6 0%, #ff5a5f 100%)',
                    margin: '4px 0',
                    borderRadius: '99px',
                  }}
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.6rem', color: '#94a3b8', display: 'block', fontWeight: 700 }}>DESTINATION</span>
                <strong style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 800 }}>
                  {flightInfo.arrivalAirport}
                </strong>
              </div>
            </div>
          </div>

          {/* 승객 정보 입력 카드 리스트 */}
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            noValidate
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {passengers.map((passenger, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.2rem',
                    transition: 'all 0.25s ease',
                  }}
                  className="passenger-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        background: 'rgba(0, 92, 230, 0.08)',
                        color: '#005ce6',
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        padding: '4px 12px',
                        borderRadius: '999px',
                        letterSpacing: '0.5px',
                      }}
                    >
                      탑승객 {index + 1}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 750 }}>REQUIRED INFO</span>
                  </div>

                  {/* 영문 성명 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569' }}>
                      영문 성명 <span style={{ color: '#ff5a5f' }}>*</span>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500, marginLeft: '6px' }}>
                        (여권 영문 대문자 입력 예: HONG GILDONG)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={passenger.name}
                      onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                      placeholder="HONG GILDONG"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#1e293b',
                        background: '#ffffff',
                        outline: 'none',
                        transition: 'all 0.2s',
                      }}
                      className="passenger-input"
                    />
                  </div>

                  {/* 여권번호 및 생년월일 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569' }}>
                        여권번호 <span style={{ color: '#ff5a5f' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={passenger.passportNumber}
                        onChange={(e) => handlePassengerChange(index, 'passportNumber', e.target.value.toUpperCase())}
                        placeholder="M12345678"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          borderRadius: '12px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#1e293b',
                          background: '#ffffff',
                          outline: 'none',
                          transition: 'all 0.2s',
                        }}
                        className="passenger-input"
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569' }}>
                        생년월일 <span style={{ color: '#ff5a5f' }}>*</span>
                      </label>
                      <input
                        type="date"
                        value={passenger.birthdate}
                        onChange={(e) => handlePassengerChange(index, 'birthdate', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.7rem 1rem',
                          borderRadius: '12px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#1e293b',
                          background: '#ffffff',
                          outline: 'none',
                          transition: 'all 0.2s',
                        }}
                        className="passenger-input"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 하단 요약 및 과금 요금함 */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '1.2rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                  최종 결제 예정 금액 ({flightInfo.passengerCount}명)
                </span>
                <strong style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ff5a5f', fontFamily: 'GmarketSansBold' }}>
                  ₩{totalAmount.toLocaleString()}
                </strong>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'right', fontWeight: 600 }}>
                ₩{flightInfo.basePrice.toLocaleString()} × {flightInfo.passengerCount}명
                <br />
                <span style={{ color: '#005ce6', fontWeight: 800 }}>세금 및 공항세 포함</span>
              </div>
            </div>

            {/* ── CTA Action Buttons ── */}
            <div
              style={{
                display: 'flex',
                gap: '0.8rem',
                justifyContent: 'flex-end',
                marginTop: '0.5rem',
              }}
            >
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '0.8rem 2.2rem',
                  border: 'none',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, #ff5a5f 0%, #e0484d 100%)`,
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  cursor: isSubmitting ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(255,90,95,0.25)',
                  transition: 'all 0.2s',
                }}
                className="submit-btn-action"
              >
                {isSubmitting ? '요청 처리 중...' : '예약 및 결제하기'}
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.8rem 1.8rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                className="cancel-btn-action"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 스타일 오버라이드 및 마이크로 액션 모션 */}
      <style>{`
        @keyframes modalSlideUp {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .modal-close-btn:hover {
          background: #e2e8f0 !important;
          color: #0f172a !important;
        }
        .passenger-card:hover {
          border-color: #005ce6 !important;
          box-shadow: 0 8px 20px rgba(0, 92, 230, 0.04);
        }
        .passenger-input:focus {
          border-color: #005ce6 !important;
          box-shadow: 0 0 0 3px rgba(0, 92, 230, 0.1) !important;
          background: #ffffff !important;
        }
        .cancel-btn-action:hover {
          background: #f8fafc !important;
          color: #1e293b !important;
        }
        .submit-btn-action:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(255,90,95,0.35) !important;
        }
        .submit-btn-action:active {
          transform: translateY(1px);
        }
        .passenger-modal-body::-webkit-scrollbar {
          width: 6px;
        }
        .passenger-modal-body::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .passenger-modal-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 99px;
        }
        .passenger-modal-body::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};
