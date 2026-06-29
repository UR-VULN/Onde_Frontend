export const DEFAULT_MEMBERSHIP_GRADE = 'BASIC MEMBER';

export const ROLE_BADGE_CLASS: Record<string, string> = {
  ROLE_USER: 'bg-blue-50 text-primary border-blue-100',
  ROLE_SELLER: 'bg-amber-50 text-amber-700 border-amber-100',
  ROLE_ADMIN: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

export const MAIL_TEMPLATES = [
  { id: 'booking', label: '[공통] 예약 확인서 HTML 자동 발송 폼' },
  { id: 'receipt', label: '[영수증] 발권 완료 PDF' },
];

export const DEFAULT_MAIL_HTML = '<div>ONDE 예약 성공 안내</div>';

export const KOREAN_BANKS = ['신한은행', '국민은행', '우리은행', '하나은행', '카카오뱅크'];

export const DEFAULT_FEED_PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800';
