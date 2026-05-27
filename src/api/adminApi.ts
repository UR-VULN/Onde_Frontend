import { adminAxios } from '@/api/axiosInstance';

// 1. 어드민용 검수 대기 상품(노선/스케줄/보험) 목록 조회
export interface PendingApprovalDto {
  requestId: number;
  productName: string;
  category: string; // FLIGHT, INSURANCE
  registeredBy: string;
  createdAt: string;
  details: string;
}

export interface PendingApprovalsResponse {
  content: PendingApprovalDto[];
  totalPages: number;
  totalElements: number;
}

export const get_pending_approvals_api = async (domain: string, page: number = 0, size: number = 10): Promise<{ success: boolean; data: PendingApprovalsResponse; message: string }> => {
  return adminAxios.get('/api/v1/admin/approvals/pending', {
    params: { domain, page, size }
  });
};

// 2. 어드민용 상품 승인 또는 반려 처리
export interface ProcessApprovalPayload {
  action: 'APPROVED' | 'REJECTED';
  rejectReason?: string;
}

export const process_approval_action_api = async (requestId: number, payload: ProcessApprovalPayload): Promise<{ success: boolean; message: string }> => {
  return adminAxios.post(`/api/v1/admin/approvals/${requestId}`, payload);
};

// 3. 어드민용 전사 예약/보험 가입 통합 모니터링 조회
export interface AdminBookingDto {
  bookingId: number;
  bookingCode: string;
  domain: string; // FLIGHT, INSURANCE
  customerName: string;
  customerInfo: string;
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
  domain?: string; // ALL, FLIGHT, INSURANCE
  page: number;
  size: number;
}

export const get_all_bookings_api = async (params: BookingSearchParams): Promise<{ success: boolean; data: AdminBookingsResponse; message: string }> => {
  return adminAxios.get('/api/v1/admin/bookings', { params });
};

// 4. 어드민용 특정 항공 스케줄 탑승객 명단 CSV 스트리밍 다운로드 (Progress Bar 트래킹 지원)
export const export_passenger_csv_stream_api = async (
  scheduleId: number,
  onProgress: (progressEvent: any) => void
): Promise<Blob> => {
  const response = await adminAxios.get(`/api/v1/admin/bookings/flights/${scheduleId}/export`, {
    responseType: 'blob',
    onDownloadProgress: (progressEvent) => {
      onProgress(progressEvent);
    }
  });
  // Response interceptor가 response.data(즉 blob)를 반환할 것입니다.
  return response as any;
};

// 5. 어드민용 항공 임시/확정 예약 직권 수동 강제 취소 및 좌석 원자 복원
export const admin_cancel_booking_api = async (bookingId: number): Promise<{ success: boolean; message: string }> => {
  return adminAxios.post(`/api/v1/admin/bookings/${bookingId}/cancel`);
};
