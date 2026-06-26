import React, { useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { get_seller_dashboard_api } from '@/api/sellerApi';
import type { SellerDashboardDto } from '@/api/sellerApi';
import { RevealableMaskedText } from '@/components/common/RevealableMaskedText';
import { useSellerDashboardReveal } from '@/hooks/useSellerDashboardReveal';
import { extractApiErrorMessage } from '@/utils/apiResponse';

export const SellerDashboardPanel: React.FC<{ onTabChange?: (tab: string) => void }> = ({ onTabChange }) => {
  const { addToast } = useTravelStore();
  const { revealField } = useSellerDashboardReveal();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<SellerDashboardDto | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await get_seller_dashboard_api();
      if (res.success && res.data) {
        setDashboardData(res.data);
      } else {
        addToast(res.message || '대시보드 데이터를 가져오는데 실패했습니다.', 'warning');
      }
    } catch (err: unknown) {
      addToast(extractApiErrorMessage(err, '대시보드 데이터를 가져오는 중 오류가 발생했습니다.'), 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'COMPLETED' || s === 'PAID' || s === 'APPROVED' || s === 'CONFIRMED') {
      return (
        <span 
          className="status-badge" 
          style={{ 
            backgroundColor: '#e6fcf5', 
            color: '#0ca678', 
            border: '1px solid #c3fae8',
            padding: '0.25rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 700 
          }}
        >
          확정 완료
        </span>
      );
    }
    if (s === 'RESERVED') {
      return (
        <span 
          className="status-badge" 
          style={{ 
            backgroundColor: '#e8f4fd', 
            color: '#1d8cf8', 
            border: '1px solid #b3d7ff',
            padding: '0.25rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 700 
          }}
        >
          예약 대기
        </span>
      );
    }
    if (s === 'PENDING' || s === 'REQUESTED') {
      return (
        <span 
          className="status-badge" 
          style={{ 
            backgroundColor: '#fff9db', 
            color: '#f08c00', 
            border: '1px solid #ffe3e3',
            padding: '0.25rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 700 
          }}
        >
          대기 중
        </span>
      );
    }
    return (
      <span 
        className="status-badge" 
        style={{ 
          backgroundColor: '#fff5f5', 
          color: '#fa5252', 
          border: '1px solid #ffe3e3',
          padding: '0.25rem 0.6rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 700 
        }}
      >
        취소/반려
      </span>
    );
  };

  const getTargetBadge = (type: string) => {
    switch (type) {
      case 'STAY':
        return (
          <span 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.3rem', 
              backgroundColor: '#eef2ff', 
              color: '#4f46e5', 
              border: '1px solid #e0e7ff',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700 
            }}
          >
            <i className="fa-solid fa-hotel"></i> 숙소
          </span>
        );
      case 'CAR':
        return (
          <span 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.3rem', 
              backgroundColor: '#ecfdf5', 
              color: '#059669', 
              border: '1px solid #d1fae5',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700 
            }}
          >
            <i className="fa-solid fa-car"></i> 렌터카
          </span>
        );
      case 'FLIGHT':
        return (
          <span 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.3rem', 
              backgroundColor: '#fdf2f8', 
              color: '#db2777', 
              border: '1px solid #fce7f3',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700 
            }}
          >
            <i className="fa-solid fa-plane"></i> 항공
          </span>
        );
      default:
        return <span>{type}</span>;
    }
  };

  if (loading) {
    return (
      <div className="seller-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-circle-notch fa-spin fa-2x" style={{ marginBottom: '1.2rem', color: 'var(--primary)' }}></i>
          <p style={{ fontWeight: 600 }}>통합 대시보드를 구성하는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <i className="fa-solid fa-chart-line" style={{ color: 'var(--primary)' }}></i> 파트너 종합 대시보드
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.3rem', fontWeight: 500 }}>
            등록한 숙소, 렌터카, 항공 노선 상품의 총 수량과 실시간 예약 현황을 한눈에 모니터링합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            fetchDashboard();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-full)',
            border: '1.5px solid var(--border-color)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          <i className="fa-solid fa-rotate"></i> 새로고침
        </button>
      </div>

      {/* Overview Card Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
        {/* Card 1: STAY */}
        <div 
          onClick={() => onTabChange?.('stay')}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
            border: '1px solid #e0e7ff',
            borderRadius: '16px',
            padding: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="dashboard-stat-card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', letterSpacing: '0.5px' }}>REGISTERED STAY</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e1b4b', marginTop: '0.3rem', marginBottom: '0.2rem' }}>
                {dashboardData?.accommodationCount ?? 0} <span style={{ fontSize: '1rem', fontWeight: 600 }}>개</span>
              </h3>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4f46e5', marginTop: '0.2rem' }}>
                누적 매출: ₩{(dashboardData?.stayRevenue ?? 0).toLocaleString()}
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eef2ff', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#4f46e5' }}>
              <i className="fa-solid fa-hotel fa-lg"></i>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1.2rem', fontSize: '0.8rem', fontWeight: 700, color: '#6366f1' }}>
            숙소/객실 관리 이동 <i className="fa-solid fa-arrow-right-long"></i>
          </div>
        </div>

        {/* Card 2: CAR */}
        <div 
          onClick={() => onTabChange?.('car')}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f6fdf9 100%)',
            border: '1px solid #d1fae5',
            borderRadius: '16px',
            padding: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="dashboard-stat-card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', letterSpacing: '0.5px' }}>REGISTERED CAR</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#064e3b', marginTop: '0.3rem', marginBottom: '0.2rem' }}>
                {dashboardData?.carCount ?? 0} <span style={{ fontSize: '1rem', fontWeight: 600 }}>개</span>
              </h3>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669', marginTop: '0.2rem' }}>
                누적 매출: ₩{(dashboardData?.carRevenue ?? 0).toLocaleString()}
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ecfdf5', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#059669' }}>
              <i className="fa-solid fa-car fa-lg"></i>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1.2rem', fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
            렌터카 재고 관리 이동 <i className="fa-solid fa-arrow-right-long"></i>
          </div>
        </div>

        {/* Card 3: FLIGHT */}
        <div 
          onClick={() => onTabChange?.('flight')}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
            border: '1px solid #ffedd5',
            borderRadius: '16px',
            padding: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="dashboard-stat-card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ea580c', letterSpacing: '0.5px' }}>REGISTERED FLIGHT</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7c2d12', marginTop: '0.3rem', marginBottom: '0.2rem' }}>
                {dashboardData?.flightRouteCount ?? 0} <span style={{ fontSize: '1rem', fontWeight: 600 }}>개</span>
              </h3>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ea580c', marginTop: '0.2rem' }}>
                누적 매출: ₩{(dashboardData?.flightRevenue ?? 0).toLocaleString()}
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fff7ed', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ea580c' }}>
              <i className="fa-solid fa-plane fa-lg"></i>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1.2rem', fontSize: '0.8rem', fontWeight: 700, color: '#f97316' }}>
            항공 상품 관리 이동 <i className="fa-solid fa-arrow-right-long"></i>
          </div>
        </div>
      </div>


      {/* Two-Column Grid: Reservations Table & Account Wallet Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Reservations Timeline Table */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--primary)' }}></i> 최근 실시간 통합 예약 현황
            </h4>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', backgroundColor: 'var(--bg-light)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              최신 5건
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border-color)', backgroundColor: 'var(--bg-light)' }}>
                  <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', textAlign: 'left' }}>유형</th>
                  <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', textAlign: 'left' }}>예약자</th>
                  <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', textAlign: 'left' }}>상품 정보</th>
                  <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', textAlign: 'left' }}>이용 일정</th>
                  <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', textAlign: 'right' }}>이용 금액</th>
                  <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', textAlign: 'center' }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.recentReservations && dashboardData.recentReservations.length > 0 ? (
                  dashboardData.recentReservations
                    .filter((res) => res.status.toUpperCase() !== 'RESERVED')
                    .map((res) => (
                    <tr key={`${res.targetType}-${res.id}`} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '1.1rem 1rem' }}>{getTargetBadge(res.targetType)}</td>
                      <td style={{ padding: '1.1rem 1rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)' }}>{res.customerName}</td>
                      <td style={{ padding: '1.1rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-dark)' }}>{res.productName}</td>
                      <td style={{ padding: '1.1rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{res.schedule}</td>
                      <td style={{ padding: '1.1rem 1rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-dark)', textAlign: 'right' }}>
                        ₩{res.price.toLocaleString()}
                      </td>
                      <td style={{ padding: '1.1rem 1rem', textAlign: 'center' }}>{getStatusBadge(res.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                      <i className="fa-regular fa-calendar-xmark fa-3x" style={{ marginBottom: '1rem', display: 'block', opacity: 0.35 }}></i>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>접수된 실시간 예약 내역이 없습니다.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Account Info Box & Navigation to accounts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-wallet" style={{ color: '#eab308' }}></i> 매출 정보
            </h4>
            
            <div style={{ backgroundColor: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)', padding: '1.2rem', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#eff6ff' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e40af', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                파트너 총 누적 매출
              </div>
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#1d4ed8' }}>
                ₩{(dashboardData?.totalRevenue ?? 0).toLocaleString()}
              </div>
            </div>
            
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                로그인 계정 ID
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-dark)' }}>
                {dashboardData?.email ? (
                  <RevealableMaskedText
                    maskedValue={dashboardData.email}
                    getPlaintext={(password) => revealField('email', password)}
                  />
                ) : (
                  '—'
                )}
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                정산 계좌 정보
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                {dashboardData?.bankName ? (
                  <>
                    <span 
                      style={{ 
                        backgroundColor: '#dbeafe', 
                        color: '#1e40af', 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.7rem', 
                        fontWeight: 700 
                      }}
                    >
                      승인 완료
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                      <RevealableMaskedText
                        maskedValue={dashboardData.bankName}
                        getPlaintext={(password) => revealField('bankName', password)}
                      />
                    </span>
                  </>
                ) : (
                  <>
                    <span 
                      style={{ 
                        backgroundColor: '#fee2e2', 
                        color: '#991b1b', 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.7rem', 
                        fontWeight: 700 
                      }}
                    >
                      미등록
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>계좌 등록 필요</span>
                  </>
                )}
              </div>
              {dashboardData?.accountNumber && (
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.3px' }}>
                  <RevealableMaskedText
                    maskedValue={dashboardData.accountNumber}
                    getPlaintext={(password) => revealField('accountNumber', password)}
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => onTabChange?.('account')}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <i className="fa-solid fa-gear"></i> 계좌 및 계정 정보 관리
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
