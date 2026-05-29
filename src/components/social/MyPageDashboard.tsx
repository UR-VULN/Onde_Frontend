import React, { useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { fetch_member_profile_api, fetch_member_mileage_history_api } from '@/api/userApi';
import type { MileageLogDto } from '@/api/userApi';
import { fetch_my_reservations_api, mapReservationDtoToMyPage } from '@/api/reservationsApi';

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
    setReservations,
    cancelReservation,
    logout,
    addToast,
    openConfirmPopup,
  } = useTravelStore();

  const [activeFilter, setActiveFilter] = useState<ReservationFilter>('all');
  const [mileageLogs, setMileageLogs] = useState<MileageLogDto[]>([]);

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

    Promise.all([
      fetch_member_profile_api(),
      fetch_my_reservations_api(),
      fetch_member_mileage_history_api(0, 5),
    ])
      .then(([profileRes, reservationsRes, historyRes]) => {
        if (cancelled) return;
        if (profileRes.success && profileRes.data) {
          setMemberProfile(profileRes.data);
        }
        if (reservationsRes.success && reservationsRes.data?.reservations) {
          setReservations(reservationsRes.data.reservations.map(mapReservationDtoToMyPage));
        }
        if (historyRes.success && historyRes.data?.logs) {
          setMileageLogs(historyRes.data.logs);
        }
      })
      .catch(() => {
        /* API 미연동 시 로그인 시점 스토어 값 유지 */
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, setMemberProfile, setReservations]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="mypage-dashboard page-hero-gap">
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
              {mileageLogs.length > 0 && (
                <ul className="mypage-mileage-history" style={{ marginTop: '0.75rem', fontSize: '0.72rem' }}>
                  {mileageLogs.map((log) => (
                    <li key={log.logId} style={{ marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                      {log.description}{' '}
                      <strong style={{ color: log.logType === 'USE' ? 'var(--secondary)' : '#059669' }}>
                        {log.logType === 'USE' ? '-' : '+'}
                        {log.amount.toLocaleString()} P
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
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
