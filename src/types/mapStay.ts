/** 지도·숙소 탐색 UI용 숙소 마커 모델 */
export interface MapStayItem {
  id: string;
  title: string;
  location: string;
  city: string;
  country: string;
  description: string;
  imageUrl: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  soldOutDays: number[];
  mileageDiscount: number;
  latitude: number;
  longitude: number;
  accommodationId: number;
  roomId: number;
}
