// 관리자 백오피스 목업 데이터

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
