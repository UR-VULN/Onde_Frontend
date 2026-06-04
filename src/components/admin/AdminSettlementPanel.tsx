import React, { useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  get_admin_settlements_api,
  approve_first_settlement_api,
  finalize_settlement_api,
  type AdminSettlementDto
} from '@/api/adminApi';
import { isSuperAdmin, isSellerAdmin } from '@/utils/adminPermissions';

export const AdminSettlementPanel: React.FC = () => {
  const { addToast, memberRole } = useTravelStore();
  const [settlements, setSettlements] = useState<AdminSettlementDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');

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
                <tr key={item.settlementId}>
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
                  <td className="text-right">
                    {item.status === 'REQUESTED' && isSeller && (
                      <button
                        onClick={() => handleApproveFirst(item.settlementId)}
                        className="btn-primary"
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#008a05', border: 'none' }}
                      >
                        정산 1차 승인
                      </button>
                    )}
                    {item.status === 'APPROVED_1ST' && isSuper && (
                      <button
                        onClick={() => handleFinalize(item.settlementId)}
                        className="btn-primary"
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#0284c7', border: 'none' }}
                      >
                        정산 최종 승인
                      </button>
                    )}
                    {item.status === 'REQUESTED' && isSuper && (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
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
                      </div>
                    )}
                    {item.status !== 'REQUESTED' && item.status !== 'APPROVED_1ST' && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>처리 완료</span>
                    )}
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
    </div>
  );
};
