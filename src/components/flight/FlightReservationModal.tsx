import React from 'react';
import { createPortal } from 'react-dom';
import type { FlightDto, AvailableSeat } from '@/store/useFlightStore';
import { useFlightStore } from '@/store/useFlightStore';
import { useTravelStore } from '@/store/useTravelStore';

function format_time(isoString?: string) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function format_date(isoString?: string) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

interface FlightReservationModalProps {
  flight: FlightDto | null;
  seat: AvailableSeat | null;
  onClose: () => void;
  onConfirm: () => void; // 2단계 탑승객 정보 입력 모달로 가기 위한 콜백
}

export const FlightReservationModal: React.FC<FlightReservationModalProps> = ({
  flight,
  seat,
  onClose,
  onConfirm,
}) => {
  const { search_query } = useFlightStore();
  const { isLoggedIn, openAuthModal, addToast } = useTravelStore();
  const passengerCount = search_query.passengerCount;

  if (!flight || !seat) return null;

  const handleConfirmClick = () => {
    // 탑승객 정보 열심히 다 적고 결제할 때 튕기는 참사 방지를 위한 선제 로그인 가드
    if (!isLoggedIn) {
      addToast('로그인 후에 항공권을 예약하실 수 있습니다.', 'warning');
      onClose(); // 상세 요약창 닫기
      openAuthModal('login'); // 로그인 모달 강제 팝업
      return;
    }
    onConfirm(); // 로그인 완료된 유저만 2단계 탑승객 정보 기입으로 안내
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 15000,
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
          borderRadius: '30px',
          width: '520px',
          maxWidth: '95%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'zoomIn 0.22s ease',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 럭셔리 데코레이션 */}
        <div style={{ height: '6px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }} />

        {/* ── Header ── */}
        <div
          style={{
            padding: '1.5rem 1.8rem 1rem 1.8rem',
            borderBottom: '1px solid #f0f2f5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 900,
                color: '#1e293b',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i className="fa-solid fa-plane-departure" style={{ color: 'var(--primary)' }}></i>
              선택한 여정 요약 확인
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              fontSize: '1.2rem',
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* ── Scrollable Content ── */}
        <div style={{ padding: '1.5rem 1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* 보딩패스 스타일 레이아웃 */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>
                FLIGHT NO: <strong style={{ color: 'var(--primary)' }}>{flight.flightNumber}</strong>
              </span>
              <span
                style={{
                  background: 'rgba(0, 92, 230, 0.08)',
                  color: 'var(--primary)',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  padding: '3px 10px',
                  borderRadius: '999px',
                }}
              >
                {seat.classType}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.8rem 0',
                borderTop: '1px solid #e2e8f0',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <div>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', fontWeight: 700 }}>출발지</span>
                <strong style={{ fontSize: '1rem', color: '#1e293b', fontWeight: 800, display: 'block' }}>
                  {flight.departureAirport}
                </strong>
                {flight.departureTime && (
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '3px', fontWeight: 700 }}>
                    {format_date(flight.departureTime)} {format_time(flight.departureTime)}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '0 0.8rem' }}>
                <i className="fa-solid fa-arrow-right" style={{ color: '#94a3b8', fontSize: '0.8rem' }}></i>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', fontWeight: 700 }}>도착지</span>
                <strong style={{ fontSize: '1rem', color: '#1e293b', fontWeight: 800, display: 'block' }}>
                  {flight.arrivalAirport}
                </strong>
                {flight.arrivalTime && (
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '3px', fontWeight: 700 }}>
                    {format_date(flight.arrivalTime)} {format_time(flight.arrivalTime)}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>
              <span>예약 인원</span>
              <span style={{ color: '#1e293b' }}>성인 {passengerCount}명</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>
              <span>좌석 1인 기본 요금</span>
              <span style={{ color: '#1e293b' }}>₩{seat.basePrice.toLocaleString()}</span>
            </div>
          </div>

          {/* 최종 가격 표시 */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(255, 90, 95, 0.02) 0%, rgba(255, 90, 95, 0.08) 100%)',
              border: '1px solid rgba(255, 90, 95, 0.15)',
              borderRadius: '20px',
              padding: '1.2rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '0.7rem', color: '#ff5a5f', fontWeight: 800, display: 'block', marginBottom: '2px' }}>
                총 예상 금액
              </span>
              <strong style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ff5a5f', fontFamily: 'GmarketSansBold' }}>
                ₩{(seat.basePrice * passengerCount).toLocaleString()}
              </strong>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>
              공항 시설 요금 및 유류할증료 포함
            </span>
          </div>

          {/* 동의 안내 문구 */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: '#f8fafc', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <i className="fa-solid fa-circle-info" style={{ color: 'var(--primary)', marginTop: '2px', fontSize: '0.85rem' }}></i>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
              다음 단계에서 정부 출입국 보안 규정에 의거하여 모든 승객의 여권에 기재된 영문 성명, 여권번호, 생년월일 수집이 필요합니다.
            </p>
          </div>

          {/* ── Action Buttons ── */}
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              onClick={handleConfirmClick}
              style={{
                padding: '0.75rem 1.8rem',
                border: 'none',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 90, 95, 0.25)',
                transition: 'all 0.15s',
              }}
            >
              예약 및 정보 입력하기
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
