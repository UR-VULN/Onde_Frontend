import { adminAxios } from '@/api/axiosInstance';

import { unwrapApi, unwrapPage } from '@/utils/apiResponse';

import { getMemberId, getMemberRole } from '@/utils/authCookies';
import {
  canReadDashboardCharts,
  canReadDashboardOperational,
  canReadDashboardSummary,
} from '@/utils/adminPermissions';



export interface PendingApprovalDto {

  requestId: number;

  productName: string;

  category: 'FLIGHT' | 'INSURANCE' | 'STAYS' | 'CARS';

  registeredBy?: string;

  createdAt?: string;

  details?: string;

}



export interface PendingApprovalsResponse {

  content: PendingApprovalDto[];

  totalCount: number;

}



/** GET /api/v1/admin/approvals/pending — category 생략 시 항공+보험 모두 조회 */

export const get_pending_approvals_api = async (

  category?: string

): Promise<{ success: boolean; data: PendingApprovalsResponse; message: string }> => {

  const raw = await adminAxios.get('/api/v1/admin/approvals/pending', {

    params: category ? { category } : undefined,

  });

  const res = unwrapApi<{

    pendingFlights?: Array<Record<string, unknown>>;

    pendingInsurances?: Array<Record<string, unknown>>;

  }>(raw);



  const content: PendingApprovalDto[] = [];



  (res.data.pendingFlights ?? []).forEach((f) => {

    content.push({

      requestId: Number(f.scheduleId ?? 0),

      productName: `${f.flightNumber ?? '항공'} (${f.departureAirport ?? ''}→${f.arrivalAirport ?? ''})`,

      category: 'FLIGHT',

      details: String(f.status ?? ''),

    });

  });



  (res.data.pendingInsurances ?? []).forEach((i) => {

    content.push({

      requestId: Number(i.productId ?? 0),

      productName: String(i.productName ?? '보험 상품'),

      category: 'INSURANCE',

      details: String(i.status ?? ''),

    });

  });



  return {

    success: res.success,

    message: res.message,

    data: { content, totalCount: content.length },

  };

};



export interface PendingAccommodationDto {

  id: number;

  type?: 'ACCOMMODATION' | 'CAR' | string;

  name: string;

  approvalStatus: string;

  sellerId?: number;

}



export const get_pending_accommodations_api = async (): Promise<{

  success: boolean;

  data: PendingAccommodationDto[];

  message: string;

}> => {

  const raw = await adminAxios.get('/api/v1/admin/accommodations/pending');

  const res = unwrapApi<{ items?: PendingAccommodationDto[]; totalCount?: number } | PendingAccommodationDto[]>(raw);

  const data = Array.isArray(res.data) ? res.data : res.data?.items ?? [];

  return { success: res.success, data, message: res.message };

};



export const update_accommodation_status_api = async (

  id: number,

  status: 'APPROVED' | 'REJECTED' | 'PENDING'

): Promise<{ success: boolean; message: string }> => {

  const raw = await adminAxios.put(`/api/v1/admin/accommodations/${id}/status`, {
    approvalStatus: status,
  });

  const res = unwrapApi<unknown>(raw);

  return { success: res.success, message: res.message };

};



/** 백엔드 AdminApprovalRequest */

export interface ProcessApprovalPayload {

  category: 'FLIGHT' | 'INSURANCE';

  decision: 'APPROVED' | 'REJECTED';

  rejectReason?: string;

}



export const process_approval_action_api = async (

  requestId: number,

  payload: ProcessApprovalPayload

): Promise<{ success: boolean; message: string }> => {

  const raw = await adminAxios.post(`/api/v1/admin/approvals/${requestId}`, {

    category: payload.category,

    decision: payload.decision,

    rejectReason: payload.rejectReason,

  });

  const res = unwrapApi<unknown>(raw);

  return { success: res.success, message: res.message };

};

export type PropertyApprovalCategory = 'STAYS' | 'CARS' | 'ACCOMMODATION' | 'CAR';

export const process_property_approval_action_api = async (

  targetId: number,

  category: PropertyApprovalCategory,

  status: 'APPROVED' | 'REJECTED' | 'PENDING',

  rejectReason?: string

): Promise<{ success: boolean; message: string }> => {

  const approvalType = category === 'CARS' || category === 'CAR' ? 'CAR' : 'ACCOMMODATION';

  const raw = await adminAxios.post('/api/v1/admin/approvals/process', {

    approvalType,

    targetId,

    status,

    rejectReason,

  });

  const res = unwrapApi<unknown>(raw);

  return { success: res.success, message: res.message };

};



