export interface TravelDestinationCountry {
  value: string;
  label: string;
  cities: string[];
}

export const TRAVEL_DESTINATIONS: TravelDestinationCountry[] = [
  { value: 'Australia', label: '호주', cities: ['시드니'] },
  { value: 'China', label: '중국', cities: ['상하이'] },
  { value: 'France', label: '프랑스', cities: ['파리'] },
  { value: 'Hong Kong', label: '홍콩', cities: ['홍콩'] },
  { value: 'Indonesia', label: '인도네시아', cities: ['발리'] },
  { value: 'Italy', label: '이탈리아', cities: ['로마'] },
  { value: 'Japan', label: '일본', cities: ['도쿄', '오사카', '후쿠오카'] },
  { value: 'Philippines', label: '필리핀', cities: ['세부'] },
  { value: 'Singapore', label: '싱가포르', cities: ['싱가포르'] },
  { value: 'South Korea', label: '대한민국', cities: ['강릉', '경주', '부산', '서울', '제주'] },
  { value: 'Spain', label: '스페인', cities: ['바르셀로나'] },
  { value: 'Taiwan', label: '대만', cities: ['타이베이'] },
  { value: 'Thailand', label: '태국', cities: ['방콕'] },
  { value: 'United Arab Emirates', label: '아랍에미리트', cities: ['두바이'] },
  { value: 'United Kingdom', label: '영국', cities: ['런던'] },
  { value: 'United States', label: '미국', cities: ['뉴욕', '라스베이거스', '로스앤젤레스'] },
  { value: 'Vietnam', label: '베트남', cities: ['다낭'] },
];

export const DEFAULT_DESTINATION = {
  country: 'Japan',
  city: '도쿄',
} as const;

export function findCountry(value: string): TravelDestinationCountry | undefined {
  return TRAVEL_DESTINATIONS.find((country) => country.value === value);
}

export function findCountryByCity(city: string): TravelDestinationCountry | undefined {
  return TRAVEL_DESTINATIONS.find((country) => country.cities.includes(city));
}

export function formatDestinationLabel(city: string, countryValue: string): string {
  const country = findCountry(countryValue);
  if (!country) return city;
  return `${city} · ${country.label}`;
}
