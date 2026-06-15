import React, { useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  get_admin_settlements_api,
  approve_first_settlement_api,
  finalize_settlement_api,
  reject_settlement_api,
  type AdminSettlementDto,
  get_admin_settlement_detail_api,
  type AdminSettlementDetailResponseDto
} from '@/api/adminApi';
import { isSuperAdmin, isSellerAdmin } from '@/utils/adminPermissions';

export const AdminSettlementPanel: React.FC = () => {
  const { addToast, memberRole } = useTravelStore();
  const [settlements, setSettlements] = useState<AdminSettlementDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const [detailData, setDetailData] = useState<AdminSettlementDetailResponseDto | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handle_view_details = async (settlementId: number) => {
    setIsDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const res = await get_admin_settlement_detail_api(settlementId);
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

  const loadSettlements = async () => {
    setLoading(true);
    try {
      const res = await get_admin_settlements_api(filterStatus || undefined);
      if (res.success && res.data) {
        setSettlements(res.data.settlements);
      } else {
        addToast(res.message || '정산 목록 조회 실패', 'warning');
      }
    } catch (err: any) {
      addToast(err?.error?.message || '정산 목록 조회 중 오류가 발생했습니다.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettlements();
  }, [filterStatus]);

  const handleApproveFirst = async (id: number) => {
    try {
      const res = await approve_first_settlement_api(id, '1차 승인 완료');
      if (res.success) {
        addToast('정산 1차 승인이 완료되었습니다.', 'success');
        loadSettlements();
      } else {
        addToast(res.message || '1차 승인 실패', 'warning');
      }
    } catch (err: any) {
      addToast(err?.error?.message || '1차 승인 중 오류 발생', 'warning');
    }
  };

  const handleFinalize = async (id: number) => {
    try {
      const res = await finalize_settlement_api(id, '최종 승인 완료');
      if (res.success) {
        addToast('정산 최종 승인 및 지급이 완료되었습니다.', 'success');
        loadSettlements();
      } else {
        addToast(res.message || '최종 승인 실패', 'warning');
      }
    } catch (err: any) {
      addToast(err?.error?.message || '최종 승인 중 오류 발생', 'warning');
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt('정산 반려 사유를 입력해주세요:');
    if (reason === null) return;
    if (!reason.trim()) {
      addToast('반려 사유를 입력해야 합니다.', 'warning');
      return;
    }
    try {
      const res = await reject_settlement_api(id, reason);
      if (res.success) {
        addToast('정산 반려 처리가 완료되었습니다.', 'success');
        loadSettlements();
      } else {
        addToast(res.message || '반려 처리 실패', 'warning');
      }
    } catch (err: any) {
      addToast(err?.error?.message || '반려 처리 중 오류 발생', 'warning');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return '정산 대기';
      case 'REQUESTED': return '지급 요청됨';
      case 'APPROVED_1ST': return '1차 승인됨';
      case 'REJECTED': return '반려됨';
      case 'COMPLETED': return '지급 완료';
      default: return status;
    }
  };

  const isSuper = isSuperAdmin(memberRole);
  const isSeller = isSellerAdmin(memberRole);

  return (
    <div className="admin-panel">
      <div className="section-header">
        <div>
          <h2 className="section-title">파트너 정산 승인 및 관리</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            판매자가 신청한 매출 정산 대금 지급 건을 심사하고 승인 또는 반려합니다.
          </p>
        </div>
      </div>

      <div className="data-table-container" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>상태 필터:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input"
            style={{ width: '180px', padding: '0.4rem 0.8rem', borderRadius: '0.5rem' }}
          >
            <option value="">전체 보기</option>
            <option value="PENDING">정산 대기(PENDING)</option>
            <option value="REQUESTED">지급 요청됨(REQUESTED)</option>
            <option value="APPROVED_1ST">1차 승인됨(APPROVED_1ST)</option>
            <option value="REJECTED">반려됨(REJECTED)</option>
            <option value="COMPLETED">지급 완료(COMPLETED)</option>
          </select>
          <button className="btn-primary" onClick={loadSettlements} disabled={loading} style={{ padding: '0.4rem 1rem' }}>
            새로고침
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>정산 년월</th>
              <th>판매 파트너</th>
              <th>계좌 정보</th>
              <th>총 매출액 (Gross)</th>
              <th>수수료 (3%)</th>
              <th>지급 예정액 (Net)</th>
              <th>진행 상태</th>
              <th className="text-right">처리 작업</th>
            </tr>
          </thead>
          <tbody>
            {settlements.length > 0 ? (
              settlements.map((item) => (
                <tr 
                  key={item.settlementId} 
                  onClick={() => handle_view_details(item.settlementId)}
                  style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                  className="hover:bg-slate-100"
                  title="클릭하여 정산 상세 예약을 조회합니다"
                >
                  <td className="font-bold">#{item.settlementId}</td>
                  <td>{item.settlementMonth}</td>
                  <td>{item.sellerName || `ID: ${item.sellerId}`}</td>
                  <td>
                    {item.bankName ? `${item.bankName} (${item.accountNumber})` : '계좌 미등록'}
                  </td>
                  <td className="font-bold">₩{item.grossAmount.toLocaleString()}</td>
                  <td style={{ color: 'var(--secondary)' }}>₩{item.commission.toLocaleString()}</td>
                  <td style={{ color: '#008a05', fontWeight: 'bold' }}>₩{item.netAmount.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${
                      item.status === 'COMPLETED' ? 'status-approved' : 
                      item.status === 'REJECTED' ? 'status-rejected' : 'status-pending'
                    }`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                   <td className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {item.status === 'REQUESTED' && isSeller && (
                        <>
                          <button
                            onClick={() => handleApproveFirst(item.settlementId)}
                            className="btn-primary"
                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#008a05', border: 'none' }}
                          >
                            정산 1차 승인
                          </button>
                          <button
                            onClick={() => handleReject(item.settlementId)}
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#dc2626', color: '#fff', border: 'none' }}
                          >
                            반려
                          </button>
                        </>
                      )}
                      {item.status === 'APPROVED_1ST' && isSuper && (
                        <>
                          <button
                            onClick={() => handleFinalize(item.settlementId)}
                            className="btn-primary"
                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#0284c7', border: 'none' }}
                          >
                            정산 최종 승인
                          </button>
                          <button
                            onClick={() => handleReject(item.settlementId)}
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#dc2626', color: '#fff', border: 'none' }}
                          >
                            반려
                          </button>
                        </>
                      )}
                      {item.status === 'REQUESTED' && isSuper && (
                        <>
                          <button
                            onClick={() => handleApproveFirst(item.settlementId)}
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                          >
                            1차 승인
                          </button>
                          <button
                            onClick={() => handleFinalize(item.settlementId)}
                            className="btn-primary"
                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#0284c7', border: 'none' }}
                            disabled
                            title="1차 승인 후 최종 승인이 가능합니다."
                          >
                            최종 승인
                          </button>
                          <button
                            onClick={() => handleReject(item.settlementId)}
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#dc2626', color: '#fff', border: 'none' }}
                          >
                            반려
                          </button>
                        </>
                      )}
                      {item.status !== 'REQUESTED' && item.status !== 'APPROVED_1ST' && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>처리 완료</span>
                      )}
                      {item.status === 'REQUESTED' && !isSeller && !isSuper && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>1차 승인 대기</span>
                      )}
                      {item.status === 'APPROVED_1ST' && !isSuper && (
                        <>
                          {isSeller && (
                            <button
                              onClick={() => handleReject(item.settlementId)}
                              className="btn-secondary"
                              style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#dc2626', color: '#fff', border: 'none', marginRight: '0.5rem' }}
                            >
                              반려
                            </button>
                          )}
                          <span style={{ color: '#008a05', fontSize: '0.8rem', fontWeight: 'bold' }}>최종 승인 대기</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-10 text-slate-400 font-bold">
                  정산 신청 및 대기 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
                <i className="fa-solid fa-list-check" style={{ color: 'var(--primary)' }}></i> 파트너 정산 세부 내역
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
