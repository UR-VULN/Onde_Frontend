import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';

const StaySearch: React.FC = () => {
  const [searchParams, setSearchParams] = useState({
    region: '',
    checkIn: '',
    checkOut: '',
    guests: 2
  });
  
  const { addToast } = useTravelStore();

  const handleSearch = () => {
    if (!searchParams.region) {
      addToast('여행지를 입력해주세요.', 'warning');
      return;
    }
    addToast(`${searchParams.region} 주변의 숙소를 검색합니다.`, 'info');
  };

  return (
    <div className="search-widget-overlay">
      <div className="search-widget" id="stay-search-widget">
        <div className="search-widget-field">
          <span className="search-widget-label">여행지</span>
          <input 
            type="text" 
            className="search-widget-input" 
            placeholder="예: 도쿄, 일본"
            value={searchParams.region}
            onChange={(e) => setSearchParams({...searchParams, region: e.target.value})}
          />
        </div>
        <div className="search-widget-field">
          <span className="search-widget-label">체크인</span>
          <input 
            type="date" 
            className="search-widget-input" 
            value={searchParams.checkIn}
            onChange={(e) => setSearchParams({...searchParams, checkIn: e.target.value})}
          />
        </div>
        <div className="search-widget-field">
          <span className="search-widget-label">체크아웃</span>
          <input 
            type="date" 
            className="search-widget-input" 
            value={searchParams.checkOut}
            onChange={(e) => setSearchParams({...searchParams, checkOut: e.target.value})}
          />
        </div>
        <div className="search-widget-field">
          <span className="search-widget-label">여행자</span>
          <select 
            className="search-widget-input"
            value={searchParams.guests}
            onChange={(e) => setSearchParams({...searchParams, guests: parseInt(e.target.value)})}
            style={{ cursor: 'pointer' }}
          >
            <option value={1}>게스트 1명</option>
            <option value={2}>게스트 2명</option>
            <option value={3}>게스트 3명</option>
            <option value={4}>게스트 4명 이상</option>
          </select>
        </div>
        <button className="search-widget-btn" onClick={handleSearch}>
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
      </div>
    </div>
  );
};

export default StaySearch;