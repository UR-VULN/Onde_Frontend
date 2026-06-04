import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';

const CarSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    pickup: '',
    returnTime: '',
    type: 'all'
  });
  
  const { addToast } = useTravelStore();

  const handleSearch = () => {
    if (!searchParams.location) {
      addToast('대여 장소를 입력해주세요.', 'warning');
      return;
    }
    addToast(`${searchParams.location} 주변의 차량을 검색합니다.`, 'info');
  };

  return (
    <div className="search-widget-overlay">
      <div className="search-widget" id="car-search-widget">
        <div className="search-widget-field">
          <span className="search-widget-label">대여 장소</span>
          <input 
            type="text" 
            className="search-widget-input" 
            placeholder="어디서 빌리시나요?"
            value={searchParams.location}
            onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
          />
        </div>
        <div className="search-widget-field">
          <span className="search-widget-label">대여 일시</span>
          <input 
            type="datetime-local" 
            className="search-widget-input" 
            value={searchParams.pickup}
            onChange={(e) => setSearchParams({...searchParams, pickup: e.target.value})}
          />
        </div>
        <div className="search-widget-field">
          <span className="search-widget-label">반납 일시</span>
          <input 
            type="datetime-local" 
            className="search-widget-input" 
            value={searchParams.returnTime}
            onChange={(e) => setSearchParams({...searchParams, returnTime: e.target.value})}
          />
        </div>
        <div className="search-widget-field">
          <span className="search-widget-label">차량 종류</span>
          <select 
            className="search-widget-input"
            value={searchParams.type}
            onChange={(e) => setSearchParams({...searchParams, type: e.target.value})}
            style={{ cursor: 'pointer' }}
          >
            <option value="all">전체 차량</option>
            <option value="compact">경차/소형</option>
            <option value="sedan">세단</option>
            <option value="suv">SUV/RV</option>
            <option value="luxury">고급/수입차</option>
          </select>
        </div>
        <button className="search-widget-btn" onClick={handleSearch}>
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
      </div>
    </div>
  );
};

export default CarSearch;