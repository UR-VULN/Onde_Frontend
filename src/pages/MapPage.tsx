import React, { useState } from 'react';
import { StayMapExplorer } from '@/components/map/StayMapExplorer';

interface CityInfo {
  name: string;
  lat: number;
  lng: number;
  zoom?: number;
}

interface CountryGroup {
  country: string;
  flag: string;
  cities: CityInfo[];
}

const CITY_GROUPS: CountryGroup[] = [
  {
    country: '대한민국',
    flag: '🇰🇷',
    cities: [
      { name: '서울', lat: 37.5665, lng: 126.9780, zoom: 11 },
      { name: '부산', lat: 35.1796, lng: 129.0756, zoom: 12 },
      { name: '인천', lat: 37.4563, lng: 126.7052, zoom: 12 },
      { name: '대구', lat: 35.8714, lng: 128.6014, zoom: 12 },
      { name: '제주', lat: 33.4890, lng: 126.4983, zoom: 11 },
      { name: '경주', lat: 35.8562, lng: 129.2247, zoom: 12 },
    ],
  },
  {
    country: '일본',
    flag: '🇯🇵',
    cities: [
      { name: '도쿄', lat: 35.6762, lng: 139.6503, zoom: 11 },
      { name: '오사카', lat: 34.6937, lng: 135.5023, zoom: 12 },
      { name: '교토', lat: 35.0116, lng: 135.7681, zoom: 12 },
      { name: '삿포로', lat: 43.0618, lng: 141.3545, zoom: 12 },
      { name: '후쿠오카', lat: 33.5904, lng: 130.4017, zoom: 12 },
      { name: '나고야', lat: 35.1815, lng: 136.9066, zoom: 12 },
      { name: '오키나와', lat: 26.2124, lng: 127.6809, zoom: 11 },
    ],
  },
  {
    country: '동남아시아',
    flag: '🌏',
    cities: [
      { name: '방콕', lat: 13.7563, lng: 100.5018, zoom: 11 },
      { name: '싱가포르', lat: 1.3521, lng: 103.8198, zoom: 12 },
      { name: '발리', lat: -8.3405, lng: 115.0920, zoom: 11 },
      { name: '하노이', lat: 21.0285, lng: 105.8542, zoom: 12 },
      { name: '호치민', lat: 10.8231, lng: 106.6297, zoom: 12 },
      { name: '쿠알라룸푸르', lat: 3.1390, lng: 101.6869, zoom: 12 },
      { name: '마닐라', lat: 14.5995, lng: 120.9842, zoom: 12 },
      { name: '치앙마이', lat: 18.7883, lng: 98.9853, zoom: 12 },
    ],
  },
  {
    country: '서유럽',
    flag: '🇪🇺',
    cities: [
      { name: '파리', lat: 48.8566, lng: 2.3522, zoom: 12 },
      { name: '런던', lat: 51.5074, lng: -0.1278, zoom: 12 },
      { name: '로마', lat: 41.9028, lng: 12.4964, zoom: 12 },
      { name: '바르셀로나', lat: 41.3851, lng: 2.1734, zoom: 12 },
      { name: '암스테르담', lat: 52.3676, lng: 4.9041, zoom: 12 },
      { name: '마드리드', lat: 40.4168, lng: -3.7037, zoom: 12 },
      { name: '리스본', lat: 38.7223, lng: -9.1393, zoom: 12 },
    ],
  },
  {
    country: '중·동유럽',
    flag: '🏰',
    cities: [
      { name: '프라하', lat: 50.0755, lng: 14.4378, zoom: 12 },
      { name: '빈', lat: 48.2082, lng: 16.3738, zoom: 12 },
      { name: '부다페스트', lat: 47.4979, lng: 19.0402, zoom: 12 },
      { name: '크라쿠프', lat: 50.0647, lng: 19.9450, zoom: 12 },
      { name: '두브로브니크', lat: 42.6507, lng: 18.0944, zoom: 13 },
    ],
  },
  {
    country: '미주',
    flag: '🌎',
    cities: [
      { name: '뉴욕', lat: 40.7128, lng: -74.0060, zoom: 11 },
      { name: '로스앤젤레스', lat: 34.0522, lng: -118.2437, zoom: 11 },
      { name: '샌프란시스코', lat: 37.7749, lng: -122.4194, zoom: 12 },
      { name: '라스베이거스', lat: 36.1716, lng: -115.1398, zoom: 12 },
      { name: '멕시코시티', lat: 19.4326, lng: -99.1332, zoom: 11 },
      { name: '밴쿠버', lat: 49.2827, lng: -123.1207, zoom: 12 },
    ],
  },
  {
    country: '오세아니아',
    flag: '🦘',
    cities: [
      { name: '시드니', lat: -33.8688, lng: 151.2093, zoom: 11 },
      { name: '멜버른', lat: -37.8136, lng: 144.9631, zoom: 11 },
      { name: '오클랜드', lat: -36.8485, lng: 174.7633, zoom: 11 },
    ],
  },
  {
    country: '중동·기타',
    flag: '🌐',
    cities: [
      { name: '두바이', lat: 25.2048, lng: 55.2708, zoom: 11 },
      { name: '이스탄불', lat: 41.0082, lng: 28.9784, zoom: 11 },
      { name: '홍콩', lat: 22.3193, lng: 114.1694, zoom: 11 },
      { name: '마카오', lat: 22.1987, lng: 113.5439, zoom: 13 },
    ],
  },
];

export const MapPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('서울');
  const [cityTarget, setCityTarget] = useState<{ latitude: number; longitude: number; zoom?: number } | null>(null);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [lat, lng, zoom] = val.split(',').map(Number);
    if (!isNaN(lat) && !isNaN(lng)) {
      setCityTarget({ latitude: lat, longitude: lng, zoom });
      // 드롭다운에서 선택한 도시의 이름으로 검색어도 업데이트하여 주변 숙소를 갱신
      const selectedOption = e.target.options[e.target.selectedIndex];
      if (selectedOption) {
        setSearchQuery(selectedOption.text);
      }
    }
  };

  return (
    <div className="map-page page-hero-gap w-full px-5 lg:px-0">
      <div className="map-page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="map-page-title">지도로 찾아가는 나만의 감성 쉼터</h2>
          <p className="map-page-desc">숙소 탭과 동일한 데이터 · 지도 영역 안 마커만 표시 (최적화)</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* 주요 도시 빠른 이동 콤보박스 */}
          <select
            onChange={handleCityChange}
            defaultValue=""
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            aria-label="도시 빠른 이동"
          >
            <option value="" disabled>🌍 나라별 주요 도시로 이동</option>
            {CITY_GROUPS.map((group) => (
              <optgroup key={group.country} label={`${group.flag} ${group.country}`}>
                {group.cities.map((city) => (
                  <option key={city.name} value={`${city.lat},${city.lng},${city.zoom ?? 12}`}>
                    {city.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <label className="map-search-bar flex-1 md:flex-initial">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="도시, 지역, 숙소명 검색 (예: 서울, 도쿄)"
              aria-label="숙소 지도 검색"
            />
          </label>
        </div>
      </div>

      <StayMapExplorer searchQuery={searchQuery} cityTarget={cityTarget} />
    </div>
  );
};
