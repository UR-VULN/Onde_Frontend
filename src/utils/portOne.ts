import { PORTONE_IMP_CODE } from '@/constants/paymentConfig';
import type { PortOnePaymentResponse, PortOneRequestPayParams } from '@/types/portone';

const SCRIPT_SRC = 'https://cdn.iamport.kr/v1/iamport.js';

let scriptLoading: Promise<void> | null = null;

function loadPortOneScript(): Promise<void> {
  if (window.IMP) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('포트원 SDK 로드 실패')));
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('포트원 SDK 로드 실패'));
    document.body.appendChild(script);
  });

  return scriptLoading;
}

export async function requestPortOnePay(
  params: PortOneRequestPayParams
): Promise<PortOnePaymentResponse> {
  await loadPortOneScript();

  if (!window.IMP) {
    throw new Error('포트원 SDK를 초기화할 수 없습니다.');
  }

  window.IMP.init(PORTONE_IMP_CODE);

  return new Promise((resolve) => {
    window.IMP!.request_pay(params, (rsp) => resolve(rsp));
  });
}
