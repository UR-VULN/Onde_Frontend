import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { MOCK_FEEDS } from '@/constants/mockFeeds';
import type { FeedItem } from '@/constants/mockFeeds';

// Modular Subcomponents
import { FeedHeader } from '@/components/feed/FeedHeader';
import { FeedFilterBar } from '@/components/feed/FeedFilterBar';
import { FeedCard } from '@/components/feed/FeedCard';
import { FeedDetailModal } from '@/components/feed/FeedDetailModal';
import { FeedWriteModal } from '@/components/feed/FeedWriteModal';

export const FeedPage: React.FC = () => {
  const { addToast, isLoggedIn, openAuthModal } = useTravelStore();

  // Feeds list state initialized with mock constants
  const [feeds, setFeeds] = useState<FeedItem[]>(MOCK_FEEDS);
  const [selectedTag, setSelectedTag] = useState<'ALL' | 'STAY' | 'FOOD' | 'PHOTO' | 'TIP'>('ALL');
  
  // Lightbox & Creation Modals State
  const [selectedFeed, setSelectedFeed] = useState<FeedItem | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // Guard write review option with login status check
  const handleWriteClick = () => {
    if (!isLoggedIn) {
      addToast("여행 후기 기록은 로그인이 필요한 서비스입니다.", "warning");
      openAuthModal();
      return;
    }
    setIsWriteModalOpen(true);
  };

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
    addToast("소중한 온데 여행 후기가 정상적으로 등록 완료되었습니다!", "success");
    setIsWriteModalOpen(false);
  };

  return (
    <div className="w-full space-y-16 pt-32 mb-20 px-4 md:px-0 transition-all duration-300 animate-[fadeIn_0.35s_ease]">
      
      {/* 1. Centered Header Section (Visual balance identical to Insurance page) */}
      <FeedHeader />

      {/* 2. Control Panel Row: Filters centered on mobile/tablet, Write Button aligned left underneath */}
      <div 
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full border-b border-slate-200/80 select-none"
        style={{ paddingTop: '2.5rem', paddingBottom: '2rem', marginBottom: '3rem' }}
      >
        <FeedFilterBar selectedTag={selectedTag} onSelectTag={setSelectedTag} />
        
        <button
          type="button"
          className="btn-primary h-10 px-5 flex items-center justify-center gap-2 text-xs font-black shadow-md hover:scale-[1.03] transition-all select-none shrink-0 self-start lg:self-auto"
          onClick={handleWriteClick}
        >
          <i className="fa-solid fa-pen-nib"></i> 나의 여행 이야기 기록하기
        </button>
      </div>

      {/* 3. Feeds Grid Cards List (1 column on mobile/tablet, 3 columns on desktop) */}
      {filteredFeeds.length === 0 ? (
        <div 
          className="bg-white rounded-3xl border border-slate-200 text-center select-none shadow-sm flex flex-col items-center justify-center w-full"
          style={{ paddingTop: '7rem', paddingBottom: '7rem', paddingLeft: '4rem', paddingRight: '4rem' }}
        >
          <i className="fa-solid fa-folder-open text-5xl text-slate-300 mb-4 block animate-bounce"></i>
          <p className="text-base font-bold text-slate-500">선택하신 테마에 등록된 여행기가 아직 존재하지 않습니다.</p>
          <p className="text-xs text-slate-400 font-bold mt-1">첫 번째 소중한 이야기의 주인공이 되어보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
