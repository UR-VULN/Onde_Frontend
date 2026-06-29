import React from 'react';
import type { FeedItem } from '@/types/feed';
import { getCategoryAvatar, formatDate, getCategoryLabel, renderStars } from './feedHelpers';

interface FeedCardProps {
  item: FeedItem;
  onClick: () => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({ item, onClick }) => {
  return (
    <div
      className="feed-card bg-white border border-slate-200 rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group select-none"
      onClick={onClick}
    >
      <div className="feed-img-box relative aspect-[16/10] overflow-hidden">
        <img
          src={item.img}
          alt={item.location}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="feed-tag-badge absolute bottom-3 left-3 bg-black/60 backdrop-blur-[4px] text-white px-2.5 py-1 rounded-[6px] text-[10px] font-semibold">
          {getCategoryLabel(item.category)}
        </span>
      </div>

      <div className="feed-body p-5 flex flex-col flex-1">
        <div className="feed-user-row flex items-center gap-3.5 mb-3">
          <span className="text-3xl shrink-0 select-none">
            {getCategoryAvatar(item.category)}
          </span>
          <div className="feed-user-info flex flex-col gap-0.5">
            <span className="feed-user-name text-sm font-black text-slate-800">{item.author}</span>
            <span className="feed-user-meta text-xs text-slate-400 font-bold">{formatDate(item.date)}</span>
            <span className="feed-user-meta text-xs text-slate-900 font-black">{item.location} 여행</span>
          </div>
        </div>

        <div className="feed-rating-stars text-[#f5b041] text-[11px] mb-2">
          {renderStars(item.rating)}
        </div>

        <p className="feed-text text-sm text-slate-500 leading-relaxed font-medium line-clamp-3 overflow-hidden text-ellipsis mb-4 flex-1">
          {item.content}
        </p>
      </div>
    </div>
  );
};