export interface AdminBookingDto {

  bookingId: number;

  reservationId: number;

  domain: 'STAYS' | 'CARS';

  customerName: string;

  productName: string;

  status: string;

  checkInDate?: string;

  checkOutDate?: string;

}



export interface AdminBookingsResponse {

  content: AdminBookingDto[];

  totalCount: number;

}



/** 백엔드 AdminBookingSearchRequest */

export interface BookingSearchParams {

  targetType?: 'ACCOMMODATION' | 'CAR';

  status?: string;

  memberName?: string;

  startDate?: string;

  endDate?: string;

}



/** GET /api/v1/admin/reservations */

export const get_all_bookings_api = async (

  params: BookingSearchParams

): Promise<{ success: boolean; data: AdminBookingsResponse; message: string }> => {

  const query: Record<string, string> = {};

  if (params.targetType) query.targetType = params.targetType;

  if (params.status) query.status = params.status;

  if (params.memberName) query.memberName = params.memberName;

  if (params.startDate) query.startDate = params.startDate;

  if (params.endDate) query.endDate = params.endDate;



  const raw = await adminAxios.get('/api/v1/admin/reservations', { params: query });

  const res = unwrapApi<{ bookings: Array<Record<string, unknown>>; totalCount: number }>(raw);

  const bookings = res.data?.bookings ?? [];

  const content: AdminBookingDto[] = bookings.map((b) => ({

    bookingId: Number(b.reservationId ?? 0),

    reservationId: Number(b.reservationId ?? 0),

    domain: params.targetType === 'CAR' ? 'CARS' : 'STAYS',

    customerName: String(b.memberName ?? ''),

    productName: String(b.targetName ?? ''),

    status: String(b.status ?? ''),

    checkInDate: b.checkInDate ? String(b.checkInDate).slice(0, 10) : undefined,

    checkOutDate: b.checkOutDate ? String(b.checkOutDate).slice(0, 10) : undefined,

  }));

  return {

    success: res.success,

    message: res.message,

    data: { content, totalCount: res.data?.totalCount ?? content.length },

  };

};



export const export_passenger_csv_stream_api = async (

  scheduleId: number,

  onProgress: (progressEvent: unknown) => void

): Promise<Blob> => {

  const response = await adminAxios.get(`/api/v1/admin/bookings/flights/${scheduleId}/export`, {

    responseType: 'blob',

    onDownloadProgress: (progressEvent) => onProgress(progressEvent),

  });

  return response as unknown as Blob;

};



export const cancel_reservation_api = async (

  bookingId: number

): Promise<{ success: boolean; message: string }> => {

  const raw = await adminAxios.post(`/api/v1/admin/bookings/${bookingId}/cancel`);

  const res = unwrapApi<unknown>(raw);

  return { success: res.success, message: res.message };

};



export const admin_cancel_booking_api = cancel_reservation_api;



export interface AdminDashboardDto {

  gmv: number;

  totalBookings: number;

  pendingSettlements: number;

  newMembersToday: number;

  blindedPosts: number;

  domainShare: Array<{ label: string; pct: number; color: string }>;

  byDomain: Record<string, number>;

}



const DOMAIN_COLORS: Record<string, string> = {

  항공: '#4338ca',

  숙소: '#c2410c',

  렌터카: '#166534',

  보험: '#7c3aed',

};



function currentMonthParam(): string {

  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

}

