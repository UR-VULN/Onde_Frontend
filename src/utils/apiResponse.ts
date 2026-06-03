/** 백엔드 ApiResponse<T> 또는 비래핑 응답 통합 처리 */
export interface ApiResult<T> {
  success: boolean;
  data: T;
  message: string;
}

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
