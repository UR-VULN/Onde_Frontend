import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import type { CarDto, CalendarDayInfo } from '@/api/carApi';
import { book_car_api, get_inventory_calendar_api } from '@/api/carApi';
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
import { extractApiErrorMessage } from '@/utils/apiResponse';

import { ListingThumbnail } from '@/components/common/ListingThumbnail';
import { hasDisplayImage, hasDisplayPrice } from '@/utils/listingDisplay';

// ─── constants ───────────────────────────────────────────────
const PRIMARY = '#005ce6';
const SECONDARY = '#ff5a5f';


// ─── props ───────────────────────────────────────────────────
interface CarDetailModalProps {
  car: CarDto;
  vehicles?: CarDto[];
  soldOutDays?: number[];
  defaultPickup?: string;
  defaultReturn?: string;
  onClose: () => void;
}

// ─── component ───────────────────────────────────────────────
export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  car,
  vehicles = [],
  soldOutDays = [],
  defaultPickup,
  defaultReturn,
  onClose,
}) => {
  const navigate = useNavigate();
  const { addToast, isLoggedIn, openAuthModal } = useTravelStore();

  // car.unavailableDays를 Set으로 변환 (백엔드 연동 시 API 응답값으로 대체)
  const [booking, setBooking] = useState(false);
  const unavailableDaysSet = useMemo(() => new Set(soldOutDays), [soldOutDays]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const preferredPickup = defaultPickup ?? todayStr();
  const preferredReturn = defaultReturn ?? addDaysStr(preferredPickup, 1);
  const { checkIn: initPickup, checkOut: initReturn } = resolveValidStayRange(
    preferredPickup,
    preferredReturn,
    soldOutDays,
  );

  const [pickupDate, setPickupDate] = useState<string>(initPickup);
  const [returnDate, setReturnDate] = useState<string>(initReturn);
  const [selecting, setSelecting] = useState<'pickup' | 'return' | null>(null);

  // Calendar month navigation
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const [calendarData, setCalendarData] = useState<Record<string, CalendarDayInfo>>({});
  const [knownPrices, setKnownPrices] = useState<Record<string, number>>({});
  const [individualCalendars, setIndividualCalendars] = useState<Record<number, Record<string, CalendarDayInfo>>>({});

  const targetVehicles = useMemo(() => {
    return vehicles && vehicles.length > 0 ? vehicles : [car];
  }, [vehicles, car]);

  const [selectedCarId, setSelectedCarId] = useState<number>(car.carId);

  const selectedVehicle = useMemo(() => {
    return targetVehicles.find(v => v.carId === selectedCarId) || car;
  }, [targetVehicles, selectedCarId, car]);

  useEffect(() => {
    let active = true;
    const fetchCalendar = async () => {
      const monthStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
      try {
        const promises = targetVehicles.map(async (v) => {
          const res = await get_inventory_calendar_api('CAR', v.carId, monthStr);
          return { carId: v.carId, success: res.success, data: res.data };
        });
        const results = await Promise.all(promises);

        const calendarsMap: Record<number, Record<string, CalendarDayInfo>> = {};
        const mergedData: Record<string, CalendarDayInfo> = {};

        results.forEach((res) => {
          if (res.success && res.data) {
            calendarsMap[res.carId] = res.data;
            Object.entries(res.data).forEach(([day, info]) => {
              if (!mergedData[day]) {
                mergedData[day] = {
                  price: info.price,
                  stock: info.stock ?? 0,
                  isClosed: info.isClosed,
                };
              } else {
                mergedData[day].stock = (mergedData[day].stock ?? 0) + (info.stock ?? 0);
                if (!info.isClosed && (info.stock ?? 0) > 0) {
                  mergedData[day].isClosed = false;
                }
                if (info.price > 0 && (mergedData[day].price === 0 || info.price < mergedData[day].price)) {
                  mergedData[day].price = info.price;
                }
              }
            });
          }
        });

        if (active) {
          setIndividualCalendars(calendarsMap);
          setCalendarData(mergedData);
        }
      } catch (err) {
        console.error('Failed to fetch calendar:', err);
      }
    };
    fetchCalendar();
    return () => { active = false; };
  }, [calYear, calMonth, targetVehicles]);

  useEffect(() => {
    if (Object.keys(calendarData).length > 0) {
      setKnownPrices(prev => {
        const next = { ...prev };
        Object.entries(calendarData).forEach(([day, info]) => {
          const mm = String(calMonth + 1).padStart(2, '0');
          const dd = String(day).padStart(2, '0');
          const dateStr = `${calYear}-${mm}-${dd}`;
          next[dateStr] = info.price;
        });
        return next;
      });
    }
  }, [calendarData, calYear, calMonth]);

  const cells = useMemo(() => {
    const rawCells = buildCalendarMonth(calYear, calMonth, car.pricePerDay, {
      weekendSurchargeRate: 0,
      disabledDays: unavailableDaysSet,
      disableBeforeToday: true,
    });
    return rawCells.map(cell => {
      if (cell.isEmpty) return cell;
      const dayKey = String(cell.day);
      const dbInfo = calendarData[dayKey];
      if (dbInfo) {
        return {
          ...cell,
          price: dbInfo.price > 0 ? dbInfo.price : cell.price,
          disabled: cell.disabled || dbInfo.isClosed || dbInfo.stock <= 0,
          stock: dbInfo.stock,
        };
      }
      return cell;
    });
  }, [calYear, calMonth, car.pricePerDay, unavailableDaysSet, calendarData]);

  // Days rented
  const isRangeSelected = !!(pickupDate && returnDate);
  const rentalDays = isRangeSelected ? countNights(pickupDate, returnDate) : 0;

  const rawTotal = useMemo(() => {
    if (!isRangeSelected) return 0;
    let total = 0;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const cur = new Date(start);
    while (cur < end) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      const price = knownPrices[dateStr] ?? car.pricePerDay;
      total += price;
      cur.setDate(cur.getDate() + 1);
    }
    return total;
  }, [isRangeSelected, pickupDate, returnDate, knownPrices, car.pricePerDay]);

  const finalTotal = rawTotal;

  const availableVehicles = useMemo(() => {
    if (!pickupDate || !returnDate || targetVehicles.length === 0) {
      return targetVehicles;
    }

    return targetVehicles.filter(v => {
      const cal = individualCalendars[v.carId];
      if (!cal) return true;

      const start = new Date(pickupDate);
      const end = new Date(returnDate);
      const cur = new Date(start);

      while (cur < end) {
        const d = String(cur.getDate());
        const info = cal[d];
        if (info && (info.isClosed || info.stock <= 0)) {
          return false;
        }
        cur.setDate(cur.getDate() + 1);
      }
      return true;
    });
  }, [pickupDate, returnDate, targetVehicles, individualCalendars]);

  useEffect(() => {
    if (availableVehicles.length > 0) {
      const isStillAvailable = availableVehicles.some(v => v.carId === selectedCarId);
      if (!isStillAvailable) {
        setSelectedCarId(availableVehicles[0].carId);
      }
    }
  }, [availableVehicles, selectedCarId]);

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

  function hasSoldOutInRange(start: string, end: string): boolean {
    return !isStayRangeAvailable(start, end, soldOutDays);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  async function handleBook() {
    if (!isLoggedIn) {
      addToast('로그인 후에 렌터카를 예약하실 수 있습니다.', 'warning');
      onClose();
      openAuthModal('login');
      return;
    }
    if (!isRangeSelected) {
      addToast('일정을 완료해 주세요.', 'warning');
      return;
    }

    setBooking(true);
    try {
      const orderTotal = finalTotal;
      const res = await book_car_api({
        carId: selectedCarId,
        startDate: pickupDate,
        endDate: returnDate,
        totalPrice: orderTotal,
      });
      if (!res.success || !res.data?.reservationId) {
        addToast(res.message || '렌터카 예약에 실패했습니다.', 'warning');
        return;
      }
      onClose();
      navigate('/payment', {
        state: buildPaymentCheckout({
          reservationType: 'CAR',
          reservationId: res.data.reservationId,
          productTitle: selectedVehicle.name,
          productSubtitle: `${selectedVehicle.typeLabel} (${selectedVehicle.licensePlate || ''})`,
          productImageUrl: hasDisplayImage(selectedVehicle.imageUrl) ? selectedVehicle.imageUrl : undefined,
          categoryLabel: '렌터카',
          categoryIcon: 'fa-car',
          totalAmount: res.data.totalPrice ?? orderTotal,
          usedMileage: 0,
          dateSummary: `${pickupDate} ~ ${returnDate} (${rentalDays}일 대여)`,
          detailLines: [
            ...(hasDisplayPrice(selectedVehicle.pricePerDay)
              ? [`₩${(orderTotal / rentalDays).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}/일 평균 × ${rentalDays}일`]
              : []),
            ...(selectedVehicle.fuel && selectedVehicle.seats
              ? [`${selectedVehicle.fuel} · ${selectedVehicle.seats}인승`]
              : selectedVehicle.fuel
                ? [selectedVehicle.fuel]
                : selectedVehicle.seats
                  ? [`${selectedVehicle.seats}인승`]
                  : []),
          ],
          returnPath: '/car',
        }),
      });
    } catch (err: unknown) {
      addToast(extractApiErrorMessage(err, '렌터카 예약 중 오류가 발생했습니다.'), 'warning');
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
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
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
            <ListingThumbnail
              imageUrl={car.imageUrl}
              alt={car.name}
              iconClass="fa-car"
              className="w-full h-full text-xl"
              imgClassName="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 style={{ fontSize: '1.18rem', fontWeight: 800, marginBottom: '0.2rem', color: '#1a1a1a', letterSpacing: '-0.5px', lineHeight: 1.3 }}>
              {car.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.78rem', color: '#717171', flexWrap: 'wrap' }}>
              <span><i className="fa-solid fa-car" /> {car.typeLabel}</span>
              {selectedVehicle.licensePlate && (
                <>
                  <span>•</span>
                  <span style={{ color: PRIMARY, fontWeight: 700 }}>
                    <i className="fa-solid fa-rectangle-ad" /> {selectedVehicle.licensePlate}
                  </span>
                </>
              )}
              {car.seats != null && (
                <>
                  <span>•</span>
                  <span><i className="fa-solid fa-users" /> {car.seats}인승</span>
                </>
              )}
              {car.fuel && (
                <>
                  <span>•</span>
                  <span><i className="fa-solid fa-gas-pump" /> {car.fuel}</span>
                </>
              )}
              {hasDisplayPrice(car.pricePerDay) && (
                <>
                  <span>•</span>
                  <span style={{ color: SECONDARY, fontWeight: 700 }}>₩{car.pricePerDay.toLocaleString('ko-KR')} / per Day</span>
                </>
              )}
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
                {isRangeSelected ? `${pickupDate} ➔ ${returnDate}` : `${pickupDate || '—'} ➔ 선택 대기 중`}
              </strong>
            </div>
            <span style={{
              background: isRangeSelected ? PRIMARY : SECONDARY, color: '#fff',
              fontSize: '0.72rem', fontWeight: 800,
              padding: '0.22rem 0.65rem', borderRadius: '999px',
            }}>
              {isRangeSelected ? `${rentalDays}일 대여` : '반납일 선택 대기'}
            </span>
          </div>

          {/* Vehicle Selector (License Plates) */}
          {targetVehicles.length > 1 && (
            <div style={{ marginBottom: '0.8rem', padding: '0.2rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: PRIMARY, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                차량 선택 (번호판)
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                {targetVehicles.map((v) => {
                  const isSelected = selectedCarId === v.carId;
                  const isAvailable = availableVehicles.some(av => av.carId === v.carId);
                  return (
                    <button
                      key={v.carId}
                      disabled={!isAvailable}
                      onClick={() => setSelectedCarId(v.carId)}
                      style={{
                        padding: '0.45rem 0.65rem',
                        borderRadius: '8px',
                        border: isSelected ? `2px solid ${PRIMARY}` : '1.5px solid #e2e8f0',
                        background: isSelected ? 'rgba(0, 92, 230, 0.04)' : !isAvailable ? '#f8fafc' : '#fff',
                        color: isSelected ? PRIMARY : !isAvailable ? '#94a3b8' : '#1e293b',
                        fontWeight: isSelected ? '800' : '500',
                        fontSize: '0.78rem',
                        cursor: !isAvailable ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'center',
                        opacity: !isAvailable ? 0.6 : 1,
                        boxShadow: isSelected ? '0 2px 6px rgba(0,92,230,0.1)' : 'none',
                      }}
                    >
                      <div style={{ fontSize: '0.82rem', fontWeight: 'bold' }}>
                        {v.licensePlate || `차량 ${v.carId}`}
                      </div>
                      <div style={{ fontSize: '0.62rem', marginTop: '2px', fontWeight: '700', color: isAvailable ? (isSelected ? PRIMARY : '#64748b') : SECONDARY }}>
                        {isAvailable ? '대여 가능' : '예약 마감'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
                      <>
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: isSelected ? 'rgba(255,255,255,0.85)' : '#717171', marginTop: '1px' }}>
                          {cell.price / 10000}만
                        </span>
                        {cell.stock !== undefined && (
                          <span style={{ fontSize: '0.58rem', fontWeight: 800, color: isSelected ? 'rgba(255,255,255,0.75)' : '#005ce6', marginTop: '1px' }}>
                            {cell.stock}대 남음
                          </span>
                        )}
                      </>
                    )}
                    {cell.disabled && (
                      <span style={{ fontSize: '0.48rem', fontWeight: 800, color: SECONDARY, marginTop: '1px' }}>예약마감</span>
                    )}
                  </div>
                );
              })}
            </div>
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
              <span>차량 대여료 ({isRangeSelected ? `${rentalDays}일` : '선택 대기'})</span>
              <span style={{ fontWeight: 700, color: '#1a1a1a' }}>{isRangeSelected ? `₩${rawTotal.toLocaleString('ko-KR')}` : '₩ -'}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#717171', marginBottom: '0.35rem', paddingLeft: '0.4rem' }}>
              {isRangeSelected ? `₩${(rawTotal / rentalDays).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}/일 평균 요금 (총 ${rentalDays}일)` : '일정을 완료해 주세요'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.55rem', fontWeight: 800, fontSize: '1.05rem', color: '#1a1a1a' }}>
              <span>최종 결제 합계</span>
              <span style={{ color: SECONDARY, fontSize: '1.22rem', fontFamily: 'GmarketSansBold, Pretendard, sans-serif' }}>
                {isRangeSelected ? `₩${finalTotal.toLocaleString('ko-KR')}` : '₩ -'}
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
            {booking ? '예약 처리 중...' : '차량 예약하기'}
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
