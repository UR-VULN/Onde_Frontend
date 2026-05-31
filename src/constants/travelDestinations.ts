export interface TravelDestinationCountry {
  value: string;
  label: string;
  cities: string[];
}

export const TRAVEL_DESTINATIONS: TravelDestinationCountry[] = [
  { value: 'Australia', label: '호주', cities: ['골드코스트', '멜버른', '브리즈번', '시드니', '케언즈'] },
  { value: 'Austria', label: '오스트리아', cities: ['비엔나'] },
  { value: 'Belgium', label: '벨기에', cities: ['브뤼셀'] },
  { value: 'Canada', label: '캐나다', cities: ['몬트리올', '밴쿠버', '퀘벡', '토론토'] },
  { value: 'China', label: '중국', cities: ['광저우', '베이징', '상하이', '시안', '심천', '청두', '칭다오'] },
  { value: 'Croatia', label: '크로아티아', cities: ['두브로브니크'] },
  { value: 'Czech Republic', label: '체코', cities: ['체스키 크룸로프', '프라하'] },
  { value: 'France', label: '프랑스', cities: ['니스', '리옹', '마르세유', '콜마르', '파리'] },
  { value: 'Germany', label: '독일', cities: ['뮌헨', '베를린', '프랑크푸르트', '함부르크'] },
  { value: 'Greece', label: '그리스', cities: ['산토리니', '아테네'] },
  { value: 'Guam', label: '괌', cities: ['괌'] },
  { value: 'Hong Kong', label: '홍콩', cities: ['홍콩'] },
  { value: 'Hungary', label: '헝가리', cities: ['부다페스트'] },
  { value: 'Indonesia', label: '인도네시아', cities: ['롬복', '발리', '자카르타', '족자카르타'] },
  { value: 'Italy', label: '이탈리아', cities: ['나폴리', '로마', '밀라노', '베네치아', '포지타노', '피렌체'] },
  { value: 'Japan', label: '일본', cities: ['가고시마', '가나자와', '가마쿠라', '고베', '교토', '구마모토', '나가사키', '나고야', '나라', '다카마쓰', '다카야마', '도쿄', '미야자키', '삿포로', '센다이', '시라카와고', '시즈오카', '오사카', '오이타', '오키나와', '요코하마', '유후인', '하코네', '하코다테', '후쿠오카', '히로시마'] },
  { value: 'Macau', label: '마카오', cities: ['마카오'] },
  { value: 'Malaysia', label: '말레이시아', cities: ['랑카위', '코타키나발루', '쿠알라룸푸르', '페낭'] },
  { value: 'Maldives', label: '몰디브', cities: ['몰디브'] },
  { value: 'Mongolia', label: '몽골', cities: ['울란바토르'] },
  { value: 'Netherlands', label: '네덜란드', cities: ['암스테르담'] },
  { value: 'New Zealand', label: '뉴질랜드', cities: ['오클랜드', '퀸스타운'] },
  { value: 'Philippines', label: '필리핀', cities: ['마닐라', '보라카이', '보홀', '세부', '클락'] },
  { value: 'Portugal', label: '포르투갈', cities: ['리스본', '포르투'] },
  { value: 'Saipan', label: '사이판', cities: ['사이판'] },
  { value: 'Singapore', label: '싱가포르', cities: ['싱가포르'] },
  { value: 'South Korea', label: '대한민국', cities: ['강릉', '거제', '경주', '광주', '대구', '대전', '부산', '서울', '속초', '수원', '안동', '여수', '울산', '인천', '전주', '제주', '춘천', '통영', '평창', '포항'] },
  { value: 'Spain', label: '스페인', cities: ['그라나다', '마드리드', '마요르카', '바르셀로나', '세비야'] },
  { value: 'Switzerland', label: '스위스', cities: ['그린델발트', '루체른', '인터라켄', '제네바', '체르마트', '취리히'] },
  { value: 'Taiwan', label: '대만', cities: ['가오슝', '타이난', '타이베이', '타이중', '화롄'] },
  { value: 'Thailand', label: '태국', cities: ['끄라비', '방콕', '빠이', '치앙라이', '치앙마이', '코사무이', '파타야', '푸켓', '후아힌'] },
  { value: 'Turkey', label: '터키', cities: ['이스탄불', '카파도키아'] },
  { value: 'United Arab Emirates', label: '아랍에미리트', cities: ['두바이', '아부다비'] },
  { value: 'United Kingdom', label: '영국', cities: ['런던', '맨체스터', '에든버러'] },
  { value: 'United States', label: '미국', cities: ['뉴욕', '라스베이거스', '로스앤젤레스', '마이애미', '보스턴', '샌프란시스코', '시애틀', '시카고', '올랜도', '워싱턴 DC', '호놀룰루'] },
  { value: 'Vietnam', label: '베트남', cities: ['나트랑', '다낭', '달랏', '무이네', '사파', '푸꾸옥', '하노이', '하이퐁', '호이안', '호치민'] },
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
