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

export const SellerSchedulePanel: React.FC = () => {
  const { addToast } = useTravelStore();

  const [origin, setOrigin] = useState('ICN');
  const [dest, setDest] = useState('NRT');
  const [year] = useState(2026);
  const [month, setMonth] = useState(5);
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
      const res = await seller_get_calendar_schedules_api({ origin, dest, year, month });
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
        remainingSeats: remainingSeats ? parseInt(remainingSeats) : undefined,
        overridePrice: overridePrice ? parseFloat(overridePrice) : undefined
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

  // Generate calendar days for 2026-05
  // May 1st, 2026 is Friday (5)
  const renderCalendarCells = () => {
    const daysInMonth = 31;
    const startDayOffset = 5; // Friday
    const cells: React.ReactNode[] = [];

    // Empty offset cells
    for (let i = 0; i < startDayOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="bg-slate-50/50 min-h-[90px] border-r border-b border-slate-100"></div>);
    }

    // Days cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `2026-05-${day.toString().padStart(2, '0')}`;
      const daySchedules = schedules.filter(s => s.departureTime.startsWith(dateStr));

      cells.push(
        <div key={day} className="bg-white min-h-[95px] p-2 border-r border-b border-slate-200 flex flex-col justify-between hover:bg-slate-50/40 transition-all group">
          <span className="font-bold text-[11px] text-slate-700 block group-hover:text-primary transition-colors">{day}</span>
          
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[70px] pr-0.5 scrollbar-thin">
            {daySchedules.length > 0 ? (
              daySchedules.map((schedule) => {
                const is_closed = schedule.remainingSeats === 0;
                return (
                  <div
                    key={schedule.scheduleId}
                    className={`text-[9px] p-1 rounded font-bold cursor-pointer transition-all ${
                      is_closed
                        ? 'bg-rose-50 text-secondary border border-rose-100 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                    }`}
                    onClick={() => {
                      setSelectedCell(schedule);
                      setOverridePrice(schedule.basePrice.toString());
                      setRemainingSeats(schedule.remainingSeats.toString());
                      setIsOverrideOpen(true);
                    }}
                  >
                    <div className="flex justify-between items-center gap-1">
                      <span>{schedule.flightNumber} ({schedule.classType[0]})</span>
                      {is_closed ? (
                        <span className="text-[8px] bg-rose-200 px-1 rounded">마감</span>
                      ) : (
                        <span>{schedule.remainingSeats}석</span>
                      )}
                    </div>
                    <div className="text-right text-[8px] opacity-90 mt-0.5">
                      ₩{(schedule.basePrice / 1000).toFixed(0)}k
                    </div>
                  </div>
                );
              })
            ) : (
              <span className="text-[9px] text-slate-300 font-bold block py-2 text-center">운항 없음</span>
            )}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="admin-panel animate-[fadeIn_0.35s_ease]">
      {/* Title & Batch trigger button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-logo font-black text-xl text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-clock text-primary"></i> 노선별 요율 & 스케줄 제어 Extranet
          </h2>
          <p className="text-[10px] text-slate-500 font-bold mt-1">
            신규 정기 스케줄 일괄 배치 등록을 신청하고, 달력 기반으로 실시간 가격과 좌석 재고를 제어합니다.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary text-xs py-2 px-5 flex items-center gap-2"
          onClick={() => setIsBatchOpen(true)}
        >
          <i className="fa-solid fa-plane-up"></i> 정기 스케줄 일괄 등록
        </button>
      </div>

      {/* Filter and Calendar Grid */}
      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-md p-6 flex flex-col gap-6">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex flex-col gap-1 w-40">
            <label className="text-[9px] font-bold text-slate-400">출발지 (Origin)</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              className="border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
            />
          </div>
          <div className="flex flex-col gap-1 w-40">
            <label className="text-[9px] font-bold text-slate-400">목적지 (Destination)</label>
            <input
              type="text"
              value={dest}
              onChange={(e) => setDest(e.target.value.toUpperCase())}
              className="border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
            />
          </div>
          <div className="flex flex-col gap-1 w-40">
            <label className="text-[9px] font-bold text-slate-400">조회 월 (Month)</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 cursor-pointer"
            >
              <option value="5">2026년 5월</option>
              <option value="6">2026년 6월</option>
            </select>
          </div>
        </div>

        {/* Real-time calendar grid */}
        <div className="border border-slate-200/80 rounded-[20px] overflow-hidden shadow-inner">
          <div className="grid grid-cols-7 text-center font-black text-xs bg-slate-50 border-b border-slate-200 py-3 text-slate-500">
            <span className="text-secondary">일</span>
            <span>월</span>
            <span>화</span>
            <span>수</span>
            <span>목</span>
            <span>금</span>
            <span className="text-primary">토</span>
          </div>
          <div className="grid grid-cols-7 min-h-[450px]">
            {renderCalendarCells()}
          </div>
        </div>
      </div>

      {/* Batch Register Modal */}
      {isBatchOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto flex flex-col gap-6 animate-[scaleUp_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-logo font-black text-lg text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-plane-up text-primary"></i> 항공 정기 스케줄 일괄 배치 신청 등록
              </h3>
              <button
                type="button"
                className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400"
                onClick={() => setIsBatchOpen(false)}
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handle_batch_submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label className="text-[10px] font-bold text-slate-700">출발 공항 IATA (Departure)</label>
                <input
                  type="text"
                  value={batchForm.departureAirport}
                  onChange={(e) => setBatchForm({ ...batchForm, departureAirport: e.target.value.toUpperCase() })}
                  className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold w-full"
                  required
                />
              </div>
              <div className="form-group mb-0">
                <label className="text-[10px] font-bold text-slate-700">도착 공항 IATA (Arrival)</label>
                <input
                  type="text"
                  value={batchForm.arrivalAirport}
                  onChange={(e) => setBatchForm({ ...batchForm, arrivalAirport: e.target.value.toUpperCase() })}
                  className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold w-full"
                  required
                />
              </div>
              <div className="form-group mb-0">
                <label className="text-[10px] font-bold text-slate-700">편명 (Flight Number)</label>
                <input
                  type="text"
                  value={batchForm.flightNumber}
                  onChange={(e) => setBatchForm({ ...batchForm, flightNumber: e.target.value })}
                  className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold w-full"
                  required
                />
              </div>
              <div className="form-group mb-0">
                <label className="text-[10px] font-bold text-slate-700">비행 거리 (Distance KM)</label>
                <input
                  type="number"
                  value={batchForm.distanceKm}
                  onChange={(e) => setBatchForm({ ...batchForm, distanceKm: parseInt(e.target.value) })}
                  className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold w-full"
                  required
                />
              </div>
              <div className="form-group mb-0">
                <label className="text-[10px] font-bold text-slate-700">출발 시간 (Departure Time)</label>
                <input
                  type="text"
                  value={batchForm.departureTime}
                  onChange={(e) => setBatchForm({ ...batchForm, departureTime: e.target.value })}
                  className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold w-full"
                  placeholder="14:30"
                  required
                />
              </div>
              <div className="form-group mb-0">
                <label className="text-[10px] font-bold text-slate-700">도착 시간 (Arrival Time)</label>
                <input
                  type="text"
                  value={batchForm.arrivalTime}
                  onChange={(e) => setBatchForm({ ...batchForm, arrivalTime: e.target.value })}
                  className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold w-full"
                  placeholder="17:00"
                  required
                />
              </div>
              <div className="form-group mb-0">
                <label className="text-[10px] font-bold text-slate-700">시작 범위 (Start Date)</label>
                <input
                  type="date"
                  value={batchForm.startDate}
                  onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                  className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold w-full"
                  required
                />
              </div>
              <div className="form-group mb-0">
                <label className="text-[10px] font-bold text-slate-700">종료 범위 (End Date)</label>
                <input
                  type="date"
                  value={batchForm.endDate}
                  onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })}
                  className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold w-full"
                  required
                />
              </div>
              <div className="form-group mb-0 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-700">운항 요일 (Days, 콤마 구분)</label>
                <input
                  type="text"
                  value={batchForm.operatingDays}
                  onChange={(e) => setBatchForm({ ...batchForm, operatingDays: e.target.value })}
                  className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold w-full"
                  placeholder="MON,WED,FRI"
                  required
                />
              </div>

              {/* Capacities & Prices */}
              <div className="md:col-span-2 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 mt-2">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col gap-2">
                  <span className="text-[9px] font-black text-primary">ECONOMY</span>
                  <input
                    type="number"
                    value={batchForm.economySeats}
                    onChange={(e) => setBatchForm({ ...batchForm, economySeats: parseInt(e.target.value) })}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold w-full"
                    placeholder="석 수"
                  />
                  <input
                    type="number"
                    value={batchForm.economyPrice}
                    onChange={(e) => setBatchForm({ ...batchForm, economyPrice: parseInt(e.target.value) })}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold w-full"
                    placeholder="요금 원"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col gap-2">
                  <span className="text-[9px] font-black text-secondary">BUSINESS</span>
                  <input
                    type="number"
                    value={batchForm.businessSeats}
                    onChange={(e) => setBatchForm({ ...batchForm, businessSeats: parseInt(e.target.value) })}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold w-full"
                    placeholder="석 수"
                  />
                  <input
                    type="number"
                    value={batchForm.businessPrice}
                    onChange={(e) => setBatchForm({ ...batchForm, businessPrice: parseInt(e.target.value) })}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold w-full"
                    placeholder="요금 원"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col gap-2">
                  <span className="text-[9px] font-black text-slate-800">FIRST CLASS</span>
                  <input
                    type="number"
                    value={batchForm.firstSeats}
                    onChange={(e) => setBatchForm({ ...batchForm, firstSeats: parseInt(e.target.value) })}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold w-full"
                    placeholder="석 수"
                  />
                  <input
                    type="number"
                    value={batchForm.firstPrice}
                    onChange={(e) => setBatchForm({ ...batchForm, firstPrice: parseInt(e.target.value) })}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold w-full"
                    placeholder="요금 원"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex gap-3 justify-end mt-4 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  className="btn-secondary text-xs py-2 px-5"
                  onClick={() => setIsBatchOpen(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-5"
                >
                  배치 심사 신청 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Override control cell Modal */}
      {isOverrideOpen && selectedCell && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl w-full max-w-sm p-6 flex flex-col gap-6 animate-[scaleUp_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-logo font-black text-md text-slate-800">
                ⚙️ {selectedCell.flightNumber} ({selectedCell.classType}) 제어
              </h3>
              <button
                type="button"
                className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400"
                onClick={() => setIsOverrideOpen(false)}
              >
                <i className="fa-solid fa-xmark text-md"></i>
              </button>
            </div>

            <form onSubmit={handle_override_submit} className="flex flex-col gap-4">
              <div className="form-group mb-0">
                <label className="text-[10px] font-bold text-slate-700">남은 잔여 좌석 수량 조절</label>
                <input
                  type="number"
                  value={remainingSeats}
                  onChange={(e) => setRemainingSeats(e.target.value)}
                  className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold w-full bg-white"
                  placeholder="수정할 석 수"
                />
                <span className="text-[8px] text-slate-400 block mt-1">※ 이미 확정(Confirmed) 완료된 예약수 이하로는 줄일 수 없습니다.</span>
              </div>

              <div className="form-group mb-0">
                <label className="text-[10px] font-bold text-slate-700">할증/할인 요금 오버라이드 (overridePrice)</label>
                <input
                  type="number"
                  value={overridePrice}
                  onChange={(e) => setOverridePrice(e.target.value)}
                  className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold w-full bg-white"
                  placeholder="대체할 요금 원"
                />
              </div>

              <div className="flex gap-3 justify-end mt-4 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  className="btn-secondary text-xs py-2 px-5"
                  onClick={() => setIsOverrideOpen(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-5"
                >
                  설정 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
