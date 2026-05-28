import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import type { MockFlightRoute } from '@/constants/mockFlightRoutes';
import {
  buildCalendarMonth,
  countNights,
  monthLabel,
  toDateStr,
} from '@/utils/calendarUtils';
import { useTravelStore } from '@/store/useTravelStore';

// ─── constants ───────────────────────────────────────────────
const PRIMARY = '#005ce6';
const SECONDARY = '#ff5a5f';

type SeatClass = 'ECONOMY' | 'BUSINESS' | 'FIRST';

const CLASS_INFO: Record<SeatClass, { multiplier: number; desc: string }> = {
  ECONOMY:  { multiplier: 1.0, desc: '일반석 · 표준 서비스' },
  BUSINESS: { multiplier: 2.5, desc: '비즈니스석 · 라운지 이용' },
  FIRST:    { multiplier: 4.0, desc: '퍼스트클래스 · 프리미엄 서비스' },
};

const BAGGAGE_FEE_PER_PERSON = 50000;

// Unavailable flight days (day-of-month)
const UNAVAILABLE_DAYS = new Set([6, 13, 20, 27]);

function durationLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

// ─── props ───────────────────────────────────────────────────
interface FlightDetailModalProps {
  route: MockFlightRoute;
  tripType?: 'RT' | 'OW'; // fixed from search; defaults to RT
  defaultDate?: string;    // YYYY-MM-DD departure
  defaultReturn?: string;  // YYYY-MM-DD return (for RT)
  onClose: () => void;
}

