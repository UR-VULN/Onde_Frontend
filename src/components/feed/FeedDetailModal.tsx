import React from 'react';
import type { FeedItem } from '@/types/feed';
import { getAvatarBg, getInitials, getCategoryLabel, renderStars } from './feedHelpers';

interface FeedDetailModalProps {
  feed: FeedItem | null;
  onClose: () => void;
}

export const FeedDetailModal: React.FC<FeedDetailModalProps> = ({ feed, onClose }) => {
  if (!feed) return null;

  return (
    <div 
      className="premium-popup-backdrop"
      style={{ display: 'flex' }}
      onClick={onClose}
    >
      <div 
        className="app-modal select-none animate-[zoomIn_0.25s_ease]" 
        style={{ width: '720px', maxWidth: '95%', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'row', height: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-4 right-4 text-xl text-white hover:scale-110 active:scale-95 transition-all text-shadow-[0_1px_4px_black] z-10 bg-none border-none cursor-pointer"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        
        {/* Left Image Area */}
        <div style={{ flex: 1.2, background: '#000', height: '100%', position: 'relative' }}>
          <img 
            src={feed.img} 
            alt={feed.location} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <span className="feed-tag-badge" style={{ bottom: '20px', left: '20px', fontSize: '0.85rem' }}>
            {getCategoryLabel(feed.category)}
          </span>
        </div>
        
        {/* Right Information Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.8rem', height: '100%', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div 
              className="feed-user-avatar" 
              style={{ background: getAvatarBg(feed.author), margin: 0, width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.8rem' }}
            >
              {getInitials(feed.author)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-dark)' }}>{feed.author}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {feed.date} • {feed.location} 여행
              </div>
            </div>
          </div>
          
          {/* Rating stars inside Detail Modal */}
          <div className="text-[#f5b041] text-[12px] mb-3">
            {renderStars(feed.rating)}
          </div>

          {/* Scrollable travel story content */}
          <div style={{ overflowY: 'auto', flex: 1, marginBottom: '1rem', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-main)', fontWeight: 500, paddingRight: '0.2rem' }}>
            {feed.content}
          </div>
        </div>
      </div>
    </div>
  );
};
