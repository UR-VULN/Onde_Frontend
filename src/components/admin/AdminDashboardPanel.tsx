import React, { useEffect, useState } from 'react';
import { get_admin_dashboard_api, type AdminDashboardDto } from '@/api/adminApi';
import { DAYS_OF_WEEK } from '@/constants/shared';

export const AdminDashboardPanel: React.FC = () => {
  const [dashboard, setDashboard] = useState<AdminDashboardDto | null>(null);

  useEffect(() => {
    get_admin_dashboard_api()
      .then((res) => {
        if (res.success && res.data) setDashboard(res.data);
      })
      .catch(() => undefined);
  }, []);

  const weeklyStays = dashboard?.weeklyStays ?? [0, 0, 0, 0, 0, 0, 0];
  const weeklyFlights = dashboard?.weeklyFlights ?? [0, 0, 0, 0, 0, 0, 0];
  const maxVal = Math.max(...weeklyStays, ...weeklyFlights, 1);
  const domainShare = dashboard?.domainShare ?? [];

  const formatKrw = (n: number) => `₩${n.toLocaleString('ko-KR')}`;

  return (
    <div className="admin-panel">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            전사 거래 모니터링 종합 대시보드{' '}
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem' }}>(SUPER_ADMIN)</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            전사 총거래액(GMV), 수수료 수익 및 매출 비중을 API로 조회합니다.
          </p>
        </div>
        <span className="badge" style={{ background: '#e6f0ff', color: 'var(--primary)' }}>
          마지막 업데이트: 실시간
        </span>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <i className="fa-solid fa-chart-line"></i>
          <span className="stat-label uppercase tracking-wider">오늘 누적 거래액 (GMV)</span>
          <span className="stat-number" style={{ color: 'var(--primary)' }}>
            {dashboard ? formatKrw(dashboard.gmv) : '—'}
          </span>
        </div>
        <div className="stat-card">
          <i className="fa-solid fa-vault"></i>
          <span className="stat-label uppercase tracking-wider">본사 수수료 순수익 (10%)</span>
          <span className="stat-number" style={{ color: '#059669' }}>
            {dashboard ? formatKrw(dashboard.commission) : '—'}
          </span>
        </div>
        <div className="stat-card">
          <i className="fa-solid fa-users"></i>
          <span className="stat-label uppercase tracking-wider">신규 가입자 / 미처리 신고</span>
          <span className="stat-number">
            {dashboard ? `${dashboard.newUsers.toLocaleString()}명 / ${dashboard.unresolvedReports}건` : '—'}
          </span>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="data-table-container" style={{ padding: '2rem' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
            <i className="fa-solid fa-chart-area"></i> 주간 매출 거래 추이
          </h4>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', padding: '0 1rem' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
              {DAYS_OF_WEEK.map((day, idx) => {
                const stayH = Math.round((weeklyStays[idx] / maxVal) * 85);
                const flightH = Math.round((weeklyFlights[idx] / maxVal) * 85);
                return (
                  <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '160px' }}>
                      <div style={{ width: 8, background: 'var(--primary)', borderRadius: 999, height: `${stayH}%`, marginRight: 4 }} />
                      <div style={{ width: 8, background: '#f87171', borderRadius: 999, height: `${flightH}%` }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="data-table-container" style={{ padding: '2rem' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
            <i className="fa-solid fa-chart-pie" style={{ color: '#f59e0b' }}></i> 도메인별 매출 비중
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {domainShare.map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{item.label}</span>
                <span style={{ fontWeight: 800 }}>{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
