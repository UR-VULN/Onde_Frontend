import React, { useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  get_seller_sales_stat_api,
  get_seller_settlement_history_api,
  request_monthly_settlement_api,
  get_seller_settlement_detail_api,
} from '@/api/sellerApi';
import type { SellerSettlementHistoryDto, SettlementDetailResponseDto } from '@/api/sellerApi';
import { get_seller_dashboard_statistics_api } from '@/api/sellerApi';
import { DAYS_OF_WEEK } from '@/constants/shared';

export const SellerStatPanel: React.FC = () => {
  const { addToast } = useTravelStore();
  const [isRequesting, setIsRequesting] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [settlementPending, setSettlementPending] = useState(0);
  const [settlementHistory, setSettlementHistory] = useState<SellerSettlementHistoryDto[]>([]);
  const [dailySales, setDailySales] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  const [detailData, setDetailData] = useState<SettlementDetailResponseDto | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handle_view_details = async (settlementId: number) => {
    setIsDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const res = await get_seller_settlement_detail_api(settlementId);
      if (res.success && res.data) {
        setDetailData(res.data);
      } else {
        addToast(res.message || '상세 내역을 가져오지 못했습니다.', 'warning');
        setIsDetailModalOpen(false);
      }
    } catch (err: any) {
      addToast(err?.error?.message || '상세 내역 조회 중 오류가 발생했습니다.', 'warning');
      setIsDetailModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const [statRes, histRes, dashRes] = await Promise.all([
        get_seller_sales_stat_api(),
        get_seller_settlement_history_api(),
        get_seller_dashboard_statistics_api({ period: 'MONTHLY' }),
      ]);
      if (statRes.success && statRes.data) {
        setTotalSales(statRes.data.totalSalesAmount);
        setCompletedBookings(statRes.data.completedBookingsCount);
        setSettlementPending(statRes.data.settlementPendingAmount);
      }
      if (histRes.success && histRes.data) {
        setSettlementHistory(histRes.data);
      }
      if (dashRes.success && dashRes.data?.dailyRevenue?.length) {
        setDailySales(dashRes.data.dailyRevenue);
      }
    })();
  }, []);

  const maxBar = Math.max(...dailySales, 1);

  const hasActiveRequest = settlementHistory.some(
    (item) => {
      const s = item.status.toUpperCase();
      return s === 'REQUESTED' || s === 'APPROVED_1ST' || s === 'PENDING_REVIEW';
    }
  );

  const handle_request_settlement = async () => {
    setIsRequesting(true);
    addToast('정산 대금 지급 수동 신청을 처리 중입니다...', 'info');
    try {
      const res = await request_monthly_settlement_api();
      if (res.success) {
        addToast('정산 대금 지급 수동 신청이 완료되었습니다. 본사 정산 심사를 거쳐 지급됩니다.', 'success');
        const histRes = await get_seller_settlement_history_api();
        if (histRes.success && histRes.data) setSettlementHistory(histRes.data);
      } else {
        addToast(res.message || '정산 신청에 실패했습니다.', 'warning');
      }
    } catch (err: any) {
      addToast(err?.error?.message || '정산 신청 중 오류가 발생했습니다.', 'warning');
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const normalized = status.toUpperCase();
    if (normalized === 'COMPLETED' || normalized === 'PAID') {
      return <span className="status-badge status-approved">지급 완료</span>;
    }
    if (normalized === 'APPROVED_1ST') {
      return <span className="status-badge status-approved">1차 승인</span>;
    }
    if (normalized === 'REQUESTED' || normalized === 'PENDING_REVIEW') {
      return <span className="status-badge status-pending">지급 심사중</span>;
    }
    if (normalized === 'PENDING') {
      return <span className="status-badge status-pending">신청 가능</span>;
    }
    if (normalized === 'REJECTED') {
      return <span className="status-badge status-rejected">반려됨</span>;
    }
    return <span className="status-badge">{status || '-'}</span>;
  };

  return (
    <div className="seller-panel">
      {/* Header Area */}
      <div className="section-header">
        <div>
          <h2 className="section-title">정산 대금 관리</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            이번 달 누적 판매 금액 및 정산 상태를 실시간 트래킹합니다.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ background: hasActiveRequest ? '#94a3b8' : '#008a05', border: 'none', cursor: hasActiveRequest ? 'not-allowed' : 'pointer' }}
          onClick={handle_request_settlement}
          disabled={isRequesting || hasActiveRequest}
          title={hasActiveRequest ? "이미 대기 중이거나 승인 검토 중인 정산 신청이 존재합니다." : "정산 신청을 진행합니다."}
        >
          {isRequesting ? (
            <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.4rem' }}></i> 신청 중...</>
          ) : (
            <><i className="fa-solid fa-sack-dollar" style={{ marginRight: '0.4rem' }}></i> 정산 신청</>
          )}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <i className="fa-solid fa-money-bill-trend-up"></i>
          <span className="stat-label uppercase tracking-widest">이번 달 총 정산액</span>
          <span className="stat-number" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>₩{totalSales.toLocaleString()}</span>
        </div>
        
        <div className="stat-card">
          <i className="fa-solid fa-receipt"></i>
          <span className="stat-label uppercase tracking-widest">완료된 예약 수량</span>
          <span className="stat-number" style={{ color: '#059669', marginBottom: '1rem' }}>{completedBookings}건</span>
        </div>

        <div className="stat-card">
          <i className="fa-solid fa-hand-holding-dollar"></i>
          <span className="stat-label uppercase tracking-widest">정산지급 대기 금액</span>
          <span className="stat-number" style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>₩{settlementPending.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '1.5rem' }}>
        {/* Daily Sales Chart */}
        <div className="data-table-container" style={{ padding: '1.5rem' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-chart-area"></i> 일별 매출 추이
          </h4>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', padding: '0 1rem', position: 'relative', background: 'var(--bg-light)', borderRadius: 'var(--radius-md)' }}>
             <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {[1, 2, 3, 4].map(i => <div key={i} style={{ width: '100%', height: '1px', background: 'var(--border-color)' }} />)}
             </div>
             <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                {dailySales.map((amount, idx) => {
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
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>{DAYS_OF_WEEK[idx]}</span>
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
              {settlementHistory.map((item) => (
                <tr 
                  key={item.settlementMonth} 
                  onClick={() => handle_view_details(item.settlementId)} 
                  style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                  className="hover:bg-slate-100"
                  title="클릭하여 상세 예약을 조회합니다"
                >
                  <td style={{ fontWeight: 700 }}>{item.settlementMonth}</td>
                  <td style={{ fontWeight: 800 }}>₩{item.netAmount.toLocaleString()}</td>
                  <td>{getStatusBadge(item.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-white)',
            borderRadius: 'var(--radius-md)',
            width: '90%',
            maxWidth: '650px',
            maxHeight: '80vh',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            animation: 'fadeIn 0.2s ease',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.2rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-list-check" style={{ color: 'var(--primary)' }}></i> 정산 상세 내역
              </h3>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                style={{ fontSize: '1.2rem', color: 'var(--text-muted)', cursor: 'pointer', border: 'none', background: 'none' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {isDetailLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', gap: '1rem' }}>
                  <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>상세 내역을 불러오는 중입니다...</span>
                </div>
              ) : detailData && detailData.details.length > 0 ? (
                <div>
                  <div style={{ marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', background: 'var(--bg-light)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>정산 기준일</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-dark)' }}>{detailData.settlementDate}</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>총 결제 건수</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-dark)' }}>{detailData.details.length} 건</strong>
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-dark)', fontWeight: 800, textAlign: 'left' }}>
                        <th style={{ padding: '0.6rem 0.4rem' }}>예약 ID</th>
                        <th style={{ padding: '0.6rem 0.4rem' }}>구분</th>
                        <th style={{ padding: '0.6rem 0.4rem' }}>상품명</th>
                        <th style={{ padding: '0.6rem 0.4rem', textAlign: 'right' }}>결제 금액</th>
                        <th style={{ padding: '0.6rem 0.4rem', textAlign: 'right' }}>결제 일시</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailData.details.map((item) => (
                        <tr key={item.paymentId} style={{ borderBottom: '1px solid var(--bg-light)', transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '0.8rem 0.4rem', fontWeight: 700 }}>{item.reservationId}</td>
                          <td style={{ padding: '0.8rem 0.4rem' }}>
                            <span style={{
                              padding: '0.2rem 0.4rem',
                              borderRadius: '4px',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              backgroundColor: item.targetType === 'ROOM'
                                ? 'rgba(0, 92, 230, 0.1)'
                                : item.targetType === 'CAR'
                                  ? 'rgba(255, 90, 95, 0.1)'
                                  : 'rgba(16, 185, 129, 0.1)',
                              color: item.targetType === 'ROOM'
                                ? 'var(--primary)'
                                : item.targetType === 'CAR'
                                  ? 'var(--secondary)'
                                  : '#10b981'
                            }}>
                              {item.targetType === 'ROOM' ? '숙소' : item.targetType === 'CAR' ? '렌터카' : '항공'}
                            </span>
                          </td>
                          <td style={{ padding: '0.8rem 0.4rem', fontWeight: 600, color: 'var(--text-dark)' }}>{item.productName}</td>
                          <td style={{ padding: '0.8rem 0.4rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-dark)' }}>₩{item.amount.toLocaleString()}</td>
                          <td style={{ padding: '0.8rem 0.4rem', textAlign: 'right', color: 'var(--text-muted)' }}>{new Date(item.paymentDate).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-folder-open" style={{ fontSize: '2rem', marginBottom: '0.8rem', display: 'block' }}></i>
                  <span style={{ fontWeight: 600 }}>정산 세부 내역이 존재하지 않습니다.</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: 'var(--bg-light)',
            }}>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="btn-secondary"
                style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
