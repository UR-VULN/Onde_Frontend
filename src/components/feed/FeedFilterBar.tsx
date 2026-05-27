import React from 'react';
import { getCategoryLabel } from './feedHelpers';

interface FeedFilterBarProps {
  selectedTag: 'ALL' | 'STAY' | 'FOOD' | 'PHOTO' | 'TIP';
  onSelectTag: (tag: 'ALL' | 'STAY' | 'FOOD' | 'PHOTO' | 'TIP') => void;
}

export const FeedFilterBar: React.FC<FeedFilterBarProps> = ({ selectedTag, onSelectTag }) => {
  return (
    <div className="feed-filter-bar flex flex-wrap gap-2 justify-center mb-10 select-none">
      {(['ALL', 'STAY', 'FOOD', 'PHOTO', 'TIP'] as const).map(tag => (
        <button
          key={tag}
          type="button"
          className={`feed-filter-btn px-5 py-2.5 rounded-full text-xs font-black transition-all ${
            selectedTag === tag ? 'active' : ''
          }`}
          onClick={() => onSelectTag(tag)}
        >
          {tag === 'ALL' ? '# 전체' : `# ${getCategoryLabel(tag).split(' ')[1]}`}
        </button>
      ))}
    </div>
  );
};
