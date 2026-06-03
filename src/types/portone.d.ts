export interface PortOnePaymentResponse {
  success: boolean;
  imp_uid?: string;
  merchant_uid?: string;
  paid_amount?: number;
  error_msg?: string;
}

export interface PortOneRequestPayParams {
  pg: string;
  pay_method: string;
  merchant_uid: string;
  name: string;
  amount: number;
  buyer_email?: string;
  buyer_name?: string;
  buyer_tel?: string;
  m_redirect_url?: string;
}

export interface PortOneInstance {
  init: (impCode: string) => void;
  request_pay: (
    params: PortOneRequestPayParams,
    callback: (rsp: PortOnePaymentResponse) => void
  ) => void;
}

declare global {
  interface Window {
    IMP?: PortOneInstance;
  }
}

export {};
