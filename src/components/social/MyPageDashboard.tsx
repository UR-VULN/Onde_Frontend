import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { useFlightStore } from '@/store/useFlightStore';

export const MyPageDashboard: React.FC = () => {
  const { reservations, username, mileage, cancelReservation, logout, addToast, openConfirmPopup } = useTravelStore();
  const { held_booking, booking_hold_time, hold_timer_active } = useFlightStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'stay' | 'flight' | 'car' | 'ins'>('all');

  const handle_filter_change = (filter: 'all' | 'stay' | 'flight' | 'car' | 'ins') => {
    setActiveFilter(filter);
  };

  const format_time = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const filteredReservations = reservations.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.category === activeFilter;
  });

  return (
    <div className="w-full pt-8 animate-[fadeIn_0.3s_ease]">
        {/* Real-time Held Booking Alert Countdown inside MyPage GNB GNB overlay */}
      {hold_timer_active && held_booking && (
        <div className="bg-rose-50 border border-rose-200 text-secondary p-4 rounded-[20px] mb-6 flex flex-col sm:flex-row justify-between items-center gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation text-lg"></i>
            <span className="text-xs font-black text-slate-800">
              [임시 선점 좌석 확보 중] {held_booking.flightNumber}편 ({held_booking.seatClass} 등급) - 좌석이 {format_time(booking_hold_time)} 동안 선점 예약 확보됩니다!
            </span>
          </div>
          <button
            type="button"
            className="btn-primary text-[10px] font-extrabold py-1.5 px-4 bg-secondary shadow-sm hover:bg-secondary-hover"
            onClick={() => addToast("결제 페이지 연동 API 모크 결제 처리가 완료되었습니다.", "success")}
          >
            즉시 결제하기 (₩{held_booking.totalPrice.toLocaleString()})
          </button>
        </div>
      )}

      {/* Main Header Card Layout */}
      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-md overflow-hidden flex flex-col min-h-[500px]">
        {/* Fixed Header Banner */}
        <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-end flex-wrap gap-4 border-b border-slate-800">
          <div>
            <span className="text-[9px] font-black text-primary bg-primary/20 border border-primary/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
              ONDE MEMBERSHIP
            </span>
            <h3 className="font-logo font-black text-xl text-white flex items-center gap-2">
              {username || '사용자'} <span className="text-xs font-bold text-slate-400">님, 반갑습니다! 🌟</span>
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] opacity-60 block mb-0.5">마지막 로그인</span>
            <strong className="text-xs font-bold text-slate-200">2026. 05. 26 13:30 (KST)</strong>
          </div>
        </div>

        {/* Sidebar + Reservations split columns */}
        <div className="flex flex-col lg:flex-row flex-1 bg-slate-50/40">
          {/* Left profile info */}
          <div className="w-full lg:w-72 border-r border-slate-200/80 p-6 flex flex-col gap-6 bg-slate-50 flex-shrink-0">
            {/* Membership Details */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
              <div>
                <span className="text-[9px] font-black text-slate-400 block uppercase">회원 등급</span>
                <strong className="text-sm font-black text-primary flex items-center gap-1">
                  <i className="fa-solid fa-crown text-yellow-500"></i> GOLD MEMBER
                </strong>
              </div>
              <div className="border-t border-slate-100 pt-2.5">
                <span className="text-[9px] font-black text-slate-400 block uppercase">보유 마일리지</span>
                <strong className="text-lg font-black text-secondary font-logo">
                  {mileage.toLocaleString()} P
                </strong>
              </div>
            </div>

            {/* Email info */}
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 block">이메일 계정</span>
                <strong className="text-slate-800 font-bold">{username ? `${username.toLowerCase()}@example.com` : 'user@example.com'}</strong>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 block">휴대폰 번호</span>
                <strong className="text-slate-800 font-bold">010-0000-0000</strong>
              </div>
            </div>

            {/* Logout actions */}
            <div className="lg:mt-auto pt-4 border-t border-slate-200 flex flex-col gap-2">
              <button
                type="button"
                className="btn-secondary text-[11px] py-2 w-full flex items-center justify-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-100"
                onClick={() => addToast("프로필 수정 팝업이 활성화되었습니다.", "info")}
              >
                <i className="fa-regular fa-id-card"></i> 프로필 수정
              </button>
              <button
                type="button"
                className="btn-secondary text-[11px] py-2 w-full flex items-center justify-center gap-2 border-rose-200 text-secondary hover:bg-rose-50/50"
                onClick={() => {
                  logout();
                  addToast("안전하게 로그아웃되었습니다.", "info");
                }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i> 로그아웃
              </button>
            </div>
          </div>

          {/* Right booked list */}
          <div className="flex-1 p-6 flex flex-col gap-4">
            <div>
              <h4 className="font-logo font-black text-slate-800 text-sm flex items-center gap-2">
                <i className="fa-solid fa-list-check text-primary"></i> 통합 예약 및 가입 현황
              </h4>
              <p className="text-[10px] text-slate-400 font-bold mt-1">
                온데를 통해 확보하신 실시간 숙소, 항공권, 렌터카 및 여행자 안심 보험의 통합 명단 카드입니다.
              </p>
            </div>

            {/* Filter Tabs matching custom design */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200/60">
              <button
                type="button"
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all flex-shrink-0 ${
                  activeFilter === 'all'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
                onClick={() => handle_filter_change('all')}
              >
                전체보기
              </button>
              <button
                type="button"
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all flex-shrink-0 ${
                  activeFilter === 'stay'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
                onClick={() => handle_filter_change('stay')}
              >
                🏡 숙소
              </button>
              <button
                type="button"
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all flex-shrink-0 ${
                  activeFilter === 'flight'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
                onClick={() => handle_filter_change('flight')}
              >
                ✈️ 항공권
              </button>
              <button
                type="button"
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all flex-shrink-0 ${
                  activeFilter === 'car'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
                onClick={() => handle_filter_change('car')}
              >
                🚗 렌터카
              </button>
              <button
                type="button"
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all flex-shrink-0 ${
                  activeFilter === 'ins'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
                onClick={() => handle_filter_change('ins')}
              >
                🛡️ 여행자 보험
              </button>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin mypage-list-wrapper">
              {filteredReservations.length > 0 ? (
                filteredReservations.map((res) => {
                  return (
                    <div
                      key={res.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-primary/30 transition-all flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                          res.category === 'flight' ? 'bg-primary/10 text-primary' :
                          res.category === 'ins' ? 'bg-emerald-50 text-emerald-600' :
                          res.category === 'car' ? 'bg-rose-50 text-secondary' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {res.category === 'flight' && <i className="fa-solid fa-plane"></i>}
                          {res.category === 'ins' && <i className="fa-solid fa-shield-halved"></i>}
                          {res.category === 'car' && <i className="fa-solid fa-car"></i>}
                          {res.category === 'stay' && <i className="fa-solid fa-hotel"></i>}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-xs font-black text-slate-800">{res.title}</strong>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                              res.badgeType === 'active' || res.badgeType === 'issued'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-primary/10 text-primary'
                            }`}>
                              {res.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold mt-1">
                            📅 {res.date} • {res.details}
                          </p>
                        </div>
                      </div>

                      {/* Cancel action */}
                      <div className="flex items-center gap-3">
                        <strong className="text-xs font-black text-slate-800">{res.price}</strong>
                        <button
                          type="button"
                          className="text-[10px] font-bold text-slate-400 hover:text-secondary p-1"
                          onClick={() => {
                            openConfirmPopup((choice) => {
                              if (choice) {
                                cancelReservation(res.id);
                                addToast("예약 취소 처리가 완료되었습니다.", "info");
                              }
                            });
                          }}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/60 text-slate-400 font-bold text-xs">
                  등록되어 있는 가입 예약 정보가 존재하지 않습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
