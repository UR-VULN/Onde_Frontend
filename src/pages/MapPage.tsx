import React, { useState } from 'react';
import { StayMapExplorer } from '@/components/map/StayMapExplorer';

export const MapPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('서울');

  return (
    <div className="map-page page-hero-gap w-full px-5 lg:px-0">
      <div className="map-page-header">
        <div>
          <h2 className="map-page-title">지도로 찾아가는 나만의 감성 쉼터</h2>
          <p className="map-page-desc">숙소 탭과 동일한 데이터 · 지도 영역 안 마커만 표시 (최적화)</p>
        </div>
        <label className="map-search-bar">
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

      <StayMapExplorer searchQuery={searchQuery} />
    </div>
  );
};
