import React, { memo } from 'react';
import type { MapStayItem } from '@/types/mapStay';
import { ListingThumbnail } from '@/components/common/ListingThumbnail';
import { formatKrwPriceOrDash } from '@/utils/listingDisplay';

interface StayMapListProps {
  stays: MapStayItem[];
  selectedId: string | null;
  onSelect: (stay: MapStayItem) => void;
  onDetail: (stay: MapStayItem) => void;
}

const StayMapListItem = memo(function StayMapListItem({
  stay,
  isSelected,
  onSelect,
  onDetail,
}: {
  stay: MapStayItem;
  isSelected: boolean;
  onSelect: (stay: MapStayItem) => void;
  onDetail: (stay: MapStayItem) => void;
}) {
  return (
    <article
      className={`map-stay-item${isSelected ? ' is-selected' : ''}`}
      onClick={() => onSelect(stay)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(stay)}
      role="button"
      tabIndex={0}
    >
      <ListingThumbnail
        imageUrl={stay.imageUrl}
        alt={stay.title}
        iconClass="fa-hotel"
        className="map-stay-item__thumb"
        imgClassName="map-stay-item__thumb"
      />
      <div className="map-stay-item__body">
        <span className="map-stay-item__meta">
          {stay.city} · {stay.tags[0] ?? '숙소'}
        </span>
        <strong className="map-stay-item__title">{stay.title}</strong>
        <span className="map-stay-item__price">{formatKrwPriceOrDash(stay.pricePerNight)}</span>
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
