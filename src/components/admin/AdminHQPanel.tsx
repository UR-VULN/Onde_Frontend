import React, { useState, useEffect } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  get_pending_approvals_api,
  get_pending_accommodations_api,
  process_property_approval_action_api,
  process_approval_action_api,
  get_all_bookings_api,
  export_passenger_csv_stream_api
} from '@/api/adminApi';
import type {
  PendingApprovalDto,
  AdminBookingDto
} from '@/api/adminApi';
import { canApproveProducts, canExportBookingCsv } from '@/utils/adminPermissions';

// ── Constants ──────────────────────────────────────────────────────────────

const REJECT_PRESETS = [
  '공항 슬롯 시간대 중복',
  '숙소 가격 및 설명 불충분',
  '필수 서류 미제출',
  '중복 상품 등록 시도',
  '기타 (사유 직접 입력)',
];

const DOMAIN_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  FLIGHT:    { label: '항공',   bg: '#eef2ff', color: '#4338ca' },
  INSURANCE: { label: '보험',   bg: '#f5f3ff', color: '#7c3aed' },
  STAYS:     { label: '숙소',   bg: '#fff7ed', color: '#c2410c' },
  CARS:      { label: '렌터카', bg: '#f0fdf4', color: '#166534' },
};

const isPropertyApprovalCategory = (category?: string) =>
  category === 'STAYS' || category === 'CARS';

// ── Types ──────────────────────────────────────────────────────────────────

interface AdminHQPanelProps {
  defaultTab?: 'approval' | 'booking';
}

// ── Component ──────────────────────────────────────────────────────────────

