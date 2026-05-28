import { sellerAxios } from '@/api/axiosInstance';

// =============================================
// A팀: 계정 및 계좌 설정
// =============================================

// 사업자 진위 확인 요청 payload
export interface BusinessVerifyPayload {
  businessNumber: string;   // 사업자등록번호 (예: 123-45-67890)
  representativeName: string; // 대표자 성명
  openDate: string;          // 개업일자 (YYYYMMDD)
}

// 사업자 진위 확인 응답
export interface BusinessVerifyResponse {
  success: boolean;
  verified: boolean;
  message: string;
}

// 판매자 기본 업체 프로필 정보
export interface SellerProfileDto {
  businessName: string;     // 업체 상호명
  contactPhone: string;     // 고객센터 연락처
  address: string;          // 사업장 소재지
  businessNumber: string;   // 사업자등록번호
  representativeName: string;
  openDate: string;
  isBusinessVerified: boolean;
}

// 정산 계좌 정보
export interface SellerBankAccountDto {
  bankName: string;         // 정산 수령 은행
  accountNumber: string;    // 계좌번호 (마스킹 가능)
  accountHolder: string;    // 예금주 성명
}

// 사업자 진위 확인 API (공공 API 연동 예정)
export const verify_business_api = async (
  payload: BusinessVerifyPayload
): Promise<BusinessVerifyResponse> => {
  return sellerAxios.post('/api/v1/seller/account/verify-business', payload);
};

// 판매자 프로필 조회
export const get_seller_profile_api = async (): Promise<{ success: boolean; data: SellerProfileDto; message: string }> => {
  return sellerAxios.get('/api/v1/seller/account/profile');
};

// 판매자 프로필 저장 (사업자 진위 확인 완료 후에만 가능)
export interface SaveSellerProfilePayload {
  businessName: string;
  contactPhone: string;
  address: string;
  businessNumber: string;
  representativeName: string;
  openDate: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export const save_seller_profile_api = async (
  payload: SaveSellerProfilePayload
): Promise<{ success: boolean; message: string }> => {
  return sellerAxios.put('/api/v1/seller/account/profile', payload);
};

// =============================================
// D팀: 매출 통계 및 정산 대금
// =============================================

export interface SellerSalesStatDto {
  totalSalesAmount: number;
  completedBookingsCount: number;
  settlementPendingAmount: number;
  commissionRate: number;     // 수수료율 (0.10 = 10%)
  month: string;              // YYYY-MM
}

export interface SellerSettlementHistoryDto {
  settlementMonth: string;
  netAmount: number;
  status: string; // PENDING_REVIEW, PAID
  requestedAt: string;
}

export const get_seller_sales_stat_api = async (): Promise<{ success: boolean; data: SellerSalesStatDto; message: string }> => {
  return sellerAxios.get('/api/v1/seller/stats/sales');
};

export const get_seller_settlement_history_api = async (): Promise<{ success: boolean; data: SellerSettlementHistoryDto[]; message: string }> => {
  return sellerAxios.get('/api/v1/seller/stats/settlement-history');
};

export const request_monthly_settlement_api = async (): Promise<{ success: boolean; message: string }> => {
  return sellerAxios.post('/api/v1/seller/stats/request-settlement');
};

// =============================================
// E팀: 고객 리뷰 및 문의 응대
// =============================================

export interface SellerReviewDto {
  reviewId: number;
  guestName: string;
  guestInitials: string;
  rating: number;           // 1-5
  content: string;
  productName: string;
  reviewedAt: string;
  hostReply?: string;       // 호스트 답글 (없으면 null)
  repliedAt?: string;
}

export const get_seller_reviews_api = async (): Promise<{ success: boolean; data: SellerReviewDto[]; message: string }> => {
  return sellerAxios.get('/api/v1/seller/reviews');
};

export const post_seller_review_reply_api = async (
  reviewId: number,
  reply: string
): Promise<{ success: boolean; message: string }> => {
  return sellerAxios.post(`/api/v1/seller/reviews/${reviewId}/reply`, { reply });
};

export const update_seller_review_reply_api = async (
  reviewId: number,
  reply: string
): Promise<{ success: boolean; message: string }> => {
  return sellerAxios.put(`/api/v1/seller/reviews/${reviewId}/reply`, { reply });
};

export const delete_seller_review_reply_api = async (
  reviewId: number
): Promise<{ success: boolean; message: string }> => {
  return sellerAxios.delete(`/api/v1/seller/reviews/${reviewId}/reply`);
};

// =============================================
// C팀: 숙소/렌터카 재고 관리
// =============================================

export interface SellerPropertyDto {
  propertyId: number;
  name: string;
  type: 'STAY' | 'CAR';
  status: 'ACTIVE' | 'PENDING_REVIEW' | 'INACTIVE';
  basePrice: number;
  stockOrRooms: number;   // 차량 대수 or 객실 수
}

export const get_seller_properties_api = async (): Promise<{ success: boolean; data: SellerPropertyDto[]; message: string }> => {
  return sellerAxios.get('/api/v1/seller/properties');
};
