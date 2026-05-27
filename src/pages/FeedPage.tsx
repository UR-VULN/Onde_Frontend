import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { MOCK_FEEDS } from '@/constants/mockFeeds';
import type { FeedItem } from '@/constants/mockFeeds';

// Modular Subcomponents
import { FeedFilterBar } from '@/components/feed/FeedFilterBar';
import { FeedCard } from '@/components/feed/FeedCard';
import { FeedDetailModal } from '@/components/feed/FeedDetailModal';
import { FeedWriteModal } from '@/components/feed/FeedWriteModal';

export const FeedPage: React.FC = () => {
  const { addToast } = useTravelStore();

  // Feeds list state initialized with mock constants
  const [feeds, setFeeds] = useState<FeedItem[]>(MOCK_FEEDS);
  const [selectedTag, setSelectedTag] = useState<'ALL' | 'STAY' | 'FOOD' | 'PHOTO' | 'TIP'>('ALL');
  
  // Lightbox & Creation Modals State
  const [selectedFeed, setSelectedFeed] = useState<FeedItem | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // Filter feeds dynamically
  const filteredFeeds = selectedTag === 'ALL'
    ? feeds
    : feeds.filter(f => f.category === selectedTag);

  // Submit new Feed Story from Child WriteModal
  const handleSubmitFeed = (
    category: 'STAY' | 'FOOD' | 'PHOTO' | 'TIP', 
    location: string, 
    rating: number, 
    content: string, 
    img: string
  ) => {
    const newFeed: FeedItem = {
      id: `feed-${Date.now()}`,
      category,
      author: '김현민',
      location,
      date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\/ /g, '.'),
      img,
      content,
      rating
    };

    setFeeds([newFeed, ...feeds]);
    addToast("✨ 소중한 온데 여행 후기가 정상적으로 실시간 등록 완료되었습니다!", "success");
    setIsWriteModalOpen(false);
  };

  return (
    <div className="w-full mt-8 mb-20 px-4 md:px-0 transition-all duration-300 animate-[fadeIn_0.35s_ease]">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="font-logo font-black text-2xl md:text-3xl text-slate-800 tracking-tight">온데 여행자 광장</h2>
          <p className="text-sm text-slate-400 font-bold tracking-tight mt-1">여행자들의 실시간 생생 후기와 인생 사진을 공유하는 감성 피드</p>
        </div>
        <button
          type="button"
          className="btn-primary py-3 px-5 flex items-center gap-2 select-none hover:scale-[1.03] transition-all"
          onClick={() => setIsWriteModalOpen(true)}
        >
          <i className="fa-solid fa-pen"></i> 후기 작성
        </button>
      </div>

      {/* 2. Glassmorphism Filter Tags Bar */}
      <FeedFilterBar selectedTag={selectedTag} onSelectTag={setSelectedTag} />

      {/* 3. Feeds Grid Cards List */}
      {filteredFeeds.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center select-none shadow-sm">
          <i className="fa-solid fa-folder-open text-5xl text-slate-300 mb-4 block animate-bounce"></i>
          <p className="text-base font-bold text-slate-500">선택하신 테마에 등록된 여행기가 아직 존재하지 않습니다.</p>
          <p className="text-xs text-slate-400 font-bold mt-1">첫 번째 소중한 이야기의 주인공이 되어보세요!</p>
        </div>
      ) : (
        <div className="feed-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFeeds.map(item => (
            <FeedCard 
              key={item.id} 
              item={item} 
              onClick={() => setSelectedFeed(item)} 
            />
          ))}
        </div>
      )}

      {/* 4. [MODAL] Traveler Feed Detail Modal (Interactive Lightbox) */}
      <FeedDetailModal 
        feed={selectedFeed} 
        onClose={() => setSelectedFeed(null)} 
      />

      {/* 5. [MODAL] Traveler Feed Write Modal */}
      <FeedWriteModal 
        isOpen={isWriteModalOpen} 
        onClose={() => setIsWriteModalOpen(false)} 
        onSubmit={handleSubmitFeed} 
      />

    </div>
  );
};
