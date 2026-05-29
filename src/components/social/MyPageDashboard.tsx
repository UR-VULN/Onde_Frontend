import React, { useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { useFlightStore } from '@/store/useFlightStore';
import { fetch_member_profile_api } from '@/api/userApi';

type ReservationFilter = 'all' | 'stay' | 'flight' | 'car' | 'ins';

const FILTER_TABS: { id: ReservationFilter; label: string }[] = [
  { id: 'all', label: '전체보기' },
  { id: 'stay', label: '🏡 숙소' },
  { id: 'flight', label: '✈️ 항공권' },
  { id: 'car', label: '🚗 렌터카' },
  { id: 'ins', label: '🛡️ 여행자 보험' },
];

function getDisplayName(username: string): string {
  if (!username) return '사용자';
  if (username.includes('@')) {
    const local = username.split('@')[0];
    return local || username;
  }
  return username;
}

function getAccountEmail(username: string): string {
  if (!username) return 'user@example.com';
  if (username.includes('@')) return username;
  return `${username.toLowerCase()}@example.com`;
}

export const MyPageDashboard: React.FC = () => {
  const {
    reservations,
    username,
    mileage,
    membershipGrade,
    isLoggedIn,
    setMemberProfile,
    cancelReservation,
    logout,
    addToast,
    openConfirmPopup,
  } = useTravelStore();
  const { held_booking, booking_hold_time, hold_timer_active } = useFlightStore();

  const [activeFilter, setActiveFilter] = useState<ReservationFilter>('all');

  const format_time = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const filteredReservations = reservations.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.category === activeFilter;
  });

  const displayName = getDisplayName(username);
  const accountEmail = getAccountEmail(username);
  const showGoldCrown = membershipGrade.toUpperCase().includes('GOLD');

  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;

    fetch_member_profile_api()
      .then((res) => {
        if (!cancelled && res.success && res.data) {
          setMemberProfile(res.data);
        }
      })
      .catch(() => {
        /* API 미연동 시 로그인 시점 스토어 값 유지 */
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, setMemberProfile]);

  return (
    <div className="mypage-dashboard page-hero-gap">
      {hold_timer_active && held_booking && (
        <div className="mypage-hold-alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              [임시 선점 좌석 확보 중] {held_booking.flightNumber}편 ({held_booking.seatClass} 등급) -
              좌석이 {format_time(booking_hold_time)} 동안 선점 예약 확보됩니다!
            </span>
          </div>
          <button
            type="button"
            className="btn-primary"
            style={{ fontSize: '0.72rem', padding: '0.4rem 0.9rem' }}
            onClick={() => addToast('결제 페이지 연동 API 모크 결제 처리가 완료되었습니다.', 'success')}
          >
            즉시 결제하기 (₩{held_booking.totalPrice.toLocaleString()})
          </button>
        </div>
      )}

      <div className="mypage-section-header">
        <h2 className="mypage-section-title">
          <i className="fa-solid fa-circle-user" style={{ color: 'var(--primary)' }}></i>
          마이페이지 통합 대시보드
        </h2>
        <p className="mypage-section-desc">
          회원 등급 정보 및 숙소, 항공권, 렌터카, 여행자 보험의 통합 예약 현황을 실시간으로 확인하고
          제어할 수 있습니다.
        </p>
      </div>

      <div className="mypage-shell">
        <div className="mypage-banner">
          <div className="mypage-banner-inner">
            <div>
              <span className="mypage-membership-badge">ONDE MEMBERSHIP</span>
              <h3 className="mypage-greeting">
                {displayName}
                <span className="mypage-greeting-sub">님, 반갑습니다! 🌟</span>
              </h3>
            </div>
          </div>
        </div>

        <div className="mypage-body">
          <aside className="mypage-sidebar">
            <div className="mypage-membership-card">
              <div>
                <span className="mypage-field-label">현재 멤버십 등급</span>
                <strong className="mypage-grade-value">
                  {showGoldCrown && <i className="fa-solid fa-crown"></i>}
                  {membershipGrade || '—'}
                </strong>
              </div>
              <div className="mypage-mileage-divider">
                <span className="mypage-field-label">누적 마일리지</span>
                <strong className="mypage-mileage-value">{mileage.toLocaleString()} P</strong>
              </div>
            </div>

            <div className="mypage-contact-block">
              <div>
                <span className="mypage-field-label" style={{ textTransform: 'none' }}>
                  이메일 계정
                </span>
                <span className="mypage-contact-value">{accountEmail}</span>
              </div>
            </div>

            <div className="mypage-sidebar-actions">
              <button
                type="button"
                className="btn-secondary logout-btn"
                onClick={() => {
                  logout();
                  addToast('안전하게 로그아웃되었습니다.', 'info');
                }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i> 로그아웃
              </button>
            </div>
          </aside>

          <section className="mypage-main">
            <h4 className="mypage-main-title">
              <i className="fa-solid fa-list-check"></i> 실시간 예약 및 가입 현황
            </h4>
            <p className="mypage-main-desc">
              고객님께서 온데(ONDE)를 통해 신청 완료하신 실시간 숙소, 항공권, 렌터카 및 가입된 여행자
              보험의 통합 예약 목록입니다.
            </p>

            <div className="mypage-tabs">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`mp-tab-btn${activeFilter === tab.id ? ' active' : ''}`}
                  onClick={() => setActiveFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mypage-list-wrapper">
              {filteredReservations.length > 0 ? (
                filteredReservations.map((res) => (
                  <article key={res.id} className="mp-card">
                    <div className={`mp-card-icon ${res.category}`}>
                      {res.category === 'flight' && <i className="fa-solid fa-plane"></i>}
                      {res.category === 'ins' && <i className="fa-solid fa-shield-halved"></i>}
                      {res.category === 'car' && <i className="fa-solid fa-car"></i>}
                      {res.category === 'stay' && <i className="fa-solid fa-hotel"></i>}
                    </div>
                    <div className="mp-card-body">
                      <div className="mp-card-head">
                        <strong className="mp-card-title">{res.title}</strong>
                        <span className={`mp-badge ${res.badgeType}`}>{res.badge}</span>
                      </div>
                      <p className="mp-card-line">
                        <i className="fa-regular fa-calendar-check" style={{ marginRight: '0.25rem' }}></i>
                        일정: <strong>{res.date}</strong>
                      </p>
                      <p className="mp-card-line-muted">{res.details}</p>
                    </div>
                    <div className="mp-card-footer">
                      <strong className="mp-card-price">{res.price}</strong>
                      <button
                        type="button"
                        className="mp-card-cancel"
                        onClick={() => {
                          openConfirmPopup((choice) => {
                            if (choice) {
                              cancelReservation(res.id);
                              addToast('예약 취소 처리가 완료되었습니다.', 'info');
                            }
                          });
                        }}
                      >
                        취소
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="mypage-empty">등록되어 있는 가입 예약 정보가 존재하지 않습니다.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
