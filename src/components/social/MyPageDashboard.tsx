import React, { useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { fetch_member_profile_api, fetch_member_mileage_history_api, fetch_member_me_api } from '@/api/userApi';
import type { MileageLogDto } from '@/api/userApi';
import { fetch_my_reservations_api, mapReservationDtoToMyPage, cancel_member_reservation_api } from '@/api/reservationsApi';
import { performLogout } from '@/utils/authSession';
import { WalletPanel } from '@/components/common/WalletPanel';
import { ProfileEditForm } from './ProfileEditForm';
import { RevealableMaskedText } from '@/components/common/RevealableMaskedText';
import { useMemberProfileReveal } from '@/hooks/useMemberProfileReveal';
import { maskEmail, maskName } from '@/utils/personalDataMask';
import { extractApiErrorMessage } from '@/utils/apiResponse';

type ReservationFilter = 'all' | 'stay' | 'flight' | 'car' | 'ins';

const FILTER_TABS: { id: ReservationFilter; label: string }[] = [
  { id: 'all', label: '전체보기' },
  { id: 'stay', label: '🏡 숙소' },
  { id: 'flight', label: '✈️ 항공권' },
  { id: 'car', label: '🚗 렌터카' },
  { id: 'ins', label: '🛡️ 여행자 보험' },
];

function getAccountEmail(username: string): string {
  if (!username) return 'user@example.com';
  if (username.includes('@')) return username;
  return `${username.toLowerCase()}@example.com`;
}

export const MyPageDashboard: React.FC = () => {
  const {
    reservations,
    username,
    name,
    nickname,
    mileage,
    membershipGrade,
    isLoggedIn,
    setMemberProfile,
    setReservations,
    cancelReservation,
    addToast,
    openConfirmPopup,
  } = useTravelStore();

  const [activeFilter, setActiveFilter] = useState<ReservationFilter>('all');
  const [mileageLogs, setMileageLogs] = useState<MileageLogDto[]>([]);
  const [maskedProfileEmail, setMaskedProfileEmail] = useState('');
  const [maskedProfileName, setMaskedProfileName] = useState('');
  const { revealField } = useMemberProfileReveal();

  const filteredReservations = reservations.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.category === activeFilter;
  });

  const [isProfileEditMode, setIsProfileEditMode] = useState(false);

  const fallbackMaskedEmail = maskEmail(getAccountEmail(username));
  const displayMaskedEmail = maskedProfileEmail || fallbackMaskedEmail;
  const greetingLabel = nickname ? (
    nickname
  ) : maskedProfileName ? (
    <RevealableMaskedText
      maskedValue={maskedProfileName}
      getPlaintext={(password) => revealField('name', password)}
    />
  ) : name ? (
    <RevealableMaskedText
      maskedValue={maskName(name)}
      getPlaintext={(password) => revealField('name', password)}
    />
  ) : (
    <RevealableMaskedText
      maskedValue={displayMaskedEmail}
      getPlaintext={(password) => revealField('email', password)}
    />
  );
  const showGoldCrown = membershipGrade.toUpperCase().includes('GOLD');

  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;

    Promise.all([
      fetch_member_profile_api(),
      fetch_member_me_api(),
      fetch_my_reservations_api(),
      fetch_member_mileage_history_api(0, 5),
    ])
      .then(([profileRes, meRes, reservationsRes, historyRes]) => {
        if (cancelled) return;
        if (profileRes.success && profileRes.data) {
          setMemberProfile(profileRes.data);
        }
        if (meRes.success && meRes.data) {
          setMaskedProfileEmail(meRes.data.email);
          setMaskedProfileName(meRes.data.name || '');
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
                {greetingLabel}
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
                <span className="mypage-contact-value">
                  <RevealableMaskedText
                    maskedValue={displayMaskedEmail}
                    getPlaintext={(password) => revealField('email', password)}
                  />
                </span>
              </div>
            </div>

            {/* 프로필 관리 버튼 추가 */}
            <div style={{ marginTop: '-0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsProfileEditMode(!isProfileEditMode)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: isProfileEditMode ? 'var(--primary)' : 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: isProfileEditMode ? 'white' : 'var(--text-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isProfileEditMode ? '0 4px 12px rgba(0, 92, 230, 0.2)' : 'none'
                }}
              >
                <i className={`fa-solid ${isProfileEditMode ? 'fa-user-check' : 'fa-user-pen'}`}></i>
                {isProfileEditMode ? '대시보드 보기' : '프로필 관리'}
              </button>
            </div>

            <div className="mypage-sidebar-actions">
              <button
                type="button"
                className="btn-secondary logout-btn"
                onClick={() => {
                  void performLogout({ redirectTo: '/' }).then(() => {
                    addToast('안전하게 로그아웃되었습니다.', 'info');
                  });
                }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i> 로그아웃
              </button>
            </div>
          </aside>

          <section className="mypage-main">
            {isProfileEditMode ? (
              <ProfileEditForm onCancel={() => setIsProfileEditMode(false)} />
            ) : (
              <>
                <WalletPanel />

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
                    filteredReservations.map((reservationItem) => (
                      <article key={`${reservationItem.category}-${reservationItem.id}`} className="mp-card">
                        <div className={`mp-card-icon ${reservationItem.category}`}>
                          {reservationItem.category === 'flight' && <i className="fa-solid fa-plane"></i>}
                          {reservationItem.category === 'ins' && <i className="fa-solid fa-shield-halved"></i>}
                          {reservationItem.category === 'car' && <i className="fa-solid fa-car"></i>}
                          {reservationItem.category === 'stay' && <i className="fa-solid fa-hotel"></i>}
                        </div>
                        <div className="mp-card-body">
                          <div className="mp-card-head">
                            <strong className="mp-card-title">{reservationItem.title}</strong>
                          </div>
                          <p className="mp-card-line">
                            <i className="fa-regular fa-calendar-check" style={{ marginRight: '0.25rem' }}></i>
                            일정: <strong>{reservationItem.date}</strong>
                          </p>
                          <p className="mp-card-line-muted">{reservationItem.details}</p>
                        </div>
                        <div className="mp-card-footer">
                          <span className={`mp-badge ${reservationItem.badgeType}`}>{reservationItem.badge}</span>
                          <strong className="mp-card-price">{reservationItem.price}</strong>
                          <button
                            type="button"
                            className="mp-card-cancel"
                            onClick={() => {
                              openConfirmPopup(async (choice) => {
                                if (!choice) return;
                                try {
                                  const cancelRes = await cancel_member_reservation_api(
                                    Number(reservationItem.id),
                                    reservationItem.category
                                  );
                                  if (cancelRes.success) {
                                    cancelReservation(reservationItem.id);
                                    addToast('예약 취소 처리가 완료되었습니다.', 'info');
                                  } else {
                                    addToast(cancelRes.message || '예약 취소에 실패했습니다.', 'warning');
                                  }
                                } catch {
                                  addToast('예약 취소 중 오류가 발생했습니다.', 'warning');
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

                {/* 📄 통합 정산서 스마트 발급 위젯 (커스텀 영수증 출력용) */}
                <div className="report-issuance-card" style={{
                  marginTop: '3.5rem',
                  padding: '2.25rem',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#eff6ff',
                        color: '#3b82f6'
                      }}>
                        <i className="fa-solid fa-file-invoice-dollar" style={{ fontSize: '1.2rem' }}></i>
                      </span>
                      <div>
                        <h4 style={{ color: '#1e293b', margin: 0, fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '-0.025em' }}>
                          통합 정산서 스마트 발급 서비스
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ONDE Smart Receipt & Report Service</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.75rem', lineHeight: '1.5', letterSpacing: '-0.01em' }}>
                    귀하의 실시간 예약 내역(항공사, 숙소, 렌터카, 여행자 보험) 정보를 하나로 취합하여 깔끔한 명세서 리포트 PDF를 발행합니다. 
                    원하시는 발급 양식을 아래에서 선택한 후 다운로드해 주세요.
                  </p>

                  <div style={{ display: 'grid', gap: '1.25rem', fontSize: '0.85rem' }}>
                    {/* 양식 선택 */}
                    <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', marginBottom: '0.5rem', color: '#334155' }}>
                        <i className="fa-solid fa-file-signature" style={{ color: '#64748b' }}></i>
                        정산서 발급 구분 선택
                      </label>
                      <select
                        id="reportTemplate"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.8rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          background: '#f8fafc',
                          fontSize: '0.85rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="verification">확인서용 양식</option>
                        <option value="business">비즈니스용 양식</option>
                      </select>
                    </div>

                    {/* PDF 생성 및 다운로드 버튼 */}
                    <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                      <button
                        onClick={async () => {
                          const templateVal = (document.getElementById('reportTemplate') as HTMLSelectElement)?.value || 'verification';

                          try {
                            const response = await fetch('/user-api/api/v1/report/integrated', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({
                                template: templateVal
                              })
                            });

                            if (response.ok) {
                              const blob = await response.blob();
                              const downloadUrl = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = downloadUrl;
                              a.download = 'onde_settlement_report.pdf';
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              addToast('통합 정산서 PDF가 성공적으로 발급되었습니다.', 'success');
                            } else {
                              addToast('정산서 발급 과정 중 서버 내부 오류가 발생했습니다.', 'warning');
                            }
                          } catch (err: unknown) {
                            addToast(
                              extractApiErrorMessage(err, '정산서 발급 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'),
                              'warning',
                            );
                          }
                        }}
                        style={{
                          padding: '0.75rem 1.75rem',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '700',
                          fontSize: '0.9rem',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                          transition: 'all 0.2s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                        }}
                      >
                        <i className="fa-solid fa-file-pdf"></i>
                        통합 정산서 PDF 다운로드
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