export const get_admin_dashboard_api = async (

  month = currentMonthParam()

): Promise<{ success: boolean; data: AdminDashboardDto; message: string }> => {

  const role = getMemberRole();
  const canReadSummary = canReadDashboardSummary(role);
  const canReadOperational = canReadDashboardOperational(role);
  const canReadCharts = canReadDashboardCharts(role);

  const [summaryRaw, chartsRaw, operationalRaw] = await Promise.all([

    canReadSummary
      ? adminAxios.get('/api/v1/admin/dashboard/summary', { params: { month } })
      : Promise.resolve(null),

    canReadCharts
      ? adminAxios.get('/api/v1/admin/dashboard/charts', { params: { month } })
      : Promise.resolve(null),

    canReadOperational
      ? adminAxios.get('/api/v1/admin/dashboard/operational')
      : Promise.resolve(null),

  ]);



  const summary = summaryRaw
    ? unwrapApi<Record<string, unknown>>(summaryRaw)
    : { success: false, message: '대시보드 요약 권한 없음', data: {} };

  const charts = chartsRaw
    ? unwrapApi<Record<string, unknown>>(chartsRaw)
    : { success: false, message: '대시보드 차트 권한 없음', data: {} };

  const operational = operationalRaw
    ? unwrapApi<Record<string, unknown>>(operationalRaw)
    : { success: false, message: '운영 지표 권한 없음', data: {} };



  const s = summary.data ?? {};

  const byDomain = (s.byDomain as Record<string, number>) ?? {};



  const segments = (charts.data?.segments as Array<Record<string, unknown>>) ?? [];

  const domainShare = segments.map((seg) => {

    const label = String(seg.domain ?? '');

    const ratio = Number(seg.ratio ?? 0);

    return {

      label,

      pct: Math.round(ratio * 1000) / 10,

      color: DOMAIN_COLORS[label] ?? '#64748b',

    };

  });



  const op = operational.data ?? {};



  return {

    success: summary.success || charts.success || operational.success,

    message: [summary.message, charts.message, operational.message].filter(Boolean).join(' / '),

    data: {

      gmv: Number(s.totalRevenue ?? 0),

      totalBookings: Number(s.totalBookings ?? 0),

      pendingSettlements: Number(s.pendingSettlements ?? 0),

      newMembersToday: Number(op.newMembersToday ?? 0),

      blindedPosts: Number(op.blindedPosts ?? 0),

      domainShare,

      byDomain: {

        flight: Number(byDomain.flight ?? 0),

        accommodation: Number(byDomain.accommodation ?? 0),

        car: Number(byDomain.car ?? 0),

        insurance: Number(byDomain.insurance ?? 0),

      },

    },

  };

};



export interface AdminMemberDto {

  id: number;

  email: string;

  role: string;

  status: string;

  provider?: string;

  name?: string;

  isBlacklisted: boolean;

}



export interface AdminMembersResponse {

  members: AdminMemberDto[];

  totalCount: number;

}



export const get_admin_members_api = async (params?: {

  keyword?: string;
  name?: string;
  role?: string;
  status?: string;

  page?: number;

  size?: number;

}): Promise<{ success: boolean; data: AdminMembersResponse; message: string }> => {

  const query = {
    ...params,
    name: params?.name ?? params?.keyword,
  };

  if (!query.name) {
    delete query.name;
  }

  const raw = await adminAxios.get('/api/v1/admin/members', { params: query });

  const res = unwrapApi<{
    members?: Array<{
      id?: number;
      memberId?: number;
      email: string;
      name?: string;
      role: string;
      status: string;
      provider?: string;
    }>;
    totalCount?: number;
  }>(raw);

  const page = unwrapPage<{
    id?: number;
    memberId?: number;
    email: string;
    name?: string;
    role: string;
    status: string;
    provider?: string;
  }>(res.data);

  const members: AdminMemberDto[] = page.items.map((m) => ({

    id: Number(m.memberId ?? m.id ?? 0),

    email: m.email,

    role: m.role?.startsWith('ROLE_') ? m.role : `ROLE_${m.role}`,

    status: m.status,

    provider: m.provider,

    name: m.name,

    isBlacklisted:
      m.role === 'BLACKLIST' ||
      m.role === 'ROLE_BLACKLIST' ||
      m.status === 'BANNED' ||
      m.status === 'BLACKLIST' ||
      m.status === 'BLACKLISTED',

  }));

  return {

    success: true,

    data: { members, totalCount: page.totalCount },

    message: res.message,

  };

};



export const patch_admin_member_role_api = async (

  memberId: number,

  newRole: string

): Promise<{ success: boolean; message: string }> => {

  try {

    const role = newRole.replace(/^ROLE_/, '');
    const raw = await adminAxios.patch(`/api/v1/admin/roles/${memberId}`, { roles: [role] });
    const res = unwrapApi<unknown>(raw);

    return { success: res.success, message: res.message || '권한이 변경되었습니다.' };

  } catch (err: unknown) {

    const msg =

      (err as { error?: { message?: string } })?.error?.message ?? '권한 변경에 실패했습니다.';

    return { success: false, message: msg };

  }

};



