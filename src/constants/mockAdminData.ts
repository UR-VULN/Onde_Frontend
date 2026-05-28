// 관리자 백오피스 목업 데이터
import type { PendingApprovalDto, AdminBookingDto } from '@/api/adminApi';

// ── AdminHQPanel — 상품 검수 목업 ────────────────────────────
export const MOCK_PENDING_APPROVALS_FLIGHT: PendingApprovalDto[] = [
  {
    requestId: 302,
    category: 'FLIGHT',
    productName: 'KE-023 (ICN → SFO) / 10.24 운항',
    registeredBy: 'Seller #501',
    createdAt: '2026-05-24T10:30:00',
    details: 'B737-900ER, 168석, 이코노미/비즈니스',
  },
  {
    requestId: 303,
    category: 'INSURANCE',
    productName: '골드 여행자 보험 플랜 (동남아 7일)',
    registeredBy: 'Seller #502',
    createdAt: '2026-05-25T14:15:00',
    details: '보상한도 3천만원, 의료실손 포함',
  },
  {
    requestId: 304,
    category: 'FLIGHT',
    productName: 'OZ-202 (GMP → CJU) / 11.01 운항',
    registeredBy: 'Seller #503',
    createdAt: '2026-05-26T08:20:00',
    details: 'A320, 180석, 이코노미 전석',
  },
];

export const MOCK_PENDING_APPROVALS_STAYS: PendingApprovalDto[] = [
  {
    requestId: 310,
    category: 'STAYS',
    productName: '도쿄 신주쿠 펜트하우스 스위트',
    registeredBy: 'Seller #520',
    createdAt: '2026-05-26T09:00:00',
    details: '4인실, 조식 포함, 금연, 도심 뷰',
  },
  {
    requestId: 311,
    category: 'CARS',
    productName: '나리타 공항 픽업 렌터카 (프리우스 하이브리드)',
    registeredBy: 'Seller #521',
    createdAt: '2026-05-27T11:30:00',
    details: '5인승, 자동, 네비 포함, 무제한 KM',
  },
];

// ── AdminHQPanel — 전사 예약 목업 ────────────────────────────
export const MOCK_BOOKINGS: AdminBookingDto[] = [
  {
    bookingId: 10294,
    domain: 'FLIGHT',
    bookingCode: 'AE-10294',
    customerName: 'Michael Smith',
    customerInfo: 'M12345678',
    productName: 'KE-023 (FIRST) / 10.24',
    totalAmount: 1100000,
    status: 'CONFIRMED',
    createdAt: '2026-05-20T09:00:00',
  },
  {
    bookingId: 10295,
    domain: 'INSURANCE',
    bookingCode: 'AE-10295',
    customerName: '김지훈',
    customerInfo: 'P23456789',
    productName: '골드 여행자 보험 (동남아 7일)',
    totalAmount: 89000,
    status: 'CONFIRMED',
    createdAt: '2026-05-21T11:30:00',
  },
  {
    bookingId: 10296,
    domain: 'FLIGHT',
    bookingCode: 'AE-10296',
    customerName: '이수민',
    customerInfo: 'K11111111',
    productName: 'OZ-202 (GMP → CJU) / 11.01',
    totalAmount: 450000,
    status: 'CONFIRMED',
    createdAt: '2026-05-22T14:00:00',
  },
  {
    bookingId: 10291,
    domain: 'FLIGHT',
    bookingCode: 'AE-10291',
    customerName: '박철수',
    customerInfo: 'K99887766',
    productName: 'KE-023 (ECONOMY) / 10.24',
    totalAmount: 550000,
    status: 'CANCELLED_BY_ADMIN',
    createdAt: '2026-05-18T08:45:00',
  },
];

// ── AdminDashboardPanel ──────────────────────────────────
export const MOCK_WEEKLY_STAYS   = [180, 240, 310, 280, 420, 580, 490];
export const MOCK_WEEKLY_FLIGHTS = [320, 410, 380, 460, 520, 690, 610];

export const MOCK_DASHBOARD_METRICS = {
  gmv: '₩1,245,000,000',
  commission: '₩124,500,000',
  newUsers: 2451,
  unresolvedReports: 4,
};

export const MOCK_DOMAIN_SHARE = [
  { label: '숙소',   pct: 42, color: '#005ce6' },
  { label: '항공권', pct: 25, color: '#ff5a5f' },
  { label: '렌터카', pct: 16, color: '#10b981' },
  { label: '보험',   pct: 17, color: '#f59e0b' },
];

// ── AdminUserPanel ───────────────────────────────────────
export const MOCK_USERS = [
  { id: 1023, email: 'buyer_shinjuku@gmail.com', role: 'ROLE_USER',   status: 'ACTIVE',    isBlacklisted: false },
  { id: 944,  email: 'seller_official@onde.com', role: 'ROLE_SELLER', status: 'ACTIVE',    isBlacklisted: false },
  { id: 1105, email: 'traveler_kim@naver.com',   role: 'ROLE_USER',   status: 'ACTIVE',    isBlacklisted: false },
  { id: 881,  email: 'spammer_bad@mail.xyz',     role: 'ROLE_USER',   status: 'BLACKLIST', isBlacklisted: true  },
];

export const ROLE_BADGE_CLASS: Record<string, string> = {
  ROLE_USER:   'bg-blue-50 text-primary border-blue-100',
  ROLE_SELLER: 'bg-amber-50 text-amber-700 border-amber-100',
  ROLE_ADMIN:  'bg-emerald-50 text-emerald-700 border-emerald-100',
};

// ── AdminLBSPanel ────────────────────────────────────────
export const MAIL_TEMPLATES = [
  { id: 'booking', label: '[공통] 예약 확인서 HTML 자동 발송 폼' },
  { id: 'receipt', label: '[영수증] 발권 완료 자동 빌드 PDF 영수증' },
  { id: 'notice',  label: '[공지] 서비스 점검 안내 푸시 템플릿' },
];

export const DEFAULT_MAIL_HTML = `<div style="font-family:'Pretendard'; max-width:600px; margin:0 auto; padding:40px; border:1px solid #eee;">
  <h2 style="color:#005ce6;">ONDE 예약 성공 안내</h2>
  <p>안녕하세요, <strong>{{userName}}</strong> 고객님!</p>
  <p>온데를 통해 예약하신 <strong>{{productName}}</strong> 상품의 결제가 정상적으로 완료되었습니다.</p>
  <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
  <ul style="list-style:none; padding:0;">
    <li>- 예약 번호: {{bookingCode}}</li>
    <li>- 일정: {{dateRange}}</li>
  </ul>
  <p style="font-size:12px; color:#999; margin-top:30px;">본 메일은 발신전용입니다.</p>
</div>`;

export const MOCK_REPORTED_POSTS = [
  { id: 1, content: '부적절한 광고성 댓글 (스팸 의심)',       reportedAt: '2026-05-28 09:12', isBlinded: false },
  { id: 2, content: '욕설 포함 의심 게시글 (S3 봇 감지)',    reportedAt: '2026-05-28 08:45', isBlinded: false },
];

export const MOCK_LBS_DEFAULTS = {
  markerName: '도쿄 신주쿠 스시로타운',
  latitude: '35.6905',
  longitude: '139.7001',
};
