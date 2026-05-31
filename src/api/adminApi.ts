import { adminAxios } from '@/api/axiosInstance';

export interface PendingApprovalDto {
  requestId: number;
  productName: string;
  category: string;
  registeredBy: string;
  createdAt: string;
  details: string;
}

export interface PendingApprovalsResponse {
  content: PendingApprovalDto[];
  items?: PendingApprovalDto[];
  totalPages: number;
  totalElements: number;
  totalCount?: number;
}

/** 명세: GET /api/v1/admin/approvals/pending?type=FLIGHT|INSURANCE */
export const get_pending_approvals_api = async (
  type: string,
  page: number = 0,
  size: number = 20
): Promise<{ success: boolean; data: PendingApprovalsResponse; message: string }> => {
  return adminAxios.get('/api/v1/admin/approvals/pending', {
    params: { type, page, size },
  });
};

/** 명세: POST /api/v1/admin/approvals/{requestId} — action: APPROVE | REJECT */
export interface ProcessApprovalPayload {
  action: 'APPROVE' | 'REJECT';
  reason?: string;
}

export const process_approval_action_api = async (
  requestId: number,
  payload: ProcessApprovalPayload
): Promise<{ success: boolean; message: string }> => {
  const body =
    payload.action === 'REJECT'
      ? { action: 'REJECT', reason: payload.reason ?? '' }
      : { action: 'APPROVE', reason: payload.reason };
  return adminAxios.post(`/api/v1/admin/approvals/${requestId}`, body);
};

export interface AdminBookingDto {
  bookingId: number;
  bookingCode?: string;
  domain: string;
  customerName?: string;
  buyerName?: string;
  customerInfo?: string;
  productName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface AdminBookingsResponse {
  content: AdminBookingDto[];
  totalPages: number;
  totalElements: number;
}

export interface BookingSearchParams {
  keyword?: string;
  domain?: string;
  page: number;
  size: number;
}

/** 명세: GET /api/v1/admin/bookings */
export const get_all_bookings_api = async (
  params: BookingSearchParams
): Promise<{ success: boolean; data: AdminBookingsResponse; message: string }> => {
  return adminAxios.get('/api/v1/admin/bookings', { params });
};

/** 명세: GET /api/v1/admin/bookings/flights/{scheduleId}/export */
export const export_passenger_csv_stream_api = async (
  scheduleId: number,
  onProgress: (progressEvent: unknown) => void
): Promise<Blob> => {
  const response = await adminAxios.get(`/api/v1/admin/bookings/flights/${scheduleId}/export`, {
    responseType: 'blob',
    onDownloadProgress: (progressEvent) => {
      onProgress(progressEvent);
    },
  });
  return response as unknown as Blob;
};

/** 명세: DELETE /api/v1/reservations/{id} — 관리자 직권 취소는 별도 확장 전까지 예약 취소 API 사용 */
export const cancel_reservation_api = async (
  reservationId: number
): Promise<{ success: boolean; message: string }> => {
  return adminAxios.post(`/api/v1/admin/bookings/${reservationId}/cancel`);
};

/** @deprecated cancel_reservation_api 사용 */
export const admin_cancel_booking_api = cancel_reservation_api;

// ─── 명세 확장: 관리자 대시보드 · 회원 · LBS ───

export interface AdminDashboardDto {
  gmv: number;
  commission: number;
  newUsers: number;
  unresolvedReports: number;
  weeklyStays: number[];
  weeklyFlights: number[];
  domainShare: Array<{ label: string; pct: number; color: string }>;
}

export const get_admin_dashboard_api = async (): Promise<{
  success: boolean;
  data: AdminDashboardDto;
  message: string;
}> => {
  return adminAxios.get('/api/v1/admin/dashboard/summary');
};

export interface AdminMemberDto {
  id: number;
  email: string;
  role: string;
  status: string;
  isBlacklisted: boolean;
}

export interface AdminMembersResponse {
  members: AdminMemberDto[];
  totalCount: number;
}

export const get_admin_members_api = async (params?: {
  keyword?: string;
  page?: number;
  size?: number;
}): Promise<{ success: boolean; data: AdminMembersResponse; message: string }> => {
  return adminAxios.get('/api/v1/admin/members', { params });
};

export const patch_admin_member_api = async (
  memberId: number,
  payload: { role?: string; isBlacklisted?: boolean }
): Promise<{ success: boolean; message: string }> => {
  return adminAxios.patch(`/api/v1/admin/members/${memberId}`, payload);
};

export interface ReportedPostDto {
  id: number;
  content: string;
  reportedAt: string;
  isBlinded: boolean;
}

export const get_reported_posts_api = async (): Promise<{
  success: boolean;
  data: ReportedPostDto[];
  message: string;
}> => {
  return adminAxios.get('/api/v1/admin/posts/reported');
};

export const blind_reported_post_api = async (
  postId: number
): Promise<{ success: boolean; message: string }> => {
  return adminAxios.post(`/api/v1/admin/posts/${postId}/blind`);
};

export interface DeployPropertyMarkerPayload {
  name: string;
  latitude: number;
  longitude: number;
}

export const deploy_property_marker_api = async (
  payload: DeployPropertyMarkerPayload
): Promise<{ success: boolean; message: string }> => {
  return adminAxios.post('/api/v1/admin/properties/markers', payload);
};

export const deploy_mail_template_api = async (payload: {
  templateId: string;
  htmlContent: string;
}): Promise<{ success: boolean; message: string }> => {
  return adminAxios.put('/api/v1/admin/notifications/templates', payload);
};