export const blacklist_admin_member_api = async (

  memberId: number,
  reason = '관리자 블랙리스트 처리'

): Promise<{ success: boolean; message: string }> => {

  try {

    const raw = await adminAxios.post(`/api/v1/admin/members/${memberId}/blacklist`, { reason });
    const res = unwrapApi<unknown>(raw);

    return {

      success: res.success,

      message: res.message || '블랙리스트 처리되었습니다.',

    };

  } catch (err: unknown) {

    const msg =

      (err as { error?: { message?: string } })?.error?.message ?? '블랙리스트 처리에 실패했습니다.';

    return { success: false, message: msg };

  }

};



/** @deprecated 역할/블랙리스트 전용 API 사용 */

export const patch_admin_member_api = async (

  memberId: number,

  payload: { role?: string; isBlacklisted?: boolean }

): Promise<{ success: boolean; message: string }> => {

  if (payload.isBlacklisted != null) {

    if (payload.isBlacklisted) return blacklist_admin_member_api(memberId);

    return { success: false, message: '블랙리스트 해제는 백엔드 미지원입니다.' };

  }

  if (payload.role) {

    const roleValue = payload.role.replace(/^ROLE_/, '');

    return patch_admin_member_role_api(memberId, roleValue);

  }

  return { success: false, message: '변경할 항목이 없습니다.' };

};



export const patch_admin_member_status_api = async (

  memberId: number,

  status: string

): Promise<{ success: boolean; message: string }> => {

  try {

    const raw = await adminAxios.patch(`/api/v1/admin/members/${memberId}/status`, { status });

    const res = unwrapApi<unknown>(raw);

    return { success: res.success, message: res.message || '상태가 변경되었습니다.' };

  } catch (err: unknown) {

    const msg =

      (err as { error?: { message?: string } })?.error?.message ?? '상태 변경에 실패했습니다.';

    return { success: false, message: msg };

  }

};



export const blind_reported_post_api = async (

  postId: number,

  reason: string

): Promise<{ success: boolean; message: string }> => {

  const raw = await adminAxios.patch(`/api/v1/admin/posts/${postId}/blind`, { reason });

  const res = unwrapApi<unknown>(raw);

  return { success: res.success, message: res.message };

};



export type MarkerCategory = 'RESTAURANT' | 'ATTRACTION' | 'CAFE';



export interface DeployPropertyMarkerPayload {

  name: string;

  latitude: number;

  longitude: number;

  category: MarkerCategory;

}



export const deploy_property_marker_api = async (

  payload: DeployPropertyMarkerPayload

): Promise<{ success: boolean; message: string }> => {

  const adminId = getMemberId();

  const raw = await adminAxios.post('/api/v1/admin/markers', payload, {
    headers: adminId ? { 'X-Admin-Id': String(adminId) } : undefined,
  });

  const res = unwrapApi<unknown>(raw);

  return { success: res.success, message: res.message };

};



export interface ReportedPostDto {

  id: number;

  content: string;

  reportedAt: string;

  isBlinded: boolean;

}



/** 백엔드 미구현 — UI 유지용 no-op */

export const get_reported_posts_api = async (): Promise<{

  success: boolean;

  data: ReportedPostDto[];

  message: string;

}> => {

  return { success: true, data: [], message: '신고 게시글 API 미구현' };

};



/** 백엔드 미구현 — UI 유지용 no-op */

export const deploy_mail_template_api = async (_payload: {

  templateId: string;

  htmlContent: string;

}): Promise<{ success: boolean; message: string }> => {

  return { success: false, message: '메일 템플릿 API는 백엔드에 아직 없습니다.' };

};



export interface AdminSettlementDto {
  settlementId: number;
  settlementMonth: string;
  grossAmount: number;
  commission: number;
  netAmount: number;
  status: string;
  sellerId?: number;
  sellerName?: string;
  bankName?: string;
  accountNumber?: string;
}

export interface AdminSettlementsResponse {
  settlements: AdminSettlementDto[];
  totalCount: number;
}

