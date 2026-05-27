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

export const AdminHQPanel: React.FC = () => {
  const { addToast, openConfirmPopup } = useTravelStore();

  const [activeTab, setActiveTab] = useState<'approval' | 'booking'>('approval');

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
          // Chunk-by-chunk download size simulator if total content-length header is absent
          const simulated = Math.min(99, Math.round(progressEvent.loaded / 150));
          setCsvProgress(simulated);
        }
      });

      setCsvProgress(100);
      addToast("탑승객 명단 CSV 대용량 다운로드가 100% 완료되었습니다.", "success");

      // Save file local
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
    <div className="admin-panel animate-[fadeIn_0.3s_ease]">
      {/* Tab Switcher Headers */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
        <div>
          <h2 className="font-logo font-black text-xl text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-users-gear text-emerald-600"></i> 본사 관리자 통제 허브 (Admin Panel)
          </h2>
          <p className="text-[10px] text-slate-500 font-bold mt-1">
            입점 등록 노선을 승인 심사하고, 전체 항공/보험 예약 현황을 직권 관리하며 대용량 명단을 안전하게 CSV 추출합니다.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
              activeTab === 'approval' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            onClick={() => setActiveTab('approval')}
          >
            입점 승인 심사 대기열
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
              activeTab === 'booking' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            onClick={() => setActiveTab('booking')}
          >
            통합 예약/보험 관제 보드
          </button>
        </div>
      </div>

      {/* Progressive CSV Progress Alert Indicator */}
      {downloadingScheduleId && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-6 animate-pulse flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-black text-emerald-800">
            <span>대용량 탑승객 명단 CSV HTTP 청크 스트리밍 추출 진행 중...</span>
            <span>{csvProgress}% 완료</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${csvProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Tab 1: Pending Approval Queue */}
      {activeTab === 'approval' && (
        <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-md p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="font-logo font-extrabold text-sm text-slate-800">
              📥 검수 대기 입점 상품 목록
            </h3>
            <select
              value={approvalDomain}
              onChange={(e) => setApprovalDomain(e.target.value)}
              className="border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 cursor-pointer"
            >
              <option value="FLIGHT">✈️ 항공 노선/스케줄</option>
              <option value="INSURANCE">🛡️ 여행자 보험 상품 요율</option>
            </select>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>요청 ID</th>
                  <th>상품 구분</th>
                  <th>상품/제안 명칭</th>
                  <th>등록 판매자</th>
                  <th>등록 요청일</th>
                  <th>상세 구조</th>
                  <th>심사 집행</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.length > 0 ? (
                  pendingList.map((req) => (
                    <tr key={req.requestId}>
                      <td className="font-bold">#{req.requestId}</td>
                      <td>
                        <span className={`status-badge ${req.category === 'FLIGHT' ? 'status-active' : 'status-approved'}`}>
                          {req.category}
                        </span>
                      </td>
                      <td className="font-bold text-slate-800">{req.productName}</td>
                      <td>Seller #{req.registeredBy}</td>
                      <td className="text-slate-500 font-semibold">{req.createdAt.split('T')[0]}</td>
                      <td className="text-[10px] text-slate-500 font-mono max-w-[200px] truncate">
                        {req.details}
                      </td>
                      <td className="flex gap-2">
                        <button
                          type="button"
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                          onClick={() => handle_approve(req.requestId)}
                        >
                          승인
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600"
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsRejectOpen(true);
                          }}
                        >
                          반려
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                      검수 대기 상태의 신규 노선 및 상품 요율 테이블이 존재하지 않습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Unified Booking Control Dashboard */}
      {activeTab === 'booking' && (
        <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-md p-6 flex flex-col gap-6">
          <form onSubmit={handle_search_submit} className="flex gap-3 flex-wrap items-center">
            <div className="flex flex-col gap-1 w-64">
              <label className="text-[9px] font-bold text-slate-400">통합 키워드 검색</label>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                placeholder="예약코드, 피보험자 실명 등..."
              />
            </div>
            <div className="flex flex-col gap-1 w-40">
              <label className="text-[9px] font-bold text-slate-400">도메인 영역</label>
              <select
                value={searchDomain}
                onChange={(e) => setSearchDomain(e.target.value)}
                className="border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 cursor-pointer"
              >
                <option value="ALL">전체 내역 (ALL)</option>
                <option value="FLIGHT">✈️ 항공권 예약</option>
                <option value="INSURANCE">🛡️ 여행자 보험 가입</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow hover:bg-emerald-700 self-end mt-2"
            >
              조회
            </button>
          </form>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>결제 고유 ID</th>
                  <th>신청 분류</th>
                  <th>고유 코드</th>
                  <th>고객명 (정보)</th>
                  <th>대상 상품</th>
                  <th>결제 금액</th>
                  <th>현재 상태</th>
                  <th>관제 제어</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((booking) => {
                    const is_cancelled = booking.status.startsWith('CANCELLED');
                    return (
                      <tr key={`${booking.domain}-${booking.bookingId}`}>
                        <td className="font-bold">#{booking.bookingId}</td>
                        <td>
                          <span className={`status-badge ${booking.domain === 'FLIGHT' ? 'status-active' : 'status-approved'}`}>
                            {booking.domain}
                          </span>
                        </td>
                        <td className="font-mono text-xs font-bold">{booking.bookingCode}</td>
                        <td className="font-bold text-slate-800">
                          {booking.customerName}
                          <span className="text-[10px] text-slate-400 block font-normal">{booking.customerInfo}</span>
                        </td>
                        <td className="text-slate-700 font-semibold">{booking.productName}</td>
                        <td className="font-black text-slate-800">₩{booking.totalAmount.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge ${is_cancelled ? 'status-rejected' : 'status-approved'}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="flex gap-2">
                          {/* Export CSV manifest only for FLIGHT bookings! */}
                          {booking.domain === 'FLIGHT' && !is_cancelled && (
                            <button
                              type="button"
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                              onClick={() => handle_csv_stream_export(booking.bookingId)}
                              disabled={downloadingScheduleId !== null}
                            >
                              <i className="fa-solid fa-file-csv text-emerald-600"></i> 명단 CSV
                            </button>
                          )}

                          {!is_cancelled && (
                            <button
                              type="button"
                              className="px-2.5 py-1 bg-rose-50 text-secondary border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100"
                              onClick={() => handle_cancel_booking(booking.bookingId)}
                            >
                              직권 취소
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 font-bold">
                      관제 검색 조건에 부합하는 가입 예약 정보가 존재하지 않습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Reason input Modal */}
      {isRejectOpen && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl w-full max-w-sm p-6 flex flex-col gap-6 animate-[scaleUp_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-logo font-black text-md text-slate-800">
                ❌ #{selectedRequest.requestId} 등록 심사 반려
              </h3>
              <button
                type="button"
                className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400"
                onClick={() => setIsRejectOpen(false)}
              >
                <i className="fa-solid fa-xmark text-md"></i>
              </button>
            </div>

            <form onSubmit={handle_reject_submit} className="flex flex-col gap-4">
              <div className="form-group mb-0">
                <label className="text-[10px] font-bold text-slate-700">반려 필수 사유 수집</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold w-full bg-white h-24"
                  placeholder="반려 처리의 상세 정당 사유를 적어주세요. 입점 파트너에게 전송됩니다."
                  required
                />
              </div>

              <div className="flex gap-3 justify-end mt-4 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  className="btn-secondary text-xs py-2 px-5"
                  onClick={() => setIsRejectOpen(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-5 bg-rose-600 hover:bg-rose-700"
                >
                  반려 처리 확정
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
