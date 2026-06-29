import React from 'react';
import { getCategoryLabel } from './feedHelpers';

interface FeedFilterBarProps {
  selectedTag: 'ALL' | 'STAY' | 'FOOD' | 'PHOTO' | 'TIP';
  onSelectTag: (tag: 'ALL' | 'STAY' | 'FOOD' | 'PHOTO' | 'TIP') => void;
}

export const FeedFilterBar: React.FC<FeedFilterBarProps> = ({ selectedTag, onSelectTag }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center lg:justify-start w-full lg:w-auto select-none">
      {(['ALL', 'STAY', 'FOOD', 'PHOTO', 'TIP'] as const).map(tag => (
        <button
          key={tag}
          type="button"
          className={`feed-filter-btn h-10 px-5 rounded-full text-xs font-black flex items-center justify-center transition-all ${
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
