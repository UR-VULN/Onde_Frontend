import type { MapStayItem } from '@/types/mapStay';

export interface MapBounds {
  south: number;
  north: number;
  west: number;
  east: number;
}

export function filterStaysByQuery(stays: MapStayItem[], query: string): MapStayItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return stays;

  return stays.filter((stay) => {
    const haystack = [stay.title, stay.location, stay.city, stay.country, stay.description, ...stay.tags]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

/** 현재 지도 영역 안 숙소만 (마커 수 제한으로 렌더 부하 감소) */
export function filterStaysInBounds(stays: MapStayItem[], bounds: MapBounds | null): MapStayItem[] {
  if (!bounds) return stays;

  return stays.filter(
    (stay) =>
      stay.latitude >= bounds.south &&
      stay.latitude <= bounds.north &&
      stay.longitude >= bounds.west &&
      stay.longitude <= bounds.east
  );
}

export function boundsFromLeaflet(
  leafletBounds: { getSouth: () => number; getNorth: () => number; getWest: () => number; getEast: () => number }
): MapBounds {
  return {
    south: leafletBounds.getSouth(),
    north: leafletBounds.getNorth(),
    west: leafletBounds.getWest(),
    east: leafletBounds.getEast(),
  };
}

export function stayMatchesCityArea(stay: MapStayItem, areaLabel: string): boolean {
  const area = areaLabel.trim().toLowerCase();
  if (!area) return true;
  return (
    stay.city.toLowerCase().includes(area) ||
    stay.location.toLowerCase().includes(area) ||
    stay.country.toLowerCase().includes(area)
  );
}
