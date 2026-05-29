import React, { memo } from 'react';
import type { MockStay } from '@/constants/mockStays';

interface StayMapListProps {
  stays: MockStay[];
  selectedId: string | null;
  onSelect: (stay: MockStay) => void;
  onDetail: (stay: MockStay) => void;
}

const StayMapListItem = memo(function StayMapListItem({
  stay,
  isSelected,
  onSelect,
  onDetail,
}: {
  stay: MockStay;
  isSelected: boolean;
  onSelect: (stay: MockStay) => void;
  onDetail: (stay: MockStay) => void;
}) {
  return (
    <article
      className={`map-stay-item${isSelected ? ' is-selected' : ''}`}
      onClick={() => onSelect(stay)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(stay)}
      role="button"
      tabIndex={0}
    >
      <img src={stay.imageUrl} alt={stay.title} className="map-stay-item__thumb" loading="lazy" />
      <div className="map-stay-item__body">
        <span className="map-stay-item__meta">
          {stay.city} · {stay.tags[0] ?? '숙소'}
        </span>
        <strong className="map-stay-item__title">{stay.title}</strong>
        <span className="map-stay-item__price">₩{stay.pricePerNight.toLocaleString('ko-KR')}</span>
        <button
          type="button"
          className="map-stay-item__detail-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDetail(stay);
          }}
        >
          상세 보기
        </button>
      </div>
    </article>
  );
});

export const StayMapList: React.FC<StayMapListProps> = memo(function StayMapList({
  stays,
  selectedId,
  onSelect,
  onDetail,
}) {
  if (stays.length === 0) {
    return (
      <div className="map-stay-empty">
        <i className="fa-solid fa-map-pin"></i>
        <p>이 지역에 표시할 숙소가 없습니다.</p>
        <span>검색어나 지도 위치를 변경해 보세요.</span>
      </div>
    );
  }

  return (
    <div className="map-stay-list">
      {stays.map((stay) => (
        <StayMapListItem
          key={stay.id}
          stay={stay}
          isSelected={selectedId === stay.id}
          onSelect={onSelect}
          onDetail={onDetail}
        />
      ))}
    </div>
  );
});
