import React, { useState, useEffect } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  get_pending_approvals_api,
  process_approval_action_api,
  get_all_bookings_api,
  admin_cancel_booking_api,
  export_passenger_csv_stream_api
} from '@/api/adminApi';
import type {
  PendingApprovalDto,
  AdminBookingDto
} from '@/api/adminApi';

interface AdminHQPanelProps {
  defaultTab?: 'approval' | 'booking';
}

export const AdminHQPanel: React.FC<AdminHQPanelProps> = ({ defaultTab = 'approval' }) => {
  const { addToast, openConfirmPopup } = useTravelStore();

  const [activeTab, setActiveTab] = useState<'approval' | 'booking'>(defaultTab);

  // Approval Pending Queue State
  const [approvalDomain, setApprovalDomain] = useState('FLIGHT');
  const [pendingList, setPendingList] = useState<PendingApprovalDto[]>([]);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PendingApprovalDto | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Booking Control Dashboard State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchDomain, setSearchDomain] = useState('ALL');
  const [bookings, setBookings] = useState<AdminBookingDto[]>([]);
  const [page, setPage] = useState(0);

  // Progressive CSV Stream Download State
  const [downloadingScheduleId, setDownloadingScheduleId] = useState<number | null>(null);
  const [csvProgress, setCsvProgress] = useState(0); // 0 to 100%

  const fetchPendingApprovals = async () => {
    try {
      const res = await get_pending_approvals_api(approvalDomain);
      if (res.success && res.data) {
        setPendingList(res.data.content);
      }
    } catch (err: any) {
      console.error("Failed to load approvals queue:", err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await get_all_bookings_api({
        keyword: searchKeyword,
        domain: searchDomain,
        page,
        size: 10
      });
      if (res.success && res.data) {
        setBookings(res.data.content);
      }
    } catch (err: any) {
      console.error("Failed to load bookings list:", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'approval') {
      fetchPendingApprovals();
    } else {
      fetchBookings();
    }
  }, [activeTab, approvalDomain, searchDomain, page]);

  const handle_search_submit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchBookings();
  };

  const handle_approve = async (requestId: number) => {
    try {
      addToast("상품 등록 신청을 승인하고 실시간 노선 캐시를 갱신 중입니다...", "info");
      const res = await process_approval_action_api(requestId, { action: 'APPROVED' });
      if (res.success) {
        addToast("성공적으로 승인 완료되었습니다. 일반 고객용 서비스 노출이 즉각 활성화됩니다.", "success");
        fetchPendingApprovals();
      }
    } catch (err: any) {
      addToast(err?.error?.message || "승인 처리 중 오류 발생", "warning");
    }
  };

  const handle_reject_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!rejectReason.trim()) {
      addToast("반려 필수 사유를 입력해 주세요.", "warning");
      return;
    }

    try {
      addToast("상품 등록을 반려하고 기록 중입니다...", "info");
      const res = await process_approval_action_api(selectedRequest.requestId, {
        action: 'REJECTED',
        rejectReason
      });

      if (res.success) {
        addToast("노선 상품 심사 등록이 정당하게 반려 조치되었습니다.", "success");
        setIsRejectOpen(false);
        setRejectReason('');
        fetchPendingApprovals();
      }
    } catch (err: any) {
      addToast(err?.error?.message || "반려 처리 중 오류 발생", "warning");
    }
  };

  const handle_cancel_booking = async (bookingId: number) => {
    openConfirmPopup(async (choice) => {
      if (!choice) return;

      try {
        addToast("본사 권한으로 직권 취소 및 실시간 좌석 복원을 실행 중입니다...", "info");
        const res = await admin_cancel_booking_api(bookingId);
        if (res.success) {
          addToast("예약이 강제 취소 완료되었으며 재고가 안전하게 롤백 복원되었습니다.", "success");
          fetchBookings();
        }
      } catch (err: any) {
        addToast(err?.error?.message || "직권 취소 권한 검증에 실패했습니다.", "warning");
      }
    });
  };

  const handle_csv_stream_export = async (scheduleId: number) => {
    try {
      setDownloadingScheduleId(scheduleId);
      setCsvProgress(0);
      addToast("대용량 탑승객 명단 CSV 파일 스트리밍 다운로드를 트리거합니다. OOM 방지 응답 중...", "info");

      const blob = await export_passenger_csv_stream_api(scheduleId, (progressEvent: any) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setCsvProgress(percent);
        } else {
          const simulated = Math.min(99, Math.round(progressEvent.loaded / 150));
          setCsvProgress(simulated);
        }
      });

      setCsvProgress(100);
      addToast("탑승객 명단 CSV 대용량 다운로드가 100% 완료되었습니다.", "success");

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `passenger_manifest_schedule_${scheduleId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setTimeout(() => {
        setDownloadingScheduleId(null);
      }, 1000);

    } catch {
      addToast("CSV 다운로드 중 연결 끊김 오류가 발생했습니다.", "warning");
      setDownloadingScheduleId(null);
    }
  };

  return (
    <div className="admin-panel">
      {/* Header & Tab Switcher */}
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="section-title">
            본사 관리자 통제 허브
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            입점 상품 승인 심사 및 통합 예약/보험 관제 시스템 <span style={{ fontSize: '0.8rem' }}>(B/C/D팀 공용)</span>
          </p>
        </div>

        <div style={{ display: 'flex', background: 'var(--bg-light)', padding: '0.35rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('approval')}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 700,
              transition: 'all 0.2s ease',
              background: activeTab === 'approval' ? 'var(--bg-white)' : 'transparent',
              color: activeTab === 'approval' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'approval' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            입점 승인 대기열
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('booking')}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 700,
              transition: 'all 0.2s ease',
              background: activeTab === 'booking' ? 'var(--bg-white)' : 'transparent',
              color: activeTab === 'booking' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'booking' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            통합 예약 관제 보드
          </button>
        </div>
      </div>

      {/* Progressive CSV Progress Alert Indicator */}
      {downloadingScheduleId && (
        <div style={{ background: '#f0fdf4', border: '1px solid rgba(16,185,129,0.3)', padding: '1.2rem 1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: '#065f46' }}>
            <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i> 대용량 명단 CSV 스트리밍 진행 중</span>
            <span>{csvProgress}% 완료</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(16,185,129,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${csvProgress}%`, height: '100%', background: '#059669', transition: 'width 0.15s' }}></div>
          </div>
        </div>
      )}

      {/* Tab 1: Pending Approval Queue */}
      {activeTab === 'approval' && (
        <div className="data-table-container p-6">
          <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-5">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2.5">
              <i className="fa-solid fa-inbox text-emerald-600"></i> 검수 대기 상품 목록
            </h3>
            <select
              value={approvalDomain}
              onChange={(e) => setApprovalDomain(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-sm"
            >
              <option value="FLIGHT">✈️ 항공 노선/스케줄</option>
              <option value="INSURANCE">🛡️ 여행자 보험 요율</option>
            </select>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>요청 ID</th>
                <th>상품 구분</th>
                <th>상품/제안 명칭</th>
                <th>등록 판매자</th>
                <th className="text-center">등록 요청일</th>
                <th>상세 구조</th>
                <th className="text-right">심사 집행</th>
              </tr>
            </thead>
            <tbody>
              {pendingList.length > 0 ? (
                pendingList.map((req) => (
                  <tr key={req.requestId}>
                    <td className="font-black text-slate-900">#{req.requestId}</td>
                    <td>
                      <span className={`status-badge ${req.category === 'FLIGHT' ? 'status-active' : 'status-approved'}`}>
                        {req.category}
                      </span>
                    </td>
                    <td className="font-bold text-slate-800">{req.productName}</td>
                    <td className="font-semibold text-slate-500">Seller #{req.registeredBy}</td>
                    <td className="text-center font-bold text-slate-400 text-xs">{req.createdAt.split('T')[0]}</td>
                    <td className="text-[11px] text-slate-400 font-mono max-w-[150px] truncate">{req.details}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-black hover:bg-emerald-700 shadow-sm transition-all active:scale-95"
                          onClick={() => handle_approve(req.requestId)}
                        >
                          즉시 승인
                        </button>
                        <button
                          type="button"
                          className="px-3.5 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[11px] font-black hover:bg-rose-100 transition-all active:scale-95"
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsRejectOpen(true);
                          }}
                        >
                          반려 조치
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-24 text-slate-400 font-bold">
                    검수 대기 상태의 신규 상품 데이터가 존재하지 않습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Unified Booking Control Dashboard */}
      {activeTab === 'booking' && (
        <div className="data-table-container p-6">
          <div className="mb-8 border-b border-slate-50 pb-5">
            <form onSubmit={handle_search_submit} className="flex gap-4 flex-wrap items-end">
              <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">통합 키워드 검색</label>
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                  placeholder="예약코드, 피보험자 실명 등..."
                />
              </div>
              <div className="flex flex-col gap-2 w-48">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">도메인 영역</label>
                <select
                  value={searchDomain}
                  onChange={(e) => setSearchDomain(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">전체 내역 (ALL)</option>
                  <option value="FLIGHT">✈️ 항공권 예약</option>
                  <option value="INSURANCE">🛡️ 여행자 보험 가입</option>
                </select>
              </div>
              <button
                type="submit"
                className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black shadow-md hover:bg-emerald-700 transition-all active:scale-95 h-[45px]"
              >
                조회 실행
              </button>
            </form>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>결제 ID</th>
                <th>분류</th>
                <th>고유 코드</th>
                <th>고객명 (정보)</th>
                <th>대상 상품</th>
                <th className="text-right">결제 금액</th>
                <th className="text-center">현재 상태</th>
                <th className="text-right">관제 제어</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking) => {
                  const is_cancelled = booking.status.startsWith('CANCELLED');
                  return (
                    <tr key={`${booking.domain}-${booking.bookingId}`}>
                      <td className="font-black text-slate-900">#{booking.bookingId}</td>
                      <td>
                        <span className={`status-badge ${booking.domain === 'FLIGHT' ? 'status-active' : 'status-approved'}`}>
                          {booking.domain}
                        </span>
                      </td>
                      <td className="font-mono text-[11px] font-black text-primary">{booking.bookingCode}</td>
                      <td className="font-bold text-slate-800">
                        {booking.customerName}
                        <span className="text-[10px] text-slate-400 block font-normal mt-0.5">{booking.customerInfo}</span>
                      </td>
                      <td className="text-slate-600 font-semibold text-xs">{booking.productName}</td>
                      <td className="font-black text-slate-900 text-right">₩{booking.totalAmount.toLocaleString()}</td>
                      <td className="text-center">
                        <span className={`status-badge ${is_cancelled ? 'status-rejected' : 'status-active'}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          {booking.domain === 'FLIGHT' && !is_cancelled && (
                            <button
                              type="button"
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-black flex items-center gap-1.5 transition-all shadow-sm"
                              onClick={() => handle_csv_stream_export(booking.bookingId)}
                              disabled={downloadingScheduleId !== null}
                            >
                              <i className="fa-solid fa-file-csv text-emerald-600"></i> 명단 CSV
                            </button>
                          )}

                          {!is_cancelled && (
                            <button
                              type="button"
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[11px] font-black hover:bg-rose-100 transition-all shadow-sm"
                              onClick={() => handle_cancel_booking(booking.bookingId)}
                            >
                              직권 취소
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-24 text-slate-400 font-bold">
                    관제 필터 조건에 부합하는 가입/예약 정보가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Reason input Modal */}
      {isRejectOpen && selectedRequest && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="app-modal" style={{ width: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                ⚠️ #{selectedRequest.requestId} 심사 반려
              </h3>
              <button type="button" style={{ color: 'var(--text-muted)' }} onClick={() => setIsRejectOpen(false)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '1.1rem' }}></i>
              </button>
            </div>

            <form onSubmit={handle_reject_submit}>
              <div className="form-group">
                <label className="form-label">반려 필수 정당 사유</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="form-input"
                  style={{ height: '100px', resize: 'none' }}
                  placeholder="반려 처리의 상세 사유를 명확히 적어주세요. 입점 파트너에게 즉각 통보됩니다."
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, padding: '0.7rem' }} onClick={() => setIsRejectOpen(false)}>취소</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.7rem', background: 'var(--secondary)', border: 'none' }}>반려 처리 확정</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