// ─── component ───────────────────────────────────────────────
export const FlightDetailModal: React.FC<FlightDetailModalProps> = ({
  route,
  tripType = 'RT',
  defaultDate,
  defaultReturn,
  onClose,
}) => {
  const { addToast } = useTravelStore();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const threeDaysLater = new Date(today.getTime() + 3 * 86400000);

  const initDepart = defaultDate ?? route.date ?? toDateStr(today);
  const initReturn = defaultReturn ?? toDateStr(threeDaysLater);

  const [departDate, setDepartDate] = useState<string>(initDepart);
  const [returnDate, setReturnDate] = useState<string>(tripType === 'RT' ? initReturn : '');
  const [selecting, setSelecting] = useState<'depart' | 'return' | null>(null);
  const [seatClass, setSeatClass] = useState<SeatClass>('ECONOMY');
  const [passengerCount, setPassengerCount] = useState(1);
  const [baggageEnabled, setBaggageEnabled] = useState(false);

  // Calendar month navigation
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const cells = useMemo(
    () => buildCalendarMonth(calYear, calMonth, route.priceFrom, {
      weekendSurchargeRate: 0.1,
      disabledDays: UNAVAILABLE_DAYS,
      disableBeforeToday: true,
    }),
    [calYear, calMonth, route.priceFrom]
  );

  // Range check for round trip
  function hasSoldOutInRange(start: string, end: string): boolean {
    const s = new Date(start);
    const e = new Date(end);
    const cur = new Date(s.getTime() + 86400000);
    while (cur < e) {
      if (UNAVAILABLE_DAYS.has(cur.getDate())) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  }

  function handleCellClick(dateStr: string, disabled: boolean) {
    if (disabled) return;

    if (tripType === 'OW') {
      setDepartDate(dateStr);
      return;
    }

    // Round trip — first click = depart, second = return
    if (selecting === null || selecting === 'depart') {
      setDepartDate(dateStr);
      setReturnDate('');
      setSelecting('return');
    } else {
      if (dateStr <= departDate) {
        setDepartDate(dateStr);
        setReturnDate('');
        setSelecting('return');
      } else {
        if (hasSoldOutInRange(departDate, dateStr)) {
          addToast(
            '⚠️ 예약 불가 기간 포함 — 선택하신 일정 사이에 이미 매진된 날짜가 포함되어 있습니다.',
            'warning'
          );
          setDepartDate(dateStr);
          setReturnDate('');
          setSelecting('return');
          return;
        }
        setReturnDate(dateStr);
        setSelecting(null);
      }
    }
  }

  // Billing
  const classInfo = CLASS_INFO[seatClass];
  const basePrice = Math.round((route.priceFrom * classInfo.multiplier) / 1000) * 1000;
  const tripMultiplier = tripType === 'RT' ? 2 : 1;
  const baggageFee = baggageEnabled ? BAGGAGE_FEE_PER_PERSON * passengerCount : 0;
  const finalTotal = basePrice * passengerCount * tripMultiplier + baggageFee;

  const tripDays = tripType === 'RT' && returnDate ? countNights(departDate, returnDate) : 0;

  function getCellStyle(cell: { dateStr: string; disabled: boolean; isEmpty: boolean }) {
    if (cell.isEmpty) return {};

    const isDepart = cell.dateStr === departDate;
    const isReturn = tripType === 'RT' && cell.dateStr === returnDate;
    const inRange = tripType === 'RT' && departDate && returnDate &&
      cell.dateStr > departDate && cell.dateStr < returnDate;

    if (isDepart || isReturn) {
      return {
        background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
        color: '#fff', borderRadius: '10px',
        boxShadow: `0 4px 10px rgba(0,92,230,0.22)`,
        border: '1.5px solid transparent',
      };
    }
    if (inRange) {
      return {
        background: 'rgba(0,92,230,0.08)',
        border: '1.5px solid rgba(0,92,230,0.15)',
        borderRadius: '4px', color: PRIMARY,
      };
    }
    if (cell.disabled) {
      return {
        opacity: 0.4, cursor: 'not-allowed',
        background: '#f7f9fa', borderRadius: '10px',
        border: '1.5px solid transparent',
      };
    }
    return {
      cursor: 'pointer', borderRadius: '10px',
      border: '1.5px solid transparent',
      transition: 'all 0.15s ease',
    };
  }

  function handleBook() {
    if (!departDate) {
      addToast('출발일을 선택해 주세요.', 'warning');
      return;
    }
    if (tripType === 'RT' && !returnDate) {
      addToast('왕복 여정의 귀국일을 선택해 주세요.', 'warning');
      return;
    }
    addToast(`✈️ ${route.flightNumber} 항공권 예약이 신청되었습니다! (API 연결 예정)`, 'success');
    onClose();
  }

  // Banner text
  const bannerText = tripType === 'RT'
    ? `${departDate} ➔ ${returnDate || '귀국일 선택'}`
    : departDate;

  const bannerBadge = tripType === 'RT'
    ? (tripDays > 0 ? `왕복 ${tripDays}박` : '왕복')
    : '편도';

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.52)',
        backdropFilter: 'blur(3px)',
        zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '580px', maxWidth: '95%',
          padding: '1.8rem',
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          animation: 'zoomIn 0.22s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '18px', right: '18px',
            background: 'none', border: 'none',
            fontSize: '1.2rem', color: '#717171', cursor: 'pointer',
            lineHeight: 1, padding: '4px',
          }}
        >
          <i className="fa-solid fa-xmark" />
        </button>

        {/* ── Fixed Header ── */}
        <div style={{
          display: 'flex', gap: '1.2rem', marginBottom: '0.8rem',
          alignItems: 'center', borderBottom: '1px solid #ddd',
          paddingBottom: '0.8rem', flexShrink: 0,
        }}>
          <div style={{
            width: '65px', height: '65px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, background: 'rgba(0,92,230,0.06)',
            fontSize: '1.8rem', color: PRIMARY,
          }}>
            <i className="fa-solid fa-plane" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.18rem', fontWeight: 800, marginBottom: '0.25rem', color: '#1a1a1a', letterSpacing: '-0.5px', lineHeight: 1.3 }}>
              {route.departureCity} → {route.arrivalCity}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#717171', flexWrap: 'wrap' }}>
              <span><i className="fa-solid fa-plane-departure" /> {route.airline}</span>
              <span>•</span>
              <span>{route.flightNumber}</span>
              <span>•</span>
              <span>{route.departureAirport} ➔ {route.arrivalAirport}</span>
              <span>•</span>
              <span>{durationLabel(route.durationMinutes)}</span>
            </div>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.4rem', marginBottom: '0.8rem' }}>

          {/* Date Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,92,230,0.04) 0%, rgba(255,90,95,0.04) 100%)',
            border: '1px solid rgba(0,92,230,0.1)',
            borderRadius: '12px',
            padding: '0.65rem 0.9rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '0.8rem',
          }}>
            <div>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: PRIMARY, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                선택한 항공 일정
              </span>
              <strong style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>
                {bannerText}
              </strong>
            </div>
            <span style={{
              background: PRIMARY, color: '#fff',
              fontSize: '0.72rem', fontWeight: 800,
              padding: '0.22rem 0.65rem', borderRadius: '999px',
            }}>
              {bannerBadge}
            </span>
          </div>

          {/* Class Selector */}
          <div style={{
            display: 'flex', gap: '0.5rem', marginBottom: '0.6rem',
            background: '#f0f2f5', padding: '0.4rem',
            borderRadius: '12px', border: '1px solid #ddd',
          }}>
            {(Object.keys(CLASS_INFO) as SeatClass[]).map((cls) => {
              const active = seatClass === cls;
              return (
                <button
                  key={cls}
                  onClick={() => setSeatClass(cls)}
                  style={{
                    flex: 1, padding: '0.52rem',
                    fontSize: '0.78rem', fontWeight: 700,
                    borderRadius: '8px', border: 'none', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: active ? '#fff' : 'transparent',
                    color: active ? PRIMARY : '#717171',
                    boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {cls}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: '0.72rem', color: '#717171', marginBottom: '0.8rem', paddingLeft: '0.4rem' }}>
            <i className="fa-solid fa-circle-info" style={{ color: PRIMARY, marginRight: '4px' }} />
            {classInfo.desc}
          </p>

          {/* Passenger Picker */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#f0f2f5', borderRadius: '12px',
            padding: '0.85rem 1rem', marginBottom: '0.8rem',
            border: '1px solid #ddd',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a1a' }}>탑승객 (Passengers)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setPassengerCount(c => Math.max(1, c - 1))}
                disabled={passengerCount <= 1}
                style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  border: passengerCount <= 1 ? '1.5px solid #ddd' : `1.5px solid ${PRIMARY}`,
                  color: passengerCount <= 1 ? '#ddd' : PRIMARY,
                  background: '#fff', cursor: passengerCount <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >−</button>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a1a', minWidth: '14px', textAlign: 'center' }}>{passengerCount}</span>
              <button
                onClick={() => setPassengerCount(c => Math.min(9, c + 1))}
                style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  border: `1.5px solid ${PRIMARY}`, color: PRIMARY,
                  background: '#fff', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >+</button>
            </div>
          </div>

          {/* Calendar */}
          <div style={{
            margin: '0.8rem 0', padding: '0.9rem 1rem',
            border: '1px solid #ddd',
            borderRadius: '12px',
            background: '#fff',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.015)',
          }}>
            {/* Cal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontWeight: 800, fontSize: '0.88rem', color: '#1a1a1a',
                borderLeft: `3px solid ${PRIMARY}`, paddingLeft: '0.45rem',
              }}>
                <span>📅</span>
                <span>{monthLabel(calYear, calMonth)}</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 500, color: '#717171' }}>
                  {tripType === 'RT' ? '출발일/귀국일 순 클릭' : '출발일 선택'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button
                  onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                  style={{ background: 'none', border: '1px solid #ddd', borderRadius: '6px', width: '26px', height: '26px', cursor: 'pointer', fontSize: '0.75rem', color: '#717171' }}
                >‹</button>
                <button
                  onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                  style={{ background: 'none', border: '1px solid #ddd', borderRadius: '6px', width: '26px', height: '26px', cursor: 'pointer', fontSize: '0.75rem', color: '#717171' }}
                >›</button>
              </div>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '4px' }}>
              {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                <div key={d} style={{ fontSize: '0.7rem', fontWeight: 700, color: i === 0 ? SECONDARY : i === 6 ? PRIMARY : '#717171', padding: '3px 0' }}>{d}</div>
              ))}
            </div>

            {/* Cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
              {cells.map((cell, idx) => {
                if (cell.isEmpty) return <div key={idx} />;
                const isSelected = cell.dateStr === departDate || (tripType === 'RT' && cell.dateStr === returnDate);
                const style = getCellStyle(cell);
                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => handleCellClick(cell.dateStr, cell.disabled)}
                    style={{
                      aspectRatio: '1.05',
                      display: 'flex', flexDirection: 'column',
                      justifyContent: 'center', alignItems: 'center',
                      padding: '3px 0',
                      ...style,
                    }}
                  >
                    <span style={{
                      fontSize: '0.8rem', fontWeight: 700,
                      color: isSelected ? '#fff' : cell.disabled ? '#aaa' : '#1a1a1a',
                      textDecoration: cell.disabled ? 'line-through' : 'none',
                    }}>
                      {cell.day}
                    </span>
                    {!cell.disabled && (
                      <span style={{ fontSize: '0.52rem', fontWeight: 700, color: isSelected ? 'rgba(255,255,255,0.85)' : '#717171', marginTop: '1px' }}>
                        {(cell.price / 10000).toFixed(0)}만↑
                      </span>
                    )}
                    {cell.disabled && (
                      <span style={{ fontSize: '0.48rem', fontWeight: 800, color: SECONDARY, marginTop: '1px' }}>매진</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Baggage Toggle */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.7rem 0.9rem',
            background: 'rgba(0,92,230,0.03)',
            border: '1px solid rgba(0,92,230,0.12)',
            borderRadius: '12px',
            marginBottom: '0.4rem',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: PRIMARY, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <i className="fa-solid fa-suitcase-rolling" /> 위탁 수하물 추가
              </span>
              <span style={{ fontSize: '0.7rem', color: '#717171' }}>
                인당 15kg 수하물 (<strong>+₩{BAGGAGE_FEE_PER_PERSON.toLocaleString('ko-KR')}</strong>)
              </span>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px', flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={baggageEnabled}
                onChange={(e) => setBaggageEnabled(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute', cursor: 'pointer',
                top: 0, left: 0, right: 0, bottom: 0,
                borderRadius: '20px',
                background: baggageEnabled ? `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` : '#ccc',
                transition: '0.3s',
              }}>
                <span style={{
                  position: 'absolute', height: '14px', width: '14px',
                  left: '3px', bottom: '3px',
                  background: '#fff', borderRadius: '50%',
                  transition: '0.3s',
                  transform: baggageEnabled ? 'translateX(20px)' : 'translateX(0)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }} />
              </span>
            </label>
          </div>

        </div>

        {/* ── Fixed Footer ── */}
        <div style={{ flexShrink: 0, borderTop: '1px solid #ddd', paddingTop: '0.8rem' }}>
          {/* Billing Box */}
          <div style={{
            background: '#f0f2f5', borderRadius: '12px',
            padding: '0.9rem 1.1rem', marginBottom: '0.8rem',
            border: '1px solid #ddd',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4a4a4a', marginBottom: '0.35rem' }}>
              <span>
                항공권 운임 ({passengerCount}명 · {seatClass}{tripType === 'RT' ? ' · 왕복' : ' · 편도'})
              </span>
              <span style={{ fontWeight: 700, color: '#1a1a1a' }}>
                ₩{(basePrice * passengerCount * tripMultiplier).toLocaleString('ko-KR')}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#717171', marginBottom: '0.35rem', paddingLeft: '0.4rem' }}>
              ₩{basePrice.toLocaleString('ko-KR')} × {passengerCount}명{tripType === 'RT' ? ' × 왕복 2편' : ''}
            </div>
            {baggageEnabled && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: PRIMARY, marginBottom: '0.35rem', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '0.35rem' }}>
                <span>수하물 추가 요금</span>
                <span>+ ₩{baggageFee.toLocaleString('ko-KR')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.55rem', fontWeight: 800, fontSize: '1.05rem', color: '#1a1a1a' }}>
              <span>최종 결제 합계</span>
              <span style={{ color: SECONDARY, fontSize: '1.22rem', fontFamily: 'GmarketSansBold, Pretendard, sans-serif' }}>
                ₩{finalTotal.toLocaleString('ko-KR')}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleBook}
            style={{
              width: '100%', padding: '0.75rem',
              background: `linear-gradient(135deg, ${SECONDARY} 0%, #e0484d 100%)`,
              color: '#fff', border: 'none', borderRadius: '12px',
              fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255,90,95,0.28)',
              letterSpacing: '-0.2px',
            }}
          >
            항공권 예약하기
          </button>
        </div>
      </div>

      <style>{`
        @keyframes zoomIn {
          from { transform: scale(0.94); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
};