export const AdminHQPanel: React.FC<AdminHQPanelProps> = ({ defaultTab = 'approval' }) => {
  const { addToast, memberRole } = useTravelStore();
  const canModerateProducts = canApproveProducts(memberRole);
  const canExportCsv = canExportBookingCsv(memberRole);

  const [activeTab, setActiveTab] = useState<'approval' | 'booking'>(defaultTab);

  // Approval — B팀 (항공·보험) and C팀 (숙소·렌터카)
  const [flightPendingList, setFlightPendingList] = useState<PendingApprovalDto[]>([]);
  const [staysPendingList,  setStaysPendingList]  = useState<PendingApprovalDto[]>([]);
  const [isRejectOpen,      setIsRejectOpen]      = useState(false);
  const [selectedRequest,   setSelectedRequest]   = useState<PendingApprovalDto | null>(null);
  const [rejectPreset,      setRejectPreset]      = useState('');
  const [rejectReason,      setRejectReason]      = useState('');

  // Booking
  const [searchMemberName, setSearchMemberName] = useState('');
  const [searchTargetType, setSearchTargetType] = useState<'ALL' | 'ACCOMMODATION' | 'CAR'>('ALL');
  const [searchStatus, setSearchStatus] = useState('');
  const [bookings, setBookings] = useState<AdminBookingDto[]>([]);

  // CSV streaming
  const [downloadingScheduleId, setDownloadingScheduleId] = useState<number | null>(null);
  const [csvProgress, setCsvProgress] = useState(0);

  // ── Data fetching ──────────────────────────────────────────────────────

  const fetchAllPendingApprovals = async () => {
    try {
      const [flightInsuranceRes, staysRes] = await Promise.allSettled([
        get_pending_approvals_api(),
        get_pending_accommodations_api(),
      ]);
      if (flightInsuranceRes.status === 'fulfilled' && flightInsuranceRes.value.success) {
        setFlightPendingList(flightInsuranceRes.value.data?.content ?? []);
      }
      if (staysRes.status === 'fulfilled' && staysRes.value.success) {
        const mapped: PendingApprovalDto[] = (staysRes.value.data ?? []).map((a) => ({
          requestId: a.id,
          productName: a.name,
          category: a.type === 'CAR' ? 'CARS' : 'STAYS',
          registeredBy: a.sellerId ? `seller-${a.sellerId}` : undefined,
          details: `${a.type ?? 'ACCOMMODATION'} / ${a.approvalStatus}`,
        }));
        setStaysPendingList(mapped);
      }
    } catch (err) {
      console.error('Failed to load approvals:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const params: Parameters<typeof get_all_bookings_api>[0] = {};
      if (searchMemberName.trim()) params.memberName = searchMemberName.trim();
      if (searchTargetType !== 'ALL') params.targetType = searchTargetType;
      if (searchStatus.trim()) params.status = searchStatus.trim();

      const res = await get_all_bookings_api(params);
      if (res.success && res.data) {
        setBookings(res.data.content);
      } else {
        addToast(res.message || '예약 목록 조회에 실패했습니다.', 'warning');
      }
    } catch (err: unknown) {
      const msg =
        (err as { error?: { message?: string } })?.error?.message ?? '예약 목록을 불러오지 못했습니다.';
      addToast(msg, 'warning');
    }
  };

  useEffect(() => {
    fetchAllPendingApprovals();
  }, []);

  useEffect(() => {
    if (activeTab === 'booking') fetchBookings();
  }, [activeTab]);

  // ── Handlers ───────────────────────────────────────────────────────────

  const handle_search_submit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handle_approve = async (requestId: number, category?: string) => {
    try {
      addToast('상품 등록 신청을 승인하고 실시간 노선 캐시를 갱신 중입니다...', 'info');
      if (isPropertyApprovalCategory(category)) {
        const res = await process_property_approval_action_api(
          requestId,
          category as 'STAYS' | 'CARS',
          'APPROVED'
        );
        if (res.success) {
          addToast(`${category === 'CARS' ? '렌터카' : '숙소'} 매물이 승인되었습니다.`, 'success');
          fetchAllPendingApprovals();
        }
        return;
      }
      const approvalCategory = category === 'INSURANCE' ? 'INSURANCE' : 'FLIGHT';
      const res = await process_approval_action_api(requestId, {
        category: approvalCategory,
        decision: 'APPROVED',
      });
      if (res.success) {
        addToast('성공적으로 승인 완료되었습니다. 일반 고객용 서비스 노출이 즉각 활성화됩니다.', 'success');
        fetchAllPendingApprovals();
      }
    } catch (err: any) {
      addToast(err?.error?.message || '승인 처리 중 오류 발생', 'warning');
    }
  };

  const handle_reject_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!rejectReason.trim()) {
      addToast('반려 필수 사유를 입력해 주세요.', 'warning');
      return;
    }
    try {
      addToast('상품 등록을 반려하고 기록 중입니다...', 'info');
      let res;
      if (isPropertyApprovalCategory(selectedRequest.category)) {
        res = await process_property_approval_action_api(
          selectedRequest.requestId,
          selectedRequest.category as 'STAYS' | 'CARS',
          'REJECTED',
          rejectReason
        );
      } else {
        const approvalCategory =
          selectedRequest.category === 'INSURANCE' ? 'INSURANCE' : 'FLIGHT';
        res = await process_approval_action_api(selectedRequest.requestId, {
          category: approvalCategory,
          decision: 'REJECTED',
          rejectReason: rejectReason,
        });
      }
      if (res.success) {
        addToast('노선 상품 심사 등록이 정당하게 반려 조치되었습니다.', 'success');
        setIsRejectOpen(false);
        setRejectPreset('');
        setRejectReason('');
        fetchAllPendingApprovals();
      }
    } catch (err: any) {
      addToast(err?.error?.message || '반려 처리 중 오류 발생', 'warning');
    }
  };

  const handle_global_csv_export = async () => {
    let scheduleId = flightPendingList.find((p) => p.category === 'FLIGHT')?.requestId;
    if (!scheduleId) {
      try {
        const res = await get_pending_approvals_api();
        scheduleId = res.data?.content?.find((p) => p.category === 'FLIGHT')?.requestId;
      } catch {
        scheduleId = undefined;
      }
    }
    if (!scheduleId) {
      addToast('항공 승인 대기 스케줄이 없어 CSV를 내보낼 수 없습니다.', 'warning');
      return;
    }
    handle_csv_stream_export(scheduleId);
  };

  const handle_csv_stream_export = async (scheduleId: number) => {
    try {
      setDownloadingScheduleId(scheduleId);
      setCsvProgress(0);
      addToast('대용량 탑승객 명단 CSV 파일 스트리밍 다운로드를 트리거합니다. OOM 방지 응답 중...', 'info');
      const blob = await export_passenger_csv_stream_api(scheduleId, (progressEvent: any) => {
        if (progressEvent.total) {
          setCsvProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        } else {
          setCsvProgress(Math.min(99, Math.round(progressEvent.loaded / 150)));
        }
      });
      setCsvProgress(100);
      addToast('탑승객 명단 CSV 대용량 다운로드가 100% 완료되었습니다.', 'success');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `passenger_manifest_schedule_${scheduleId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => setDownloadingScheduleId(null), 1000);
    } catch {
      addToast('CSV 다운로드 중 연결 끊김 오류가 발생했습니다.', 'warning');
      setDownloadingScheduleId(null);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────

  const renderDomainBadge = (domain: string) => {
    const info = DOMAIN_BADGE[domain] ?? { label: domain, bg: '#f1f5f9', color: '#64748b' };
    return (
      <span style={{ background: info.bg, color: info.color, padding: '0.2rem 0.65rem', borderRadius: '0.4rem', fontSize: '0.74rem', fontWeight: 800, display: 'inline-block' }}>
        {info.label}
      </span>
    );
  };

  const renderApprovalTable = (
    list: PendingApprovalDto[],
    teamLabel: string,
    teamIcon: string,
    badgeText: string,
    badgeBg: string,
    badgeColor: string
  ) => (
    <div className="data-table-container" style={{ marginBottom: '2rem' }}>
      {/* Sub-section header */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
        <h4 style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <i className={teamIcon}></i> {teamLabel}
        </h4>
        <span style={{ background: badgeBg, color: badgeColor, padding: '0.2rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.03em' }}>
          {badgeText}
        </span>
      </div>

      <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>요청 ID</th>
              <th>상품 구분</th>
              <th>상품/제안 명칭</th>
              <th>등록 판매자</th>
              <th className="text-center">상태</th>
              <th className="text-center">등록 요청일</th>
              <th>상세 구조</th>
              <th className="text-right">심사 집행</th>
            </tr>
          </thead>
          <tbody>
            {list.length > 0 ? (
              list.map((req) => (
                <tr key={req.requestId}>
                  <td className="font-black text-slate-900">#{req.requestId}</td>
                  <td>{renderDomainBadge(req.category)}</td>
                  <td className="font-bold text-slate-800">{req.productName}</td>
                  <td className="font-semibold text-slate-500">{req.registeredBy ?? '-'}</td>
                  <td className="text-center">
                    <span className="status-badge status-pending">검수대기</span>
                  </td>
                  <td className="text-center font-bold text-slate-400 text-xs">
                    {req.createdAt ? req.createdAt.split('T')[0] : '-'}
                  </td>
                  <td className="text-[11px] text-slate-400 font-mono max-w-[150px] truncate">{req.details}</td>
                  <td className="text-right">
                    {canModerateProducts ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="px-3.5 py-1.5 rounded-lg text-[11px] font-black shadow-sm transition-all active:scale-95 text-white"
                          style={{ background: '#008a05' }}
                          onClick={() => handle_approve(req.requestId, req.category)}
                        >
                          승인
                        </button>
                        <button
                          type="button"
                          className="px-3.5 py-1.5 rounded-lg text-[11px] font-black transition-all active:scale-95 text-white"
                          style={{ background: 'var(--secondary)' }}
                          onClick={() => {
                            setSelectedRequest(req);
                            setRejectPreset('');
                            setRejectReason('');
                            setIsRejectOpen(true);
                          }}
                        >
                          반려
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] font-black text-slate-400">조회 전용</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-400 font-bold">
                  검수 대기 상태의 신규 상품이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="admin-panel">

      {/* Section Header — title and description are tab-specific */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            {activeTab === 'approval'
              ? '입점 제안 상품 상세 검수 및 상태 관리'
              : '전사 예약 통합 관제 및 예외 직권 조치'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {activeTab === 'approval'
              ? '입점 파트너 제안 상품의 도메인별 심사 및 승인·반려 처리'
              : '전사 예약/보험 통합 관제 및 예외 직권 취소 조치 시스템'}
          </p>
        </div>

        {/* Global CSV button — booking tab only, matches prototype header layout */}
        {activeTab === 'booking' && canExportCsv && (
          <button
            type="button"
            className="btn-secondary"
            onClick={handle_global_csv_export}
            disabled={downloadingScheduleId !== null}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
          >
            <i className="fa-solid fa-file-csv" style={{ color: '#008a05' }}></i>
            대용량 예약 명단 CSV 스트림 추출
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', background: 'var(--bg-light)', padding: '0.35rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
          {(['approval', 'booking'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 700, transition: 'all 0.2s ease',
                background: activeTab === tab ? 'var(--bg-white)' : 'transparent',
                color:      activeTab === tab ? 'var(--primary)'  : 'var(--text-muted)',
                boxShadow:  activeTab === tab ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {tab === 'approval' ? '입점 승인 대기열' : '통합 예약 관제 보드'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab 1: Approval Queue ── */}
      {activeTab === 'approval' && (
        <>
          {renderApprovalTable(
            flightPendingList,
            '항공 및 보험 요율 심사 대기열',
            'fa-solid fa-plane-circle-check text-indigo-500',
            'FLIGHT & INSURANCE',
            '#e6f0ff', '#005ce6'
          )}
          {renderApprovalTable(
            staysPendingList,
            '숙소 및 렌터카 노출 승인 대기열',
            'fa-solid fa-house-circle-check text-emerald-600',
            'STAYS & CARS',
            '#e6ffe6', '#008a05'
          )}
        </>
      )}

      {/* ── Tab 2: Booking Control Dashboard ── */}
      {activeTab === 'booking' && (
        <div className="data-table-container p-6">

          {/* CSV Progress — inside container, matches prototype layout */}
          {downloadingScheduleId && (
            <div style={{ background: '#f0fdf4', border: '1px solid rgba(16,185,129,0.3)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: '#065f46' }}>
                <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i> JPA 청크 배치 fetch 중 — 대용량 명단 스트리밍</span>
                <span>{csvProgress}% 완료</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(16,185,129,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${csvProgress}%`, height: '100%', background: '#059669', transition: 'width 0.15s' }}></div>
              </div>
            </div>
          )}

          {/* Search / Filter */}
          <div className="mb-8 border-b border-slate-50 pb-5">
            <form onSubmit={handle_search_submit} className="flex gap-4 flex-wrap items-end">
              <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">예약자명</label>
                <input
                  type="text"
                  value={searchMemberName}
                  onChange={(e) => setSearchMemberName(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                  placeholder="회원 이름 검색"
                />
              </div>
              <div className="flex flex-col gap-2 w-44">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">대상 유형</label>
                <select
                  value={searchTargetType}
                  onChange={(e) => setSearchTargetType(e.target.value as typeof searchTargetType)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">전체</option>
                  <option value="ACCOMMODATION">숙소</option>
                  <option value="CAR">렌터카</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 w-44">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">예약 상태</label>
                <select
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-sm"
                >
                  <option value="">전체</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
              <button type="submit" className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black shadow-md hover:bg-emerald-700 transition-all active:scale-95 h-[45px]">
                조회 실행
              </button>
            </form>
          </div>

          {/* Bookings Table */}
          <table className="data-table">
            <thead>
              <tr>
                <th>예약 ID</th>
                <th>도메인</th>
                <th>예약자</th>
                <th>상품명</th>
                <th>체크인</th>
                <th>체크아웃</th>
                <th className="text-center">상태</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={`${booking.domain}-${booking.bookingId}`}>
                    <td className="font-black text-slate-900">#{booking.bookingId}</td>
                    <td>{renderDomainBadge(booking.domain)}</td>
                    <td className="font-bold text-slate-800">{booking.customerName || '—'}</td>
                    <td className="text-slate-600 font-semibold text-xs">{booking.productName}</td>
                    <td className="text-xs text-slate-500">{booking.checkInDate ?? '—'}</td>
                    <td className="text-xs text-slate-500">{booking.checkOutDate ?? '—'}</td>
                    <td className="text-center">
                      <span
                        className={`status-badge ${
                          booking.status.toUpperCase().includes('CANCEL') ? 'status-rejected' : 'status-active'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-24 text-slate-400 font-bold">
                    관제 필터 조건에 부합하는 예약 정보가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Reject Modal ─────────────────────────────────────────────────── */}
      {isRejectOpen && selectedRequest && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="app-modal" style={{ width: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                ❌ 입점 제안 상품 반려 통지
              </h3>
              <button type="button" style={{ color: 'var(--text-muted)' }} onClick={() => setIsRejectOpen(false)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '1.1rem' }}></i>
              </button>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              반려 처리 시 파트너 백오피스에 반려 사유 피드백과 상태값이 즉각 반영됩니다.{' '}
              <span style={{ fontWeight: 800, color: 'var(--text-dark)' }}>(#{selectedRequest.requestId})</span>
            </p>
            <form onSubmit={handle_reject_submit}>
              <div className="form-group">
                <label className="form-label">표준 반려 사유 선택</label>
                <select
                  className="form-input"
                  value={rejectPreset}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRejectPreset(val);
                    setRejectReason(val === '기타 (사유 직접 입력)' ? '' : val);
                  }}
                >
                  <option value="">— 사유를 선택하세요 —</option>
                  {REJECT_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">반려 상세 사유</label>
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
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.7rem', background: 'var(--secondary)', border: 'none' }}>반려 피드백 최종 전송</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
