import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlightStore } from '@/store/useFlightStore';
import type { FlightDto, AvailableSeat } from '@/store/useFlightStore';
import { useTravelStore } from '@/store/useTravelStore';
import { book_flight_reservation_api } from '@/api/flightApi';
import { buildPaymentCheckout } from '@/utils/paymentCheckout';

interface FlightReservationModalProps {
  flight: FlightDto | null;
  seat: AvailableSeat | null;
  onClose: () => void;
}

export const FlightReservationModal: React.FC<FlightReservationModalProps> = ({ flight, seat, onClose }) => {
  const navigate = useNavigate();
  const { flight_search_results } = useFlightStore();
  const { addToast, isLoggedIn, openAuthModal } = useTravelStore();

  const passengerCount = flight_search_results?.passengerCount || 1;
  const [passengers, setPassengers] = useState<Array<{ name: string; passportNumber: string; birthdate: string }>>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (passengerCount > 0) {
      setPassengers(
        Array.from({ length: passengerCount }, () => ({
          name: '',
          passportNumber: '',
          birthdate: '',
        }))
      );
    }
  }, [passengerCount]);

  if (!flight || !seat) return null;

  const handle_passenger_change = (index: number, field: string, value: string) => {
    const next = [...passengers];
    next[index] = { ...next[index], [field]: value };
    setPassengers(next);
  };

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      addToast('로그인 후 항공권을 예약하실 수 있습니다.', 'warning');
      openAuthModal('login');
      return;
    }

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name.trim() || !p.passportNumber.trim() || !p.birthdate) {
        addToast('모든 탑승객의 정보(영문명, 여권번호, 생년월일)를 입력해 주세요.', 'warning');
        return;
      }
    }

    setSubmitting(true);
    try {
      addToast('항공권 예약을 요청 중입니다...', 'info');
      const res = await book_flight_reservation_api({
        scheduleId: flight.scheduleId,
        seatClass: seat.classType,
        passengers,
      });

      if (!res.success || !res.data) {
        addToast(res.message || '항공 예약에 실패했습니다.', 'warning');
        return;
      }

      const totalPrice = res.data.totalPrice ?? seat.basePrice * passengerCount;
      onClose();
      navigate('/payment', {
        state: buildPaymentCheckout({
          reservationType: 'FLIGHT',
          reservationId: res.data.reservationId,
          productTitle: `${res.data.flightNumber ?? flight.flightNumber} (${seat.classType})`,
          productSubtitle: `${flight.departureAirport} → ${flight.arrivalAirport}`,
          categoryLabel: '항공권',
          categoryIcon: 'fa-plane',
          totalAmount: totalPrice,
          usedMileage: 0,
          dateSummary: `탑승객 ${passengerCount}명`,
          detailLines: [`₩${seat.basePrice.toLocaleString()} × ${passengerCount}명`],
          returnPath: '/flight',
        }),
      });
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (err as { error?: { message?: string } })?.error?.message ||
        '항공 예약 중 오류가 발생했습니다.';
      addToast(msg, 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 select-none animate-[fadeIn_0.2s_ease-out]">
      <div
        className="bg-white/95 rounded-[32px] border border-slate-200/80 shadow-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto flex flex-col gap-6 animate-[scaleUp_0.25s_cubic-bezier(0.16, 1, 0.3, 1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-logo font-black text-lg text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-passport text-primary"></i> 탑승객 정보 및 예약
            </h3>
            <p className="text-[10px] text-slate-500 font-bold mt-1">
              {flight.flightNumber}편 ({flight.departureAirport} → {flight.arrivalAirport}) · {seat.classType}
            </p>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handle_submit} className="flex flex-col gap-4">
          <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
            {passengers.map((passenger, index) => (
              <div key={index} className="p-4 bg-slate-50/80 border border-slate-100 rounded-2xl flex flex-col gap-3">
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit uppercase">
                  탑승객 {index + 1}
                </span>
                <div className="form-group mb-0">
                  <label className="text-[10px] font-extrabold text-slate-700">영문 성명</label>
                  <input
                    type="text"
                    value={passenger.name}
                    onChange={(e) => handle_passenger_change(index, 'name', e.target.value)}
                    className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 bg-white focus:border-primary w-full"
                    placeholder="HONG GILDONG"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group mb-0">
                    <label className="text-[10px] font-extrabold text-slate-700">여권번호</label>
                    <input
                      type="text"
                      value={passenger.passportNumber}
                      onChange={(e) => handle_passenger_change(index, 'passportNumber', e.target.value)}
                      className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 bg-white focus:border-primary w-full"
                      required
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="text-[10px] font-extrabold text-slate-700">생년월일</label>
                    <input
                      type="date"
                      value={passenger.birthdate}
                      onChange={(e) => handle_passenger_change(index, 'birthdate', e.target.value)}
                      className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 bg-white focus:border-primary w-full"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">결제 예정 금액</span>
              <strong className="text-lg font-black text-secondary">
                ₩{(seat.basePrice * passengerCount).toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <button type="button" className="btn-secondary text-xs py-2 px-5" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-primary text-xs py-2 px-5" disabled={submitting}>
              {submitting ? '예약 중...' : '예약 후 결제하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
