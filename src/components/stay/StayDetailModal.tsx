import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import type { StayDto } from '@/api/stayApi';
import { book_stay_api } from '@/api/stayApi';
import { buildPaymentCheckout } from '@/utils/paymentCheckout';
import {
  buildCalendarMonth,
  countNights,
  monthLabel,
  todayStr,
  addDaysStr,
  isStayRangeAvailable,
  resolveValidStayRange,
} from '@/utils/calendarUtils';
import { useTravelStore } from '@/store/useTravelStore';
import { MileageUsagePanel, clampMileageUsage } from '@/components/common/MileageUsagePanel';

// ─── constants ───────────────────────────────────────────────
const PRIMARY = '#005ce6';
const SECONDARY = '#ff5a5f';

// ─── props ───────────────────────────────────────────────────
interface StayDetailModalProps {
  stay: StayDto;
  roomId: number;
  soldOutDays?: number[];
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  onClose: () => void;
}

// ─── component ───────────────────────────────────────────────
export const StayDetailModal: React.FC<StayDetailModalProps> = ({
  stay,
  roomId,
  soldOutDays = [],
  defaultCheckIn,
  defaultCheckOut,
  onClose,
}) => {
  const navigate = useNavigate();
  const { addToast, isLoggedIn, openAuthModal, mileage: userMileage } = useTravelStore();

  // stay.soldOutDays를 Set으로 변환 (백엔드 연동 시 API 응답값으로 대체)
  const [booking, setBooking] = useState(false);
  const soldOutDaysSet = useMemo(() => new Set(soldOutDays), [soldOutDays]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const preferredCheckIn = defaultCheckIn ?? todayStr();
  const preferredCheckOut = defaultCheckOut ?? addDaysStr(preferredCheckIn, 1);
  const { checkIn: initCheckIn, checkOut: initCheckOut } = resolveValidStayRange(
    preferredCheckIn,
    preferredCheckOut,
    soldOutDays,
  );

  const [checkIn, setCheckIn] = useState<string>(initCheckIn);
  const [checkOut, setCheckOut] = useState<string>(initCheckOut);
  const [selecting, setSelecting] = useState<'in' | 'out' | null>(null);
  const [adultCount, setAdultCount] = useState(2);
  const [mileageUsed, setMileageUsed] = useState(0);

  // Calendar month navigation
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const cells = useMemo(
    () => buildCalendarMonth(calYear, calMonth, stay.pricePerNight, {
      weekendSurchargeRate: 0.2,
      disabledDays: soldOutDaysSet,
      disableBeforeToday: true,
    }),
    [calYear, calMonth, stay.pricePerNight]
  );

  // Billing
  const nights = countNights(checkIn, checkOut);
  const rawTotal = nights * stay.pricePerNight;
  const mileageDiscount = mileageUsed;
  const finalTotal = Math.max(0, rawTotal - mileageDiscount);

  useEffect(() => {
    setMileageUsed((prev) =>
      clampMileageUsage(prev, userMileage, rawTotal),
    );
  }, [userMileage, rawTotal]);

  // Week day breakdown for billing description
  const weekdayCount = useMemo(() => {
    let wd = 0;
    const s = new Date(checkIn);
    const e = new Date(checkOut);
    const cur = new Date(s);
    while (cur < e) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) wd++;
      cur.setDate(cur.getDate() + 1);
    }
    return wd;
  }, [checkIn, checkOut]);
  const weekendCount = nights - weekdayCount;

  const weekdayPrice = stay.pricePerNight;
  const weekendPrice = Math.round((stay.pricePerNight * 1.2) / 1000) * 1000;

  function buildBillingDesc(): string {
    if (nights === 0) return '일정을 선택해 주세요';
    const parts: string[] = [];
    if (weekdayCount > 0) parts.push(`평일 ${weekdayCount}박 × ₩${weekdayPrice.toLocaleString()}`);
    if (weekendCount > 0) parts.push(`주말 ${weekendCount}박 × ₩${weekendPrice.toLocaleString()}`);
    return parts.join(' + ') || '-';
  }

  // Check if any sold-out day falls within the occupied stay nights
  function hasSoldOutInRange(start: string, end: string): boolean {
    return !isStayRangeAvailable(start, end, soldOutDays);
  }

  // Calendar click
  function handleCellClick(dateStr: string, disabled: boolean) {
    if (disabled) return;
    if (selecting === null || selecting === 'in') {
      setCheckIn(dateStr);
      setCheckOut('');
      setSelecting('out');
    } else {
      if (dateStr <= checkIn) {
        // Clicked before or on check-in → restart from here
        setCheckIn(dateStr);
        setCheckOut('');
        setSelecting('out');
      } else {
        // Validate: no sold-out day inside the range
        if (hasSoldOutInRange(checkIn, dateStr)) {
          addToast(
            '⚠️ 예약 불가 기간 포함 — 선택하신 일정 사이에 이미 매진된 품절(Sold Out) 일자가 포함되어 예약할 수 없습니다.',
            'warning'
          );
          // Reset: use the last clicked date as new check-in
          setCheckIn(dateStr);
          setCheckOut('');
          setSelecting('out');
          return;
        }
        setCheckOut(dateStr);
        setSelecting(null);
      }
    }
  }

  function getCellStyle(cell: { dateStr: string; disabled: boolean; isEmpty: boolean; isWeekend: boolean }) {
    if (cell.isEmpty) return {};
    const isStart = cell.dateStr === checkIn;
    const isEnd = cell.dateStr === checkOut;
    const inRange = checkIn && checkOut && cell.dateStr > checkIn && cell.dateStr < checkOut;

    if (isStart || isEnd) {
      return {
        background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
        color: '#fff',
        borderRadius: '10px',
        boxShadow: `0 4px 10px rgba(0,92,230,0.22)`,
        border: '1.5px solid transparent',
      };
    }
    if (inRange) {
      return {
        background: 'rgba(0,92,230,0.08)',
        border: '1.5px solid rgba(0,92,230,0.15)',
        borderRadius: '4px',
        color: PRIMARY,
      };
    }
    if (cell.disabled) {
      return {
        opacity: 0.4,
        cursor: 'not-allowed',
        background: '#f7f9fa',
        borderRadius: '10px',
        border: '1.5px solid transparent',
      };
    }
    return {
      cursor: 'pointer',
      borderRadius: '10px',
      border: '1.5px solid transparent',
      transition: 'all 0.15s ease',
    };
  }

  // Banner dates
  const bannerStart = checkIn || todayStr();
  const bannerEnd = checkOut || addDaysStr(bannerStart, 1);
  const bannerNights = countNights(bannerStart, bannerEnd);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  async function handleBook() {
    if (!isLoggedIn) {
      addToast('로그인 후에 숙소를 예약하실 수 있습니다.', 'warning');
      onClose();
      openAuthModal('login');
      return;
    }
    if (nights === 0) {
      addToast('체크인/체크아웃 일정을 선택해 주세요.', 'warning');
      return;
    }

    setBooking(true);
    try {
      const res = await book_stay_api({
        roomId,
        checkIn,
        checkOut,
        guests: adultCount,
        totalPrice: finalTotal + mileageUsed,
      });
      if (!res.success || !res.data?.reservationId) {
        addToast(res.message || '숙소 예약에 실패했습니다.', 'warning');
        return;
      }
      onClose();
      navigate('/payment', {
        state: buildPaymentCheckout({
          reservationType: 'ROOM',
          reservationId: res.data.reservationId,
          productTitle: stay.title,
          productSubtitle: stay.location,
          productImageUrl: stay.imageUrl,
          categoryLabel: '숙소',
          categoryIcon: 'fa-hotel',
          totalAmount: res.data.totalPrice ?? finalTotal + mileageUsed,
          usedMileage: mileageUsed,
          dateSummary: `${checkIn} ~ ${checkOut} (${nights}박)`,
          detailLines: [
            `₩${stay.pricePerNight.toLocaleString('ko-KR')} × ${nights}박`,
            `성인 ${adultCount}명`,
          ],
          returnPath: '/',
        }),
      });
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (err as { error?: { message?: string } })?.error?.message ||
        '숙소 예약 중 오류가 발생했습니다.';
      addToast(msg, 'warning');
    } finally {
      setBooking(false);
    }
  }

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.52)',
        backdropFilter: 'blur(3px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '580px',
          maxWidth: '95%',
          padding: '1.8rem',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          animation: 'zoomIn 0.22s ease',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '18px', right: '18px',
            background: 'none', border: 'none',
            fontSize: '1.2rem', color: '#717171',
            cursor: 'pointer', lineHeight: 1,
            padding: '4px',
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
              src={stay.imageUrl}
              alt={stay.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <h3 style={{
              fontSize: '1.18rem', fontWeight: 800, marginBottom: '0.2rem',
              color: '#1a1a1a', letterSpacing: '-0.5px', lineHeight: 1.3,
            }}>
              {stay.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.78rem', color: '#717171' }}>
              <span>
                <i className="fa-solid fa-location-dot" />{' '}{stay.location}
              </span>
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.8rem',
          }}>
            <div>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: PRIMARY, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                선택한 예약 일정
              </span>
              <strong style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>
                {bannerStart} ➔ {bannerEnd || '—'}
              </strong>
            </div>
            <span style={{
              background: PRIMARY, color: '#fff',
              fontSize: '0.72rem', fontWeight: 800,
              padding: '0.22rem 0.65rem', borderRadius: '999px',
            }}>
              {bannerNights}박 {bannerNights + 1}일
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
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '0.7rem',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontWeight: 800, fontSize: '0.88rem', color: '#1a1a1a',
                borderLeft: `3px solid ${PRIMARY}`, paddingLeft: '0.45rem',
              }}>
                <span>📅</span>
                <span>{monthLabel(calYear, calMonth)}</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 500, color: '#717171' }}>체크인/아웃 순 클릭</span>
              </div>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button
                  onClick={() => {
                    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                    else setCalMonth(m => m - 1);
                  }}
                  style={{ background: 'none', border: '1px solid #ddd', borderRadius: '6px', width: '26px', height: '26px', cursor: 'pointer', fontSize: '0.75rem', color: '#717171' }}
                >‹</button>
                <button
                  onClick={() => {
                    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                    else setCalMonth(m => m + 1);
                  }}
                  style={{ background: 'none', border: '1px solid #ddd', borderRadius: '6px', width: '26px', height: '26px', cursor: 'pointer', fontSize: '0.75rem', color: '#717171' }}
                >›</button>
              </div>
            </div>

            {/* Day-of-week header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '4px' }}>
              {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                <div key={d} style={{ fontSize: '0.7rem', fontWeight: 700, color: i === 0 ? SECONDARY : i === 6 ? PRIMARY : '#717171', padding: '3px 0' }}>{d}</div>
              ))}
            </div>

            {/* Cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
              {cells.map((cell, idx) => {
                if (cell.isEmpty) return <div key={idx} />;
                const isSelected = cell.dateStr === checkIn || cell.dateStr === checkOut;
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
                      position: 'relative',
                      ...style,
                    }}
                  >
                    <span style={{
                      fontSize: '0.8rem', fontWeight: 700,
                      color: isSelected ? '#fff' : cell.disabled ? '#aaa' : cell.isWeekend ? (cells.indexOf(cell) % 7 === 0 ? SECONDARY : PRIMARY) : '#1a1a1a',
                      textDecoration: cell.disabled ? 'line-through' : 'none',
                    }}>
                      {cell.day}
                    </span>
                    {!cell.disabled && (
                      <span style={{ fontSize: '0.52rem', fontWeight: 700, color: isSelected ? 'rgba(255,255,255,0.85)' : '#717171', marginTop: '1px', letterSpacing: '-0.3px' }}>
                        {(cell.price / 1000).toFixed(0)}만
                      </span>
                    )}
                    {cell.disabled && (
                      <span style={{ fontSize: '0.48rem', fontWeight: 800, color: SECONDARY, marginTop: '1px' }}>품절</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guest Picker */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '8px',
            background: '#f0f2f5', borderRadius: '12px',
            padding: '0.85rem 1rem',
            marginBottom: '0.8rem',
            border: '1px solid #ddd',
          }}>
            {/* Adults */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a1a' }}>투숙객</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setAdultCount(c => Math.max(1, c - 1))}
                  disabled={adultCount <= 1}
                  style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    border: adultCount <= 1 ? '1.5px solid #ddd' : `1.5px solid ${PRIMARY}`,
                    color: adultCount <= 1 ? '#ddd' : PRIMARY,
                    background: '#fff', cursor: adultCount <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >−</button>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a1a', minWidth: '14px', textAlign: 'center' }}>{adultCount}</span>
                <button
                  onClick={() => setAdultCount(c => Math.min(10, c + 1))}
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
            {adultCount > 1 && (
              <p style={{ fontSize: '0.7rem', color: '#717171', marginTop: '2px' }}>
                총 {adultCount}명 · 객실 1개 기준
              </p>
            )}
          </div>

          <MileageUsagePanel
            availableBalance={userMileage}
            orderTotal={rawTotal}
            value={mileageUsed}
            onChange={setMileageUsed}
          />

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
              <span>객실 이용료 ({nights}박)</span>
              <span style={{ fontWeight: 700, color: '#1a1a1a' }}>₩{rawTotal.toLocaleString('ko-KR')}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#717171', marginBottom: '0.35rem', paddingLeft: '0.4rem' }}>
              {buildBillingDesc()}
            </div>
            {mileageUsed > 0 && rawTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#008a05', marginBottom: '0.35rem', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '0.35rem' }}>
                <span>마일리지 차감 적용</span>
                <span>− ₩{mileageUsed.toLocaleString('ko-KR')}</span>
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
            disabled={booking}
            style={{
              width: '100%', padding: '0.75rem',
              background: `linear-gradient(135deg, ${SECONDARY} 0%, #e0484d 100%)`,
              color: '#fff', border: 'none', borderRadius: '12px',
              fontSize: '0.9rem', fontWeight: 800, cursor: booking ? 'wait' : 'pointer',
              opacity: booking ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(255,90,95,0.28)',
              letterSpacing: '-0.2px',
            }}
          >
            {booking ? '예약 처리 중...' : '숙소 예약하기'}
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
