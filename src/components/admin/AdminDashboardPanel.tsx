import React, { useEffect, useState } from 'react';
import { get_admin_dashboard_api, type AdminDashboardDto } from '@/api/adminApi';
import { useTravelStore } from '@/store/useTravelStore';
import { isSellerAdmin, isUserAdmin } from '@/utils/adminPermissions';

const DOMAIN_LABELS: Record<string, string> = {
  flight: '항공',
  accommodation: '숙소',
  car: '렌터카',
  insurance: '보험',
};

export const AdminDashboardPanel: React.FC = () => {
  const { memberRole } = useTravelStore();
  const [dashboard, setDashboard] = useState<AdminDashboardDto | null>(null);

  useEffect(() => {
    get_admin_dashboard_api()
      .then((res) => {
        if (res.success && res.data) setDashboard(res.data);
      })
      .catch(() => undefined);
  }, []);

  const domainShare = dashboard?.domainShare ?? [];
  const byDomain = dashboard?.byDomain ?? {};
  const domainEntries = Object.entries(byDomain).filter(([, v]) => v > 0);
  const maxDomainVal = Math.max(...domainEntries.map(([, v]) => v), 1);

  const formatKrw = (n: number) => `₩${n.toLocaleString('ko-KR')}`;
  const isUserOpsDashboard = isUserAdmin(memberRole);
  const roleLabel = isUserOpsDashboard
    ? 'USER_ADMIN'
    : isSellerAdmin(memberRole)
      ? 'SELLER_ADMIN'
      : 'SUPER_ADMIN';
  const title = isUserOpsDashboard
    ? '운영/CS 지표 대시보드'
    : isSellerAdmin(memberRole)
      ? '매출/입점 지표 대시보드'
      : '전사 매출/운영 지표 대시보드';
  const description = isUserOpsDashboard
    ? '신규 가입, 커뮤니티 피드, 마커 검증, CS 대기 지표를 표시합니다.'
    : 'summary API와 도메인별 매출 차트를 조합해 전사 매출과 입점 지표를 표시합니다.';

  return (
    <div className="admin-panel">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            {title}{' '}
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem' }}>({roleLabel})</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {description}
          </p>
        </div>
        <span className="badge" style={{ background: '#e6f0ff', color: 'var(--primary)' }}>
          마지막 업데이트: 실시간
        </span>
      </div>

      {isUserOpsDashboard ? (
        <div className="dashboard-grid">
          <div className="stat-card">
            <i className="fa-solid fa-user-plus"></i>
            <span className="stat-label uppercase tracking-wider">오늘 신규 가입</span>
            <span className="stat-number" style={{ color: 'var(--primary)' }}>
              {dashboard ? `${dashboard.newMembersToday.toLocaleString()}명` : '—'}
            </span>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-comments"></i>
            <span className="stat-label uppercase tracking-wider">커뮤니티 피드 현황</span>
            <span className="stat-number" style={{ color: '#059669' }}>
              {dashboard
                ? `${dashboard.activePostCount.toLocaleString()}건 / ${dashboard.blindedPosts}건`
                : '—'}
            </span>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-location-dot"></i>
            <span className="stat-label uppercase tracking-wider">미검증 마커/매물</span>
            <span className="stat-number">
              {dashboard ? `${dashboard.unverifiedProperties.toLocaleString()}건` : '—'}
            </span>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-headset"></i>
            <span className="stat-label uppercase tracking-wider">미해결 CS 티켓</span>
            <span className="stat-number">
              {dashboard ? `${dashboard.pendingCSTickets.toLocaleString()}건` : '—'}
            </span>
          </div>
        </div>
      ) : (
        <div className="dashboard-grid">
          <div className="stat-card">
            <i className="fa-solid fa-chart-line"></i>
            <span className="stat-label uppercase tracking-wider">월간 총매출 (GMV)</span>
            <span className="stat-number" style={{ color: 'var(--primary)' }}>
              {dashboard ? formatKrw(dashboard.gmv) : '—'}
            </span>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-receipt"></i>
            <span className="stat-label uppercase tracking-wider">월간 총 예약 건수</span>
            <span className="stat-number" style={{ color: '#059669' }}>
              {dashboard ? `${dashboard.totalBookings.toLocaleString()}건` : '—'}
            </span>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-store"></i>
            <span className="stat-label uppercase tracking-wider">입점/커뮤니티 현황</span>
            <span className="stat-number">
              {dashboard
                ? `${dashboard.newMembersToday.toLocaleString()}명 / ${dashboard.blindedPosts}건`
                : '—'}
            </span>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-clock"></i>
            <span className="stat-label uppercase tracking-wider">정산 대기 건수</span>
            <span className="stat-number">
              {dashboard ? `${dashboard.pendingSettlements.toLocaleString()}건` : '—'}
            </span>
          </div>
        </div>
      )}

      {!isUserOpsDashboard && (
      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="data-table-container" style={{ padding: '2rem' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
            <i className="fa-solid fa-chart-area"></i> 도메인별 월간 매출
          </h4>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', padding: '0 1rem' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
              {domainEntries.length > 0 ? (
                domainEntries.map(([key, amount]) => {
                  const h = Math.round((amount / maxDomainVal) * 85);
                  return (
                    <div
                      key={key}
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '160px' }}>
                        <div
                          style={{
                            width: 24,
                            background: 'var(--primary)',
                            borderRadius: 999,
                            height: `${h}%`,
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                        {DOMAIN_LABELS[key] ?? key}
                      </span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                        {formatKrw(amount)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)', paddingTop: '4rem' }}>
                  매출 데이터가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="data-table-container" style={{ padding: '2rem' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
            <i className="fa-solid fa-chart-pie" style={{ color: '#f59e0b' }}></i> 도메인별 매출 비중
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {domainShare.length > 0 ? (
              domainShare.map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{item.label}</span>
                  <span style={{ fontWeight: 800 }}>{item.pct}%</span>
                </div>
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>차트 데이터 없음</span>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