export const get_admin_settlements_api = async (
  status?: string,
  page = 0,
  size = 20
): Promise<{ success: boolean; data: AdminSettlementsResponse; message: string }> => {
  const raw = await adminAxios.get('/api/v1/admin/settlements', { params: { status, page, size } });
  const res = unwrapApi<{ settlements: AdminSettlementDto[]; totalCount: number }>(raw);
  return {
    success: res.success,
    message: res.message,
    data: {
      settlements: res.data?.settlements ?? [],
      totalCount: res.data?.totalCount ?? 0,
    },
  };
};

export const approve_first_settlement_api = async (
  settlementId: number,
  comment?: string
): Promise<{ success: boolean; message: string }> => {
  const raw = await adminAxios.post(`/api/v1/admin/settlements/${settlementId}/approve-first`, { comment: comment ?? '' });
  const res = unwrapApi<unknown>(raw);
  return { success: res.success, message: res.message };
};

export const finalize_settlement_api = async (
  settlementId: number,
  comment?: string
): Promise<{ success: boolean; message: string }> => {
  const raw = await adminAxios.post(`/api/v1/admin/settlements/${settlementId}/finalize`, { comment: comment ?? '' });
  const res = unwrapApi<unknown>(raw);
  return { success: res.success, message: res.message };
};

// ── Admin Community API DTOs ──
export interface AdminPostDto {
  postId: number;
  type: string;
  title: string;
  content: string;
  rating: number;
  createdAt: string;
  status: string;
  imageUrls: string[];
  authorName: string;
}

export interface AdminPostsResponse {
  content: AdminPostDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ── Admin Community API Calls ──
export const get_admin_posts_api = async (
  status?: string,
  page = 0,
  size = 20
): Promise<{ success: boolean; data: AdminPostsResponse; message: string }> => {
  const raw = await adminAxios.get('/api/v1/admin/posts', {
    params: {
      status: status || undefined,
      page,
      size,
    },
  });
  const res = unwrapApi<any>(raw);
  
  // 백엔드 Page<AdminPostDetailResponse>의 content 매핑
  const rawContent = res.data?.content ?? [];
  const content: AdminPostDto[] = rawContent.map((item: any) => ({
    postId: item.postId,
    type: item.type,
    title: item.title,
    content: item.content,
    rating: item.rating,
    createdAt: item.createdAt,
    status: item.status,
    imageUrls: item.imageUrls ?? [],
    authorName: item.authorName,
  }));

  return {
    success: res.success,
    message: res.message,
    data: {
      content,
      totalElements: res.data?.totalElements ?? 0,
      totalPages: res.data?.totalPages ?? 0,
      size: res.data?.size ?? 20,
      number: res.data?.number ?? 0,
    },
  };
};

export const get_admin_post_detail_api = async (
  postId: number
): Promise<{ success: boolean; data: AdminPostDto; message: string }> => {
  const raw = await adminAxios.get(`/api/v1/admin/posts/${postId}`);
  const res = unwrapApi<any>(raw);
  
  const item = res.data ?? {};
  const data: AdminPostDto = {
    postId: item.postId,
    type: item.type,
    title: item.title,
    content: item.content,
    rating: item.rating,
    createdAt: item.createdAt,
    status: item.status,
    imageUrls: item.imageUrls ?? [],
    authorName: item.authorName,
  };

  return {
    success: res.success,
    message: res.message,
    data,
  };
};

export const delete_admin_post_api = async (
  postId: number
): Promise<{ success: boolean; message: string }> => {
  const raw = await adminAxios.delete(`/api/v1/admin/posts/${postId}`);
  const res = unwrapApi<unknown>(raw);
  return { success: res.success, message: res.message };
};

export const blind_admin_post_api = async (
  postId: number,
  reason: string
): Promise<{ success: boolean; message: string }> => {
  const raw = await adminAxios.patch(`/api/v1/admin/posts/${postId}/blind`, { reason });
  const res = unwrapApi<unknown>(raw);
  return { success: res.success, message: res.message };
};

export const restore_admin_post_api = async (
  postId: number
): Promise<{ success: boolean; message: string }> => {
  const raw = await adminAxios.post(`/api/v1/admin/posts/${postId}/restore`);
  const res = unwrapApi<unknown>(raw);
  return { success: res.success, message: res.message };
};


