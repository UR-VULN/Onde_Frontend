import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import type { MockCar } from '@/constants/mockCars';
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
const INSURANCE_RATE_PER_DAY = 30000;

// Some random unavailable days
const UNAVAILABLE_DAYS = new Set([5, 12, 18, 25]);

// ─── props ───────────────────────────────────────────────────
interface CarDetailModalProps {
  car: MockCar;
  defaultPickup?: string;  // YYYY-MM-DD
  defaultReturn?: string;  // YYYY-MM-DD
  onClose: () => void;
}

// ─── component ───────────────────────────────────────────────
export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  car,
  defaultPickup,
  defaultReturn,
  onClose,
}) => {
  const { addToast } = useTravelStore();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86400000);

  const initPickup = defaultPickup ?? toDateStr(today);
  const initReturn = defaultReturn ?? toDateStr(tomorrow);

  const [pickupDate, setPickupDate] = useState<string>(initPickup);
  const [returnDate, setReturnDate] = useState<string>(initReturn);
  const [selecting, setSelecting] = useState<'pickup' | 'return' | null>(null);
  const [insuranceEnabled, setInsuranceEnabled] = useState(false);

  // Calendar month navigation
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const cells = useMemo(
    () => buildCalendarMonth(calYear, calMonth, car.pricePerDay, {
      weekendSurchargeRate: 0.15,
      disabledDays: UNAVAILABLE_DAYS,
      disableBeforeToday: true,
    }),
    [calYear, calMonth, car.pricePerDay]
  );

  // Days rented
  const rentalDays = countNights(pickupDate, returnDate);
  const rawTotal = rentalDays * car.pricePerDay;
  const insuranceFee = insuranceEnabled ? INSURANCE_RATE_PER_DAY * rentalDays : 0;
  const finalTotal = rawTotal + insuranceFee;

  function getCellStyle(cell: { dateStr: string; disabled: boolean; isEmpty: boolean; isWeekend: boolean }) {
    if (cell.isEmpty) return {};
    const isStart = cell.dateStr === pickupDate;
    const isEnd = cell.dateStr === returnDate;
    const inRange = pickupDate && returnDate && cell.dateStr > pickupDate && cell.dateStr < returnDate;

    if (isStart || isEnd) {
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

  // Check if any sold-out day-of-month falls strictly between start and end
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
    if (selecting === null || selecting === 'pickup') {
      setPickupDate(dateStr);
      setReturnDate('');
      setSelecting('return');
    } else {
      if (dateStr <= pickupDate) {
        setPickupDate(dateStr);
        setReturnDate('');
        setSelecting('return');
      } else {
        if (hasSoldOutInRange(pickupDate, dateStr)) {
          addToast(
            '⚠️ 예약 불가 기간 포함 — 선택하신 일정 사이에 이미 예약 마감된 날짜가 포함되어 있습니다.',
            'warning'
          );
          setPickupDate(dateStr);
          setReturnDate('');
          setSelecting('return');
          return;
        }
        setReturnDate(dateStr);
        setSelecting(null);
      }
    }
  }

  function handleBook() {
    if (rentalDays === 0) {
      addToast('대여/반납 일정을 선택해 주세요.', 'warning');
      return;
    }
    addToast(`🚗 ${car.name} 차량 예약 대기가 신청되었습니다! (API 연결 예정)`, 'success');
    onClose();
  }

  const bannerPickup = pickupDate || toDateStr(today);
  const bannerReturn = returnDate || toDateStr(tomorrow);
  const bannerDays = countNights(bannerPickup, bannerReturn);

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
            overflow: 'hidden', flexShrink: 0, background: '#f0f2f5',
          }}>
            <img
              src={car.imageUrl}
              alt={car.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <h3 style={{ fontSize: '1.18rem', fontWeight: 800, marginBottom: '0.2rem', color: '#1a1a1a', letterSpacing: '-0.5px', lineHeight: 1.3 }}>
              {car.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.78rem', color: '#717171', flexWrap: 'wrap' }}>
              <span><i className="fa-solid fa-car" /> {car.typeLabel}</span>
              <span>•</span>
              <span><i className="fa-solid fa-users" /> {car.seats}인승</span>
              <span>•</span>
              <span><i className="fa-solid fa-gas-pump" /> {car.fuel}</span>
              <span>•</span>
              <span style={{ color: SECONDARY, fontWeight: 700 }}>₩{car.pricePerDay.toLocaleString('ko-KR')} / per Day</span>
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
                대여 일정
              </span>
              <strong style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>
                {bannerPickup} ➔ {bannerReturn || '—'}
              </strong>
            </div>
            <span style={{
              background: PRIMARY, color: '#fff',
              fontSize: '0.72rem', fontWeight: 800,
              padding: '0.22rem 0.65rem', borderRadius: '999px',
            }}>
              {bannerDays}일 대여
            </span>
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
                <span style={{ fontSize: '0.68rem', fontWeight: 500, color: '#717171' }}>대여/반납일 순 클릭</span>
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
                const isSelected = cell.dateStr === pickupDate || cell.dateStr === returnDate;
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
                        {(cell.price / 1000).toFixed(0)}만
                      </span>
                    )}
                    {cell.disabled && (
                      <span style={{ fontSize: '0.48rem', fontWeight: 800, color: SECONDARY, marginTop: '1px' }}>예약마감</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insurance Toggle */}
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
                <i className="fa-solid fa-shield-heart" /> 완전 자차 보험 추가
              </span>
              <span style={{ fontSize: '0.7rem', color: '#717171' }}>
                대여 기간 내 사고 면책 (<strong>+₩{INSURANCE_RATE_PER_DAY.toLocaleString('ko-KR')}/일</strong>)
              </span>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px', flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={insuranceEnabled}
                onChange={(e) => setInsuranceEnabled(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute', cursor: 'pointer',
                top: 0, left: 0, right: 0, bottom: 0,
                borderRadius: '20px',
                background: insuranceEnabled ? `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` : '#ccc',
                transition: '0.3s',
              }}>
                <span style={{
                  position: 'absolute', height: '14px', width: '14px',
                  left: '3px', bottom: '3px',
                  background: '#fff', borderRadius: '50%',
                  transition: '0.3s',
                  transform: insuranceEnabled ? 'translateX(20px)' : 'translateX(0)',
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
              <span>차량 대여료 ({rentalDays}일)</span>
              <span style={{ fontWeight: 700, color: '#1a1a1a' }}>₩{rawTotal.toLocaleString('ko-KR')}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#717171', marginBottom: '0.35rem', paddingLeft: '0.4rem' }}>
              ₩{car.pricePerDay.toLocaleString('ko-KR')} × {rentalDays}일
            </div>
            {insuranceEnabled && rentalDays > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: PRIMARY, marginBottom: '0.35rem', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '0.35rem' }}>
                <span>완전 자차 보험</span>
                <span>+ ₩{insuranceFee.toLocaleString('ko-KR')}</span>
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
            차량 예약 대기 신청
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
