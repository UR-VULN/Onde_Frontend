/** 지도 탐색 기본 뷰포트 — 서울 시청 기준 */
export const DEFAULT_MAP_CENTER = {
  latitude: 37.5665,
  longitude: 126.978,
} as const;

export const DEFAULT_MAP_ZOOM = 11;
export const MAP_SEARCH_DEBOUNCE_MS = 280;
export const MAP_BOUNDS_PADDING = 0.12;

/** 뷰포트 밖 마커는 렌더하지 않음 (성능) */
export const MAP_VIEWPORT_MARKER_LIMIT = 80;
