import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  request_monthly_settlement_api,
} from '@/api/sellerApi';

// ─── 목(Mock) 데이터 ───────────────────────────────
const MOCK_SETTLEMENT_HISTORY = [
  { settlementMonth: '2026-05', netAmount: 11205000, status: 'PENDING_REVIEW', requestedAt: '2026-05-31' },
  { settlementMonth: '2026-04', netAmount: 9840000, status: 'PAID', requestedAt: '2026-04-30' },
  { settlementMonth: '2026-03', netAmount: 8320000, status: 'PAID', requestedAt: '2026-03-31' },
];

const MOCK_DAILY_SALES = [420000, 680000, 520000, 890000, 760000, 1200000, 980000];
const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

export const SellerStatPanel: React.FC = () => {
  const { addToast } = useTravelStore();
  const [isRequesting, setIsRequesting] = useState(false);

  const totalSales = 12450000;
  const completedBookings = 158;
  const settlementPending = 11205000;
  const commissionRate = 0.10;
  const maxBar = Math.max(...MOCK_DAILY_SALES);

  const handle_request_settlement = async () => {
    setIsRequesting(true);
    addToast('정산 대금 지급 수동 신청을 처리 중입니다...', 'info');
    try {
      await request_monthly_settlement_api();
      addToast('정산 대금 지급 수동 신청이 완료되었습니다. 본사 정산 심사를 거쳐 지급됩니다.', 'success');
    } catch {
      addToast('[데모] 월말 정산 신청이 완료되었습니다. 본사 심사를 거쳐 지급됩니다.', 'success');
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'PAID') return <span className="status-badge status-approved">지급 완료</span>;
    if (status === 'PENDING_REVIEW') return <span className="status-badge status-pending">지급 검수중</span>;
    return <span className="status-badge status-rejected">반려됨</span>;
  };

  return (
    <div className="seller-panel">
      {/* Header Area */}
      <div className="section-header">
        <div>
          <h2 className="section-title">매출 통계 및 정산 대금 관리 (D팀)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            이번 달 누적 판매 금액 및 정산 상태를 실시간 트래킹합니다.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ background: '#008a05', border: 'none' }}
          onClick={handle_request_settlement}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.4rem' }}></i> 신청 중...</>
          ) : (
            <><i className="fa-solid fa-sack-dollar" style={{ marginRight: '0.4rem' }}></i> 월말 정산 신청</>
          )}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <i className="fa-solid fa-money-bill-trend-up"></i>
          <span className="stat-label uppercase tracking-widest">이번 달 총 매출액</span>
          <span className="stat-number" style={{ color: 'var(--primary)' }}>₩{totalSales.toLocaleString()}</span>
          <span className="stat-trend trend-up">
            <i className="fa-solid fa-caret-up mr-1"></i> 12.5% vs 전월
          </span>
        </div>
        
        <div className="stat-card">
          <i className="fa-solid fa-receipt"></i>
          <span className="stat-label uppercase tracking-widest">완료된 예약 수량</span>
          <span className="stat-number" style={{ color: '#059669' }}>{completedBookings}건</span>
          <span className="stat-trend trend-up font-bold">8건 증가</span>
        </div>

        <div className="stat-card">
          <i className="fa-solid fa-hand-holding-dollar"></i>
          <span className="stat-label uppercase tracking-widest">정산지급 대기 금액</span>
          <span className="stat-number" style={{ color: 'var(--secondary)' }}>₩{settlementPending.toLocaleString()}</span>
          <span className="stat-trend font-bold text-slate-400">수수료 {commissionRate * 100}% 제외</span>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '1.5rem' }}>
        {/* Daily Sales Chart */}
        <div className="data-table-container" style={{ padding: '1.5rem' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-chart-area"></i> 일별 매출 추이 (Finance D팀)
          </h4>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', padding: '0 1rem', position: 'relative', background: 'var(--bg-light)', borderRadius: 'var(--radius-md)' }}>
             <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {[1, 2, 3, 4].map(i => <div key={i} style={{ width: '100%', height: '1px', background: 'var(--border-color)' }} />)}
             </div>
             <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                {MOCK_DAILY_SALES.map((amount, idx) => {
                  const heightPct = Math.round((amount / maxBar) * 85);
                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        style={{
                          width: '100%',
                          borderRadius: '999px',
                          background: 'linear-gradient(to top, var(--primary), #60a5fa)',
                          height: `${heightPct}%`,
                          transition: 'all 0.7s ease',
                        }}
                      ></div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>{DAYS[idx]}</span>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Settlement History Table */}
        <div className="data-table-container">
          <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ color: '#f59e0b' }}></i> 최근 정산 신청 이력
            </h4>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>정산 월</th>
                <th>실 정산액</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SETTLEMENT_HISTORY.map((item) => (
                <tr key={item.settlementMonth}>
                  <td style={{ fontWeight: 700 }}>{item.settlementMonth}</td>
                  <td style={{ fontWeight: 800 }}>₩{item.netAmount.toLocaleString()}</td>
                  <td>{getStatusBadge(item.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
