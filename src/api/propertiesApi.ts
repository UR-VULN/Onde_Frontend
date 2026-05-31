import { userAxios } from '@/api/axiosInstance';

export interface PropertyMarkerDto {
  propertyId: number;
  accommodationId?: number;
  name: string;
  latitude: number;
  longitude: number;
  thumbnailUrl: string;
  minPrice: number;
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

export const fetch_properties_in_bounds_api = async (
  params: PropertiesBoundsParams
): Promise<{ success: boolean; data: PropertiesResponse; message: string }> => {
  const res = (await userAxios.get('/api/v1/properties', { params })) as {
    success: boolean;
    data: any;
    message: string;
  };
  if (!res.success || !res.data) return { success: res.success, data: { properties: [], totalCount: 0 }, message: res.message };
  
  const properties: PropertyMarkerDto[] = Array.isArray(res.data)
    ? res.data
    : (res.data.properties ?? res.data.markers ?? []);
  
  return {
    success: true,
    message: res.message,
    data: { 
      properties, 
      totalCount: Array.isArray(res.data) ? res.data.length : (res.data.totalCount ?? properties.length) 
    },
  };
};
