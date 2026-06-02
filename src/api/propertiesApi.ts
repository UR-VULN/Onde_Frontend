import { userAxios } from '@/api/axiosInstance';
import { unwrapApi } from '@/utils/apiResponse';

export interface PropertyMarkerDto {
  propertyId: number;
  accommodationId?: number;
  name: string;
  latitude: number;
  longitude: number;
  thumbnailUrl?: string;
  minPrice?: number;
}

export interface PropertiesResponse {
  properties: PropertyMarkerDto[];
  totalCount: number;
}

export interface PropertiesBoundsParams {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

interface BackendPropertyMarker {
  propertyId: number;
  addressName: string;
  name?: string;
  latitude: number;
  longitude: number;
  memberId?: number;
}

function mapMarker(item: BackendPropertyMarker): PropertyMarkerDto {
  return {
    propertyId: item.propertyId,
    accommodationId: item.propertyId,
    name: item.addressName ?? item.name ?? '',
    latitude: item.latitude,
    longitude: item.longitude,
  };
}

export const fetch_properties_in_bounds_api = async (
  params: PropertiesBoundsParams
): Promise<{ success: boolean; data: PropertiesResponse; message: string }> => {
  const raw = await userAxios.get('/api/v1/properties', { params });
  const res = unwrapApi<
    BackendPropertyMarker[] | {
      markers?: BackendPropertyMarker[];
      properties?: BackendPropertyMarker[];
      totalCount?: number;
    }
  >(raw);

  let list: BackendPropertyMarker[] = [];
  if (Array.isArray(res.data)) {
    list = res.data;
  } else if (res.data) {
    list = res.data.markers ?? res.data.properties ?? [];
  }

  const properties = list.map(mapMarker);
  return {
    success: res.success,
    message: res.message,
    data: { properties, totalCount: Array.isArray(res.data) ? properties.length : Number(res.data?.totalCount ?? properties.length) },
  };
};
