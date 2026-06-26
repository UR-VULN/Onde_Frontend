import React, { useState, useEffect } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  seller_get_calendar_schedules_api,
  seller_control_schedule_api,
  seller_register_flights_batch_api,
  seller_get_flight_routes_api
} from '@/api/flightApi';
import type {
  SellerCalendarCellDto,
  FlightBatchRegisterPayload,
  SellerFlightRouteDto
} from '@/api/flightApi';
import { SellerMonthYearSelect } from '@/components/seller/SellerMonthYearSelect';
import { formatYearMonthValue, getDefaultYearMonthValue, parseYearMonthValue } from '@/utils/calendarUtils';
import { extractApiErrorMessage } from '@/utils/apiResponse';

export const SellerSchedulePanel: React.FC = () => {
  const { addToast } = useTravelStore();

  const [routes, setRoutes] = useState<SellerFlightRouteDto[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<number | undefined>(undefined);
  const [yearMonth, setYearMonth] = useState(getDefaultYearMonthValue);
  const { year, month } = parseYearMonthValue(yearMonth);
  const [schedules, setSchedules] = useState<SellerCalendarCellDto[]>([]);

  // 노선 목록으로부터 사용 가능한 공항(IATA) 목록 추출
  const availableAirports = React.useMemo(() => {
    const defaultAirports = [
      'BCN', 'BKK', 'CDG', 'CEB', 'CJJ', 'CJU', 'DAD', 'DPS', 'DXB', 'FCO', 
      'FUK', 'GMP', 'HKG', 'HND', 'ICN', 'JFK', 'KAG', 'KIX', 'LAS', 'LAX', 
      'LHR', 'NRT', 'PUS', 'PVG', 'SIN', 'SYD', 'TAE', 'TPE'
    ];
    const dbAirports = routes.flatMap((r) => {
      const parts = r.name.split(/➡️|[- >]+/);
      return [parts[0]?.trim(), parts[1]?.trim()].filter(Boolean);
    });
    return Array.from(new Set([...defaultAirports, ...dbAirports])).sort();
  }, [routes]);

  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
  
  // Modals visibility
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<SellerCalendarCellDto | null>(null);

  // Override inputs
  const [overridePrice, setOverridePrice] = useState('');
  const [remainingSeats, setRemainingSeats] = useState('');

  // Batch register form state
  const [batchForm, setBatchForm] = useState<FlightBatchRegisterPayload>(() => {
    const todayStr = getTodayString();
    return {
      departureAirport: 'ICN',
      arrivalAirport: 'NRT',
      distanceKm: 1200,
      flightNumber: 'KE-023',
      departureTime: '14:30',
      arrivalTime: '17:00',
      durationMinutes: 150,
      startDate: todayStr,
      endDate: todayStr,
      operatingDays: 'MON,WED,FRI',
      firstSeats: 8,
      firstPrice: 2200000,
      businessSeats: 24,
      businessPrice: 880000,
      economySeats: 150,
      economyPrice: 320000
    };
  });

  const fetchSchedules = async () => {
    if (!selectedRouteId) {
      setSchedules([]);
      return;
    }
    try {
      const res = await seller_get_calendar_schedules_api({ routeId: selectedRouteId, year, month });
      if (res.success && res.data) {
        setSchedules(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load seller calendar:", err);
    }
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await seller_get_flight_routes_api();
        if (res.success && res.data && res.data.flights) {
          setRoutes(res.data.flights);
          if (res.data.flights.length > 0) {
            setSelectedRouteId(res.data.flights[0].propertyId);
          }
        }
      } catch (err) {
        console.error("Failed to fetch routes:", err);
      }
    };
    fetchRoutes();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [selectedRouteId, year, month]);

  const openBatchModal = () => {
    if (selectedRouteId && routes.length > 0) {
      const activeRoute = routes.find(r => r.propertyId === selectedRouteId);
      if (activeRoute) {
        const parts = activeRoute.name.split(/➡️|[- >]+/);
        if (parts.length >= 2) {
          const departure = parts[0].trim();
          const arrival = parts[1].trim();
          setBatchForm(prev => ({
            ...prev,
            departureAirport: departure,
            arrivalAirport: arrival
          }));
        }
      }
    }
    setIsBatchOpen(true);
  };

  const handle_batch_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (batchForm.departureAirport === batchForm.arrivalAirport) {
      addToast("출발 공항과 도착 공항은 같을 수 없습니다.", "warning");
      return;
    }
    const todayStr = getTodayString();
    if (batchForm.startDate < todayStr) {
      addToast("시작일은 오늘 이후여야 합니다.", "warning");
      return;
    }
    if (batchForm.endDate < batchForm.startDate) {
      addToast("종료일은 시작일보다 빠를 수 없습니다.", "warning");
      return;
    }
    try {
      addToast("신규 정기 스케줄 배치를 일괄 등록 신청 중입니다...", "info");
      const res = await seller_register_flights_batch_api(batchForm);
      if (res.success) {
        addToast("정기 항공편 스케줄이 PENDING_APPROVAL 상태로 일괄 신청 완료되었습니다.", "success");
        setIsBatchOpen(false);
        fetchSchedules();
      }
    } catch (err: unknown) {
      addToast(extractApiErrorMessage(err, '스케줄 일괄 등록 도중 오류가 발생했습니다.'), 'warning');
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
    } catch (err: unknown) {
      addToast(extractApiErrorMessage(err, '가격/좌석 변경 제어 권한 검증에 실패했습니다.'), 'warning');
    }
  };

  const filteredSchedules = schedules;

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
          onClick={openBatchModal}
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
              <label className="form-label" style={{ fontSize: '0.75rem' }}>노선 선택</label>
              <select
                value={selectedRouteId ?? ''}
                onChange={(e) => setSelectedRouteId(e.target.value ? Number(e.target.value) : undefined)}
                className="form-input"
                style={{ width: '220px', padding: '0.5rem 0.75rem' }}
              >
                {routes.length === 0 ? (
                  <option value="">등록된 노선 없음</option>
                ) : (
                  routes.map((route) => (
                    <option key={route.propertyId} value={route.propertyId}>
                      {route.name}
                    </option>
                  ))
                )}
              </select>
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
          <div className="app-modal app-modal--wide app-modal--scrollable" style={{ width: '960px', maxWidth: '96%', maxHeight: '90vh' }} role="dialog" aria-modal="true" aria-labelledby="flight-batch-modal-title">
            <div className="app-modal__header">
              <h3 id="flight-batch-modal-title" className="app-modal__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-plane-up" style={{ color: 'var(--primary)' }}></i> 정기 스케줄 일괄 신청 등록
              </h3>
              <button type="button" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', flexShrink: 0 }} onClick={() => setIsBatchOpen(false)} aria-label="닫기">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handle_batch_submit} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
              <div className="app-modal__body">
                <div className="grid-2" style={{ marginBottom: '1.2rem' }}>
                  <div className="form-group">
                    <label className="form-label">출발 / 도착 공항 선택</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <select
                        value={batchForm.departureAirport}
                        onChange={(e) => {
                          const newDep = e.target.value;
                          setBatchForm(prev => {
                            const nextForm = { ...prev, departureAirport: newDep };
                            if (newDep === prev.arrivalAirport) {
                              const alternate = availableAirports.find(a => a !== newDep) || '';
                              nextForm.arrivalAirport = alternate;
                            }
                            return nextForm;
                          });
                        }}
                        className="form-input"
                        style={{ flex: 1, padding: '0.5rem 0.75rem' }}
                        required
                      >
                        {availableAirports.map((airport) => (
                          <option key={`dep-${airport}`} value={airport}>
                            {airport}
                          </option>
                        ))}
                      </select>
                      <i className="fa-solid fa-arrow-right" style={{ color: 'var(--text-muted)' }}></i>
                      <select
                        value={batchForm.arrivalAirport}
                        onChange={(e) => setBatchForm({ ...batchForm, arrivalAirport: e.target.value })}
                        className="form-input"
                        style={{ flex: 1, padding: '0.5rem 0.75rem' }}
                        required
                      >
                        {availableAirports
                          .filter((airport) => airport !== batchForm.departureAirport)
                          .map((airport) => (
                            <option key={`arr-${airport}`} value={airport}>
                              {airport}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">비행 편명 (Flight No.)</label>
                    <input type="text" value={batchForm.flightNumber} onChange={(e) => setBatchForm({ ...batchForm, flightNumber: e.target.value })} className="form-input" placeholder="KE-023" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">출발 / 도착 시간 (Local)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
                        <select
                          value={batchForm.departureTime.split(':')[0] || '14'}
                          onChange={(e) => {
                            const min = batchForm.departureTime.split(':')[1] || '30';
                            setBatchForm({ ...batchForm, departureTime: `${e.target.value}:${min}` });
                          }}
                          className="form-input"
                          style={{ padding: '0.5rem 0.75rem', flex: 1, minWidth: '70px' }}
                        >
                          {HOURS.map(h => <option key={`dep-h-${h}`} value={h}>{h}시</option>)}
                        </select>
                        <select
                          value={batchForm.departureTime.split(':')[1] || '30'}
                          onChange={(e) => {
                            const hour = batchForm.departureTime.split(':')[0] || '14';
                            setBatchForm({ ...batchForm, departureTime: `${hour}:${e.target.value}` });
                          }}
                          className="form-input"
                          style={{ padding: '0.5rem 0.75rem', flex: 1, minWidth: '70px' }}
                        >
                          {MINUTES.map(m => <option key={`dep-m-${m}`} value={m}>{m}분</option>)}
                        </select>
                      </div>

                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>~</span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
                        <select
                          value={batchForm.arrivalTime.split(':')[0] || '17'}
                          onChange={(e) => {
                            const min = batchForm.arrivalTime.split(':')[1] || '00';
                            setBatchForm({ ...batchForm, arrivalTime: `${e.target.value}:${min}` });
                          }}
                          className="form-input"
                          style={{ padding: '0.5rem 0.75rem', flex: 1, minWidth: '70px' }}
                        >
                          {HOURS.map(h => <option key={`arr-h-${h}`} value={h}>{h}시</option>)}
                        </select>
                        <select
                          value={batchForm.arrivalTime.split(':')[1] || '00'}
                          onChange={(e) => {
                            const hour = batchForm.arrivalTime.split(':')[0] || '17';
                            setBatchForm({ ...batchForm, arrivalTime: `${hour}:${e.target.value}` });
                          }}
                          className="form-input"
                          style={{ padding: '0.5rem 0.75rem', flex: 1, minWidth: '70px' }}
                        >
                          {MINUTES.map(m => <option key={`arr-m-${m}`} value={m}>{m}분</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">운항 기간 (Start ~ End)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="date"
                        value={batchForm.startDate}
                        min={getTodayString()}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          setBatchForm(prev => {
                            const nextForm = { ...prev, startDate: newStart };
                            if (prev.endDate < newStart) {
                              nextForm.endDate = newStart;
                            }
                            return nextForm;
                          });
                        }}
                        className="form-input"
                        style={{ flex: 1 }}
                        required
                      />
                      <input
                        type="date"
                        value={batchForm.endDate}
                        min={batchForm.startDate || getTodayString()}
                        onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })}
                        className="form-input"
                        style={{ flex: 1 }}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">운항 요일 선택</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {[
                        { key: 'MON', label: '월' },
                        { key: 'TUE', label: '화' },
                        { key: 'WED', label: '수' },
                        { key: 'THU', label: '목' },
                        { key: 'FRI', label: '금' },
                        { key: 'SAT', label: '토' },
                        { key: 'SUN', label: '일' },
                      ].map((day) => {
                        const isChecked = batchForm.operatingDays
                          ? batchForm.operatingDays.split(',').map((d) => d.trim()).includes(day.key)
                          : false;
                        return (
                          <label
                            key={day.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              cursor: 'pointer',
                              background: isChecked ? '#eff6ff' : '#f9fafb',
                              padding: '0.5rem 1rem',
                              borderRadius: '8px',
                              border: `1px solid ${isChecked ? '#3b82f6' : '#e5e7eb'}`,
                              fontSize: '0.875rem',
                              fontWeight: isChecked ? 700 : 500,
                              color: isChecked ? '#1e40af' : '#4b5563',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const currentDays = batchForm.operatingDays
                                  ? batchForm.operatingDays.split(',').map((d) => d.trim()).filter(Boolean)
                                  : [];
                                let nextDays: string[];
                                if (e.target.checked) {
                                  nextDays = [...currentDays, day.key];
                                } else {
                                  nextDays = currentDays.filter((d) => d !== day.key);
                                }
                                const order = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
                                nextDays.sort((a, b) => order.indexOf(a) - order.indexOf(b));
                                setBatchForm({
                                  ...batchForm,
                                  operatingDays: nextDays.join(','),
                                });
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            {day.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">클래스별 공급 좌석 및 기준가 설정</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {[
                      { key: 'economy', label: 'ECONOMY', seatsKey: 'economySeats', priceKey: 'economyPrice', color: '#eff6ff', textColor: '#1d4ed8' },
                      { key: 'business', label: 'BUSINESS', seatsKey: 'businessSeats', priceKey: 'businessPrice', color: '#eef2ff', textColor: '#4338ca' },
                      { key: 'first', label: 'FIRST CLASS', seatsKey: 'firstSeats', priceKey: 'firstPrice', color: 'var(--bg-light)', textColor: 'var(--text-dark)' },
                    ].map((cls) => (
                      <div key={cls.key} style={{ background: cls.color, padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: cls.textColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{cls.label}</span>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>공급 좌석 수</label>
                          <input type="number" value={(batchForm as any)[cls.seatsKey]} onChange={(e) => setBatchForm({ ...batchForm, [cls.seatsKey]: parseInt(e.target.value) || 0 })} className="form-input" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} placeholder="공급석" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>기준 요금 (원)</label>
                          <input type="number" value={(batchForm as any)[cls.priceKey]} onChange={(e) => setBatchForm({ ...batchForm, [cls.priceKey]: parseInt(e.target.value) || 0 })} className="form-input" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} placeholder="기준 요금" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="app-modal__footer">
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
