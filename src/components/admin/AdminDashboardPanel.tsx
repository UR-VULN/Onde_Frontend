import React from 'react';
import {
  MOCK_WEEKLY_STAYS,
  MOCK_WEEKLY_FLIGHTS,
  MOCK_DASHBOARD_METRICS,
  MOCK_DOMAIN_SHARE,
} from '@/constants/mockAdminData';
import { DAYS_OF_WEEK } from '@/constants/shared';

export const AdminDashboardPanel: React.FC = () => {

  const maxVal = Math.max(...MOCK_WEEKLY_STAYS, ...MOCK_WEEKLY_FLIGHTS);

  return (
    <div className="admin-panel">
      {/* Header Area */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            전사 거래 모니터링 종합 대시보드 <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem' }}>(SUPER_ADMIN)</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            전사 총거래액(GMV), 수수료 수익 및 매출 비중을 시각화합니다.
          </p>
        </div>
        <div>
          <span className="badge" style={{ background: '#e6f0ff', color: 'var(--primary)' }}>
            마지막 업데이트: 실시간
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <i className="fa-solid fa-chart-line"></i>
          <span className="stat-label uppercase tracking-wider">오늘 누적 거래액 (GMV)</span>
          <span className="stat-number" style={{ color: 'var(--primary)' }}>{MOCK_DASHBOARD_METRICS.gmv}</span>
          <span className="stat-trend trend-up">
            <i className="fa-solid fa-arrow-trend-up mr-1"></i> 5.2% 상승
          </span>
        </div>
        
        <div className="stat-card">
          <i className="fa-solid fa-vault"></i>
          <span className="stat-label uppercase tracking-wider">본사 수수료 순수익 (10%)</span>
          <span className="stat-number" style={{ color: '#059669' }}>{MOCK_DASHBOARD_METRICS.commission}</span>
          <span className="stat-trend font-bold text-slate-400">목표 달성율 92%</span>
        </div>

        <div className="stat-card">
          <i className="fa-solid fa-users"></i>
          <span className="stat-label uppercase tracking-wider">신규 가입자 / 미처리 신고</span>
          <span className="stat-number">{MOCK_DASHBOARD_METRICS.newUsers.toLocaleString()}명 / {MOCK_DASHBOARD_METRICS.unresolvedReports}건</span>
          <span className="stat-trend" style={{ color: 'var(--secondary)' }}>
            <i className="fa-solid fa-circle-exclamation mr-1"></i> 신고 조치 필요
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Sales Trend */}
        <div className="data-table-container" style={{ padding: '2rem' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-chart-area"></i>
            주간 매출 거래 추이 <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>(Stays vs Flights)</span>
          </h4>

          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', padding: '0 1rem', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} style={{ width: '100%', height: '1px', background: 'var(--bg-light)' }} />)}
            </div>
            <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
              {DAYS_OF_WEEK.map((day, idx) => {
                const stayH = Math.round((MOCK_WEEKLY_STAYS[idx] / maxVal) * 85);
                const flightH = Math.round((MOCK_WEEKLY_FLIGHTS[idx] / maxVal) * 85);
                return (
                  <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '160px', position: 'relative' }}>
                      <div style={{ width: '8px', background: 'var(--primary)', borderRadius: '999px', height: `${stayH}%`, position: 'absolute', left: 'calc(50% - 9px)', transition: 'all 0.7s ease' }} />
                      <div style={{ width: '8px', background: '#f87171', borderRadius: '999px', height: `${flightH}%`, position: 'absolute', left: 'calc(50% + 1px)', transition: 'all 0.7s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', paddingLeft: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <div style={{ width: '14px', height: '4px', background: 'var(--primary)', borderRadius: '999px' }}></div> 숙소
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <div style={{ width: '14px', height: '4px', background: '#f87171', borderRadius: '999px' }}></div> 항공권
            </div>
          </div>
        </div>

        {/* Domain Share */}
        <div className="data-table-container" style={{ padding: '2rem' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-chart-pie" style={{ color: '#f59e0b' }}></i>
            도메인별 매출 비중
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '300px', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'conic-gradient(#005ce6 0% 42%, #ff5a5f 42% 67%, #10b981 67% 83%, #f59e0b 83% 100%)',
                  maskImage: 'radial-gradient(transparent 60%, black 61%)',
                  WebkitMaskImage: 'radial-gradient(transparent 60%, black 61%)',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)',
                }}
              />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total GMV</p>
                <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-1px' }}>₩12.45억</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem', width: '100%' }}>
              {MOCK_DOMAIN_SHARE.map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, flexShrink: 0 }}></div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-dark)' }}>{item.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
