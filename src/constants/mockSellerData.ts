// 판매자 백오피스 목업 데이터

// ── SellerQAPanel ────────────────────────────────────────
export const MOCK_REVIEWS = [
  {
    reviewId: 1,
    guestName: '서지우 게스트',
    guestInitials: 'SJ',
    guestColor: '#005ce6',
    rating: 5,
    productName: '도쿄 신주쿠 펜트하우스',
    content: '온데 숙소가 너무 좋았어요! 신주쿠 역이랑도 가깝고 특히 밤에 보이는 야경이 펜트하우스 이름값 하네요. 다음에도 꼭 이용하고 싶습니다.',
    reviewedAt: '2026-10-15 14:20',
    hostReply: '서지우 고객님, 소중한 후기 감사드립니다! 야경을 만족해하셔서 저희도 정말 기쁩니다. 다음에 방문하시면 더 좋은 서비스로 보답하겠습니다.',
  },
  {
    reviewId: 2,
    guestName: '민경훈 게스트',
    guestInitials: 'MK',
    guestColor: '#ff5a5f',
    rating: 4,
    productName: '아사쿠사 에코 료칸',
    content: '전반적으로 좋았는데 엘리베이터 점검 시간이랑 겹쳐서 조금 기다렸네요. 미리 공지해주셨으면 좋았을 것 같아요.',
    reviewedAt: '2026-10-14 09:12',
    hostReply: undefined,
  },
  {
    reviewId: 3,
    guestName: '이채현 게스트',
    guestInitials: 'CH',
    guestColor: '#008a05',
    rating: 5,
    productName: '제네시스 G90',
    content: '차가 정말 깔끔하고 연비도 좋았어요. 렌트 과정도 간편하고 직원분들도 친절하셨습니다.',
    reviewedAt: '2026-10-12 18:45',
    hostReply: undefined,
  },
];

// ── SellerStatPanel ──────────────────────────────────────
export const MOCK_SETTLEMENT_HISTORY = [
  { settlementMonth: '2026-05', netAmount: 11205000, status: 'PENDING_REVIEW', requestedAt: '2026-05-31' },
  { settlementMonth: '2026-04', netAmount: 9840000,  status: 'PAID',           requestedAt: '2026-04-30' },
  { settlementMonth: '2026-03', netAmount: 8320000,  status: 'PAID',           requestedAt: '2026-03-31' },
];

export const MOCK_DAILY_SALES = [420000, 680000, 520000, 890000, 760000, 1200000, 980000];

export const MOCK_STAT_METRICS = {
  totalSales: 12450000,
  completedBookings: 158,
  settlementPending: 11205000,
  commissionRate: 0.10,
};

// ── SellerStayCarPanel ───────────────────────────────────
export const MOCK_STAYS = [
  { propertyId: 1,   name: '도쿄 신주쿠 펜트하우스', status: 'ACTIVE',  basePrice: 245000 },
  { propertyId: 2,   name: '아사쿠사 에코 료칸',     status: 'PENDING', basePrice: 125000 },
];

export const MOCK_CARS = [
  { propertyId: 101, name: '제네시스 G90',   stock: 4,  basePrice: 180000 },
  { propertyId: 102, name: '테슬라 모델 Y',  stock: 12, basePrice: 120000 },
];

export const MOCK_CALENDAR_INITIAL: Record<number, { stock: number; price: number; isClosed?: boolean }> = {
  24: { stock: 5, price: 245000 },
  25: { stock: 4, price: 245000 },
  26: { stock: 0, price: 0, isClosed: true },
  27: { stock: 2, price: 294000 },
  28: { stock: 5, price: 245000 },
  29: { stock: 5, price: 294000 },
  30: { stock: 5, price: 294000 },
};

// ── SellerAccountPanel ───────────────────────────────────
export const KOREAN_BANKS = [
  '신한은행', '국민은행', '우리은행', '하나은행', 'IBK기업은행',
  '농협은행', '카카오뱅크', '토스뱅크', 'SC제일은행', '씨티은행',
  '대구은행', '부산은행', '경남은행', '광주은행', '전북은행',
];

export const MOCK_ACCOUNT_DEFAULTS = {
  businessName: '온데 글로벌 리조트 파트너즈 주식회사',
  contactPhone: '02-1234-5678',
  address: '서울특별시 강남구 테헤란로 123',
  bankName: '신한은행',
};
