/** 포트원 가맹점 식별코드 — .env.local 에 VITE_PORTONE_IMP_CODE 설정 */
export const PORTONE_IMP_CODE =
  import.meta.env.VITE_PORTONE_IMP_CODE ?? 'imp00000000';

/** PG사 구분코드 (테스트) */
export const PORTONE_PG =
  import.meta.env.VITE_PORTONE_PG ?? 'html5_inicis.INIpayTest';

export const PAYMENT_PRODUCT_NAME = 'ONDE 예약 상품 결제';
