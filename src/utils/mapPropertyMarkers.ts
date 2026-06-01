import type { PropertyMarkerDto } from '@/api/propertiesApi';
import type { MapStayItem } from '@/types/mapStay';

export type MapPropertyMarker = PropertyMarkerDto & { accommodationId?: number };

export function propertyMarkerToMapStay(marker: MapPropertyMarker): MapStayItem | null {
  if (!marker.name) return null;

  const accId = marker.accommodationId ?? marker.propertyId;
  const city = marker.name.split(',')[0]?.trim() ?? marker.name;

  return {
    id: `prop-${marker.propertyId}`,
    title: marker.name,
    location: marker.name,
    city,
    country: '',
    description: marker.name,
    ...(marker.thumbnailUrl?.trim() ? { imageUrl: marker.thumbnailUrl } : {}),
    ...(marker.minPrice != null && marker.minPrice > 0 ? { pricePerNight: marker.minPrice } : {}),
    tags: ['숙소'],
    soldOutDays: [],
    mileageDiscount: 0,
    latitude: marker.latitude,
    longitude: marker.longitude,
    accommodationId: accId,
    roomId: accId,
  };
}
