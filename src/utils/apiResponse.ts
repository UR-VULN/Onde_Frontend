/** 백엔드 ApiResponse<T> 또는 비래핑 응답 통합 처리 */

export interface ApiResult<T> {

  success: boolean;

  data: T;

  message: string;

}



const TECHNICAL_MESSAGE_PATTERNS = [

  /exception/i,

  /java\./i,

  /org\.springframework/i,

  /org\.hibernate/i,

  /jdbc/i,

  /\bsql\b/i,

  /propertykey/i,

  /failed:/i,

  /^unknown\s/i,

  /generation failed/i,

  /nullpointer/i,

  /stack\s*trace/i,

];



const DEFAULT_SERVER_ERROR_MESSAGE =

  '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';



export function isApiEnvelope(raw: unknown): raw is ApiResult<unknown> {

  return (

    raw != null &&

    typeof raw === 'object' &&

    'success' in raw &&

    'data' in raw

  );

}



export function unwrapApi<T>(raw: unknown, fallbackMessage = ''): ApiResult<T> {

  if (isApiEnvelope(raw)) {

    const envelope = raw as ApiResult<T>;

    return {

      success: envelope.success !== false,

      data: envelope.data,

      message: envelope.message ?? fallbackMessage,

    };

  }

  return { success: true, data: raw as T, message: fallbackMessage };

}



function containsHangul(text: string): boolean {

  return /[\u3131-\uD79D]/.test(text);

}



/** 서버·프레임워크 내부 메시지 여부 (Toast/UI 노출 금지) */

export function isTechnicalClientMessage(message: string): boolean {

  const trimmed = message.trim();

  if (!trimmed) {

    return true;

  }

  if (TECHNICAL_MESSAGE_PATTERNS.some((pattern) => pattern.test(trimmed))) {

    return true;

  }

  return !containsHangul(trimmed) && /[A-Za-z]{4,}/.test(trimmed);

}



function pickRawClientMessage(err: unknown): string | undefined {

  if (err == null || typeof err !== 'object') {

    return undefined;

  }

  const body = err as {

    message?: string;

    error?: { message?: string };

  };

  if (typeof body.message === 'string' && body.message.trim()) {

    return body.message.trim();

  }

  if (typeof body.error?.message === 'string' && body.error.message.trim()) {

    return body.error.message.trim();

  }

  return undefined;

}



/** Axios reject payload를 클라이언트 안전 형태로 정규화 (systemMessage 제거) */

export function toClientSafeErrorPayload(

  raw: unknown,

  httpStatus?: number,

  fallback = DEFAULT_SERVER_ERROR_MESSAGE,

): { success: false; message: string; status?: number; error: { message: string } } {

  const message = extractApiErrorMessage(raw, fallback, httpStatus);

  return {

    success: false,

    message,

    status: httpStatus,

    error: { message },

  };

}



/** Spring ErrorResponse 등에서 사용자용 메시지만 추출 (systemMessage 미사용) */

export function extractApiErrorMessage(

  err: unknown,

  fallback = DEFAULT_SERVER_ERROR_MESSAGE,

  httpStatus?: number,

): string {

  if (httpStatus !== undefined && httpStatus >= 500) {

    return fallback;

  }



  const candidate = pickRawClientMessage(err);

  if (!candidate || isTechnicalClientMessage(candidate)) {

    return fallback;

  }

  if (candidate.length > 200) {

    return fallback;

  }

  return candidate;

}



/** Spring Page<T> → 배열 추출 */

export function unwrapPage<T>(raw: unknown): { items: T[]; totalCount: number; totalPages: number } {

  if (!raw || typeof raw !== 'object') {

    return { items: [], totalCount: 0, totalPages: 0 };

  }

  const obj = raw as Record<string, unknown>;

  const content = (obj.content ?? obj.members ?? obj.bookings ?? obj.items) as T[] | undefined;

  const items = Array.isArray(content) ? content : [];

  const totalCount = Number(obj.totalElements ?? obj.totalCount ?? items.length);

  const totalPages = Number(obj.totalPages ?? 1);

  return { items, totalCount, totalPages };

}


