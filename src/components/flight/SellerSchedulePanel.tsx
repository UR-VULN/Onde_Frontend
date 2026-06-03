import React, { useState, useEffect } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  seller_get_calendar_schedules_api,
  seller_control_schedule_api,
  seller_register_flights_batch_api
} from '@/api/flightApi';
import type {
  SellerCalendarCellDto,
  FlightBatchRegisterPayload
} from '@/api/flightApi';
import { SellerMonthYearSelect } from '@/components/seller/SellerMonthYearSelect';
import { formatYearMonthValue, getDefaultYearMonthValue, parseYearMonthValue } from '@/utils/calendarUtils';

export const SellerSchedulePanel: React.FC = () => {
  const { addToast } = useTravelStore();

  const [origin, setOrigin] = useState('ICN');
  const [dest, setDest] = useState('NRT');
  const [yearMonth, setYearMonth] = useState(getDefaultYearMonthValue);
  const { year, month } = parseYearMonthValue(yearMonth);
  const [schedules, setSchedules] = useState<SellerCalendarCellDto[]>([]);
  
  // Modals visibility
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<SellerCalendarCellDto | null>(null);

  // Override inputs
  const [overridePrice, setOverridePrice] = useState('');
  const [remainingSeats, setRemainingSeats] = useState('');

  // Batch register form state
  const [batchForm, setBatchForm] = useState<FlightBatchRegisterPayload>({
    departureAirport: 'ICN',
    arrivalAirport: 'NRT',
    distanceKm: 1200,
    flightNumber: 'KE-023',
    departureTime: '14:30',
    arrivalTime: '17:00',
    durationMinutes: 150,
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    operatingDays: 'MON,WED,FRI',
    firstSeats: 8,
    firstPrice: 2200000,
    businessSeats: 24,
    businessPrice: 880000,
    economySeats: 150,
    economyPrice: 320000
  });

  const fetchSchedules = async () => {
    try {
      const res = await seller_get_calendar_schedules_api({ year, month });
      if (res.success && res.data) {
        setSchedules(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load seller calendar:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [origin, dest, year, month]);

  const handle_batch_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addToast("신규 정기 스케줄 배치를 일괄 등록 신청 중입니다...", "info");
      const res = await seller_register_flights_batch_api(batchForm);
      if (res.success) {
        addToast("정기 항공편 스케줄이 PENDING_APPROVAL 상태로 일괄 신청 완료되었습니다.", "success");
        setIsBatchOpen(false);
        fetchSchedules();
      }
    } catch (err: any) {
      addToast(err?.error?.message || "스케줄 일괄 등록 도중 오류가 발생했습니다.", "warning");
    }
  };

  const handle_override_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell) return;

    try {
      addToast("가격 및 잔여 좌석 상태 변경 내용을 반영 중입니다...", "info");
      const res = await seller_control_schedule_api(selectedCell.scheduleId, {
        controlType:
          remainingSeats && parseInt(remainingSeats, 10) === 0
            ? 'INVENTORY_CLOSE'
            : 'PRICE_OVERRIDE',
        classType: selectedCell.classType ?? 'ECONOMY',
        remainingSeats: remainingSeats ? parseInt(remainingSeats, 10) : undefined,
        overridePrice: overridePrice ? parseFloat(overridePrice) : undefined,
      });

      if (res.success) {
        addToast("캘린더 제어 설정이 성공적으로 갱신되었습니다.", "success");
        setIsOverrideOpen(false);
        fetchSchedules();
      }
    } catch (err: any) {
      addToast(err?.error?.message || "가격/좌석 변경 제어 권한 검증에 실패했습니다.", "warning");
    }
  };

  const filteredSchedules = schedules.filter((s) => {
    const dep = s.departureAirport?.toUpperCase();
    const arr = s.arrivalAirport?.toUpperCase();
    if (dep && arr) {
      return dep === origin.toUpperCase() && arr === dest.toUpperCase();
    }
    return true;
  });

  const renderCalendarCells = () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDayOffset = new Date(year, month - 1, 1).getDay();
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < startDayOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell" style={{ background: 'var(--bg-light)', cursor: 'default' }}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${formatYearMonthValue(year, month)}-${String(day).padStart(2, '0')}`;
      const daySchedules = filteredSchedules.filter((s) => s.departureTime.startsWith(dateStr));

      cells.push(
        <div key={day} className="calendar-cell">
          <span className="calendar-cell-date">{day}</span>
          
          <div className="calendar-cell-data" style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
            {daySchedules.length > 0 ? (
              daySchedules.slice(0, 2).map((schedule) => {
                const is_closed = schedule.remainingSeats === 0;
                return (
                  <div
                    key={schedule.scheduleId}
                    style={{
                      fontSize: '0.68rem',
                      padding: '1px 4px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: is_closed ? '#fff0f0' : '#f0fdf4',
                      color: is_closed ? 'var(--secondary)' : '#008a05',
                      border: `1px solid ${is_closed ? 'rgba(255,90,95,0.2)' : 'rgba(0,138,5,0.15)'}`,
                    }}
                    onClick={() => {
                      setSelectedCell(schedule);
                      setOverridePrice(schedule.basePrice.toString());
                      setRemainingSeats(schedule.remainingSeats.toString());
                      setIsOverrideOpen(true);
                    }}
                  >
                    {schedule.flightNumber} {is_closed ? '마감' : `${schedule.remainingSeats}석`}
                    <br />₩{(schedule.basePrice / 1000).toFixed(0)}k
                  </div>
                );
              })
            ) : (
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>운항 없음</span>
            )}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="seller-panel animate-[fadeIn_0.35s_ease] space-y-8">
      {/* Header Area */}
      <div className="section-header">
        <div>
          <h2 className="section-title">항공 노선 스케줄 및 여행자 보험 상품 관리</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            신규 노선 타임테이블 등록 및 보험 요율 테이블을 제어합니다.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsBatchOpen(true)}
        >
          <i className="fa-solid fa-plane-up"></i> 정기 스케줄 일괄 등록
        </button>
      </div>

      {/* Filter and Control Section */}
      <div className="data-table-container" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h4 style={{ fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-calendar-days" style={{ color: 'var(--primary)' }}></i>
            스케줄 제어 Extranet <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>(달력 UI)</span>
          </h4>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>출발지</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                className="form-input"
                style={{ width: '80px', textAlign: 'center', padding: '0.5rem 0.75rem' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>목적지</label>
              <input
                type="text"
                value={dest}
                onChange={(e) => setDest(e.target.value.toUpperCase())}
                className="form-input"
                style={{ width: '80px', textAlign: 'center', padding: '0.5rem 0.75rem' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>조회 월</label>
              <SellerMonthYearSelect
                value={yearMonth}
                onChange={setYearMonth}
                style={{ padding: '0.5rem 0.75rem' }}
              />
            </div>
          </div>
        </div>

        {/* Real-time calendar grid */}
        <div className="calendar-grid" style={{ borderRadius: 'var(--radius-md)' }}>
          {['일', '월', '화', '수', '목', '금', '토'].map((d, idx) => (
            <div key={d} className="calendar-header-cell">
              <span style={{ color: idx === 0 ? 'var(--secondary)' : idx === 6 ? 'var(--primary)' : undefined }}>{d}</span>
            </div>
          ))}
          {renderCalendarCells()}
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-circle-info" style={{ color: 'var(--primary)' }}></i>
            개별 운항 스케줄을 클릭하여 실시간 가격 할인/할증 및 잔여석 수량을 직접 오버라이드할 수 있습니다.
          </p>
        </div>
      </div>

      {/* Batch Register Modal */}
      {isBatchOpen && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="app-modal" style={{ width: '640px', maxWidth: '96%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-plane-up" style={{ color: 'var(--primary)' }}></i> 정기 스케줄 일괄 신청 등록
              </h3>
              <button type="button" style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }} onClick={() => setIsBatchOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handle_batch_submit}>
              <div className="grid-2" style={{ marginBottom: '1.2rem' }}>
                <div className="form-group">
                  <label className="form-label">출발 / 도착 공항 IATA</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="text" value={batchForm.departureAirport} onChange={(e) => setBatchForm({ ...batchForm, departureAirport: e.target.value.toUpperCase() })} className="form-input" style={{ flex: 1, textAlign: 'center' }} placeholder="ICN" required />
                    <i className="fa-solid fa-arrow-right" style={{ color: 'var(--text-muted)' }}></i>
                    <input type="text" value={batchForm.arrivalAirport} onChange={(e) => setBatchForm({ ...batchForm, arrivalAirport: e.target.value.toUpperCase() })} className="form-input" style={{ flex: 1, textAlign: 'center' }} placeholder="NRT" required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">비행 편명 (Flight No.)</label>
                  <input type="text" value={batchForm.flightNumber} onChange={(e) => setBatchForm({ ...batchForm, flightNumber: e.target.value })} className="form-input" placeholder="KE-023" required />
                </div>
                <div className="form-group">
                  <label className="form-label">출발 / 도착 시간 (Local)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="text" value={batchForm.departureTime} onChange={(e) => setBatchForm({ ...batchForm, departureTime: e.target.value })} className="form-input" style={{ flex: 1, textAlign: 'center' }} placeholder="14:30" required />
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>~</span>
                    <input type="text" value={batchForm.arrivalTime} onChange={(e) => setBatchForm({ ...batchForm, arrivalTime: e.target.value })} className="form-input" style={{ flex: 1, textAlign: 'center' }} placeholder="17:00" required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">운항 기간 (Start ~ End)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="date" value={batchForm.startDate} onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })} className="form-input" style={{ flex: 1 }} required />
                    <input type="date" value={batchForm.endDate} onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })} className="form-input" style={{ flex: 1 }} required />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">클래스별 공급 좌석 및 기준가 설정</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {[
                    { key: 'economy', label: 'ECONOMY', seatsKey: 'economySeats', priceKey: 'economyPrice', color: '#eff6ff', textColor: '#1d4ed8' },
                    { key: 'business', label: 'BUSINESS', seatsKey: 'businessSeats', priceKey: 'businessPrice', color: '#eef2ff', textColor: '#4338ca' },
                    { key: 'first', label: 'FIRST CLASS', seatsKey: 'firstSeats', priceKey: 'firstPrice', color: 'var(--bg-light)', textColor: 'var(--text-dark)' },
                  ].map((cls) => (
                    <div key={cls.key} style={{ background: cls.color, padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: cls.textColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{cls.label}</span>
                      <input type="number" value={(batchForm as any)[cls.seatsKey]} onChange={(e) => setBatchForm({ ...batchForm, [cls.seatsKey]: parseInt(e.target.value) })} className="form-input" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} placeholder="공급석" />
                      <input type="number" value={(batchForm as any)[cls.priceKey]} onChange={(e) => setBatchForm({ ...batchForm, [cls.priceKey]: parseInt(e.target.value) })} className="form-input" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} placeholder="기준 요금" />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, padding: '0.8rem' }} onClick={() => setIsBatchOpen(false)}>취소</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.8rem' }}>배치 심사 신청</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Override control cell Modal */}
      {isOverrideOpen && selectedCell && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="app-modal" style={{ width: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-sliders" style={{ color: 'var(--primary)' }}></i> 스케줄 오버라이드
              </h3>
              <button type="button" style={{ color: 'var(--text-muted)' }} onClick={() => setIsOverrideOpen(false)}>
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.2rem' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>운항 정보</p>
              <p style={{ fontWeight: 800, color: 'var(--text-dark)', marginTop: '0.2rem' }}>{selectedCell.flightNumber} ({selectedCell.classType})</p>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{selectedCell.departureTime.split('T')[0]} 운항분</p>
            </div>

            <form onSubmit={handle_override_submit}>
              <div className="form-group">
                <label className="form-label">잔여 좌석 수량 조절</label>
                <input type="number" value={remainingSeats} onChange={(e) => setRemainingSeats(e.target.value)} className="form-input" placeholder="수정할 석 수" />
              </div>
              <div className="form-group">
                <label className="form-label">요금 오버라이드 (할증/할인)</label>
                <input type="number" value={overridePrice} onChange={(e) => setOverridePrice(e.target.value)} className="form-input" placeholder="대체할 요금 (원)" />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, padding: '0.7rem' }} onClick={() => setIsOverrideOpen(false)}>취소</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.7rem' }}>변경사항 적용</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
