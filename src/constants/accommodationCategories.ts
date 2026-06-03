export interface AccommodationCategory {
  value: string;
  label: string;
}

export const ACCOMMODATION_CATEGORIES: AccommodationCategory[] = [
  { value: 'motel', label: '모텔' },
  { value: 'hotel', label: '일반 호텔' },
  { value: 'hotel_3star', label: '3성급 호텔' },
  { value: 'hotel_4star', label: '4성급 호텔' },
  { value: 'hotel_5star', label: '5성급 호텔' },
  { value: 'resort', label: '리조트' },
  { value: 'pension', label: '펜션' },
  { value: 'guesthouse', label: '게스트하우스' },
  { value: 'ryokan', label: '료칸' },
  { value: 'residence', label: '레지던스' },
  { value: 'villa', label: '빌라' },
  { value: 'bb', label: 'B&B' },
  { value: 'mansion', label: '저택' },
  { value: 'hotel_2star', label: '2성급 호텔' },
  { value: 'premium_hotel', label: '프리미엄 호텔' },
  { value: 'premium_resort', label: '프리미엄 리조트' },
  { value: 'capsule_hotel', label: '캡슐호텔' },
  { value: 'hostel', label: '호스텔' },
  { value: 'traditional_hotel', label: '전통호텔' },
  { value: 'aparthotel', label: '아파트호텔' },
  { value: 'apartment', label: '아파트' },
  { value: 'inn', label: '여관' },
  { value: 'cabin', label: '오두막' },
  { value: 'cottage', label: '별장' },
  { value: 'homestay', label: '홈스테이' },
  { value: 'unspecified', label: '미지정' },
];

export const DEFAULT_ACCOMMODATION_CATEGORY = 'hotel';

export function getCategoryLabel(value: string): string {
  const found = ACCOMMODATION_CATEGORIES.find((cat) => cat.value === value);
  return found ? found.label : '숙소';
}
