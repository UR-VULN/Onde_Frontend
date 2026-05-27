import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { MOCK_FEEDS } from '@/constants/mockFeeds';
import type { FeedItem } from '@/constants/mockFeeds';

export const FeedPage: React.FC = () => {
  const { addToast } = useTravelStore();

  // Feeds list state initialized with mock constants
  const [feeds, setFeeds] = useState<FeedItem[]>(MOCK_FEEDS);
  const [selectedTag, setSelectedTag] = useState<'ALL' | 'STAY' | 'FOOD' | 'PHOTO' | 'TIP'>('ALL');
  
  // Lightbox & Creation Modals State
  const [selectedFeed, setSelectedFeed] = useState<FeedItem | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // New Feed Form State
  const [newCategory, setNewCategory] = useState<'STAY' | 'FOOD' | 'PHOTO' | 'TIP'>('PHOTO');
  const [newLocation, setNewLocation] = useState('');
  const [newRating, setNewRating] = useState<number>(5);
  const [newContent, setNewContent] = useState('');
  const [newImg, setNewImg] = useState('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800');

  // Filter feeds dynamically
  const filteredFeeds = selectedTag === 'ALL'
    ? feeds
    : feeds.filter(f => f.category === selectedTag);

  // Helper to extract initials from Korean or English name
  const getInitials = (name: string) => {
    if (!name) return 'TR';
    if (name.length >= 2) {
      return name.slice(-2); // Take last 2 characters
    }
    return name;
  };

  // Helper to get color based on author name for beautiful colorful avatars
  const getAvatarBg = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['#e0484d', '#27ae60', '#8e44ad', '#e67e22', '#2980b9', '#16a085'];
    return colors[hash % colors.length];
  };

  // Helper to format category labels in Korean
  const getCategoryLabel = (cat: 'STAY' | 'FOOD' | 'PHOTO' | 'TIP') => {
    switch (cat) {
      case 'STAY': return '🏡 감성숙소';
      case 'FOOD': return '🍳 맛집탐방';
      case 'PHOTO': return '📸 인생샷';
      case 'TIP': return '💡 꿀팁공유';
    }
  };

  // Render Star Icons based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`f-${i}`} className="fa-solid fa-star"></i>);
    }
    if (hasHalf) {
      stars.push(<i key="h" className="fa-solid fa-star-half-stroke"></i>);
    }
    const emptyCount = 5 - stars.length;
    for (let i = 0; i < emptyCount; i++) {
      stars.push(<i key={`e-${i}`} className="fa-regular fa-star"></i>);
    }
    return stars;
  };

  // Process Mock Image Upload
  const handleMockUpload = () => {
    const sampleImages = [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800'
    ];
    const randomImg = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setNewImg(randomImg);
    addToast("📷 감성 모바일 사진 파일 탐색기가 열려 이미지가 임시 가상 업로드되었습니다! (S3 Multi-part Upload)", "success");
  };

  // Submit new Feed Story
  const handleSubmitFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim()) {
      addToast("여행지를 입력해 주세요.", "warning");
      return;
    }
    if (!newContent.trim()) {
      addToast("여행 이야기를 작성해 주세요.", "warning");
      return;
    }

    const newFeed: FeedItem = {
      id: `feed-${Date.now()}`,
      category: newCategory,
      author: '김현민',
      location: newLocation,
      date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\/ /g, '.'),
      img: newImg,
      content: newContent,
      rating: newRating
    };

    setFeeds([newFeed, ...feeds]);
    addToast("✨ 소중한 온데 여행 후기가 정상적으로 실시간 등록 완료되었습니다!", "success");

    // Reset fields
    setNewLocation('');
    setNewContent('');
    setNewCategory('PHOTO');
    setNewRating(5);
    setNewImg('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800');
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
      <div className="feed-filter-bar flex flex-wrap gap-2 justify-center mb-10 select-none">
        {(['ALL', 'STAY', 'FOOD', 'PHOTO', 'TIP'] as const).map(tag => (
          <button
            key={tag}
            type="button"
            className={`feed-filter-btn px-5 py-2.5 rounded-full text-xs font-black transition-all ${
              selectedTag === tag ? 'active' : ''
            }`}
            onClick={() => setSelectedTag(tag)}
          >
            {tag === 'ALL' ? '# 전체' : `# ${getCategoryLabel(tag).split(' ')[1]}`}
          </button>
        ))}
      </div>

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
            <div
              key={item.id}
              className="feed-card bg-white border border-slate-200 rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group select-none"
              onClick={() => setSelectedFeed(item)}
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
                <div className="feed-user-row flex items-center gap-3 mb-3">
                  <div
                    className="feed-user-avatar w-9 h-9 rounded-full flex items-center justify-center text-white font-extrabold text-xs shrink-0 border-2 border-white shadow-sm"
                    style={{ background: getAvatarBg(item.author) }}
                  >
                    {getInitials(item.author)}
                  </div>
                  <div className="feed-user-info flex flex-col">
                    <span className="feed-user-name text-xs font-black text-slate-800">{item.author}</span>
                    <span className="feed-user-meta text-[10px] text-slate-400 font-bold">{item.date} • {item.location} 여행</span>
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
          ))}
        </div>
      )}

      {/* 4. [MODAL] Traveler Feed Detail Modal (Interactive Lightbox) */}
      {selectedFeed && (
        <div 
          className="premium-popup-backdrop"
          style={{ display: 'flex' }}
          onClick={() => setSelectedFeed(null)}
        >
          <div 
            className="app-modal select-none animate-[zoomIn_0.25s_ease]" 
            style={{ width: '720px', maxWidth: '95%', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'row', height: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              type="button"
              onClick={() => setSelectedFeed(null)} 
              className="absolute top-4 right-4 text-xl text-white hover:scale-110 active:scale-95 transition-all text-shadow-[0_1px_4px_black] z-10 bg-none border-none cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            
            {/* Left Image Area */}
            <div style={{ flex: 1.2, background: '#000', height: '100%', position: 'relative' }}>
              <img 
                src={selectedFeed.img} 
                alt={selectedFeed.location} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span className="feed-tag-badge" style={{ bottom: '20px', left: '20px', fontSize: '0.85rem' }}>
                {getCategoryLabel(selectedFeed.category)}
              </span>
            </div>
            
            {/* Right Information Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.8rem', height: '100%', background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div 
                  className="feed-user-avatar" 
                  style={{ background: getAvatarBg(selectedFeed.author), margin: 0, width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.8rem' }}
                >
                  {getInitials(selectedFeed.author)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-dark)' }}>{selectedFeed.author}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {selectedFeed.date} • {selectedFeed.location} 여행
                  </div>
                </div>
              </div>
              
              {/* Rating stars inside Detail Modal */}
              <div className="text-[#f5b041] text-[12px] mb-3">
                {renderStars(selectedFeed.rating)}
              </div>

              {/* Scrollable travel story content */}
              <div style={{ overflowY: 'auto', flex: 1, marginBottom: '1rem', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-main)', fontWeight: 500, paddingRight: '0.2rem' }}>
                {selectedFeed.content}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. [MODAL] Traveler Feed Write Modal */}
      {isWriteModalOpen && (
        <div 
          className="premium-popup-backdrop"
          style={{ display: 'flex' }}
          onClick={() => setIsWriteModalOpen(false)}
        >
          <div 
            className="app-modal max-w-[500px] w-full p-8 select-none animate-[zoomIn_0.25s_ease]" 
            style={{ borderRadius: '24px', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              type="button"
              onClick={() => setIsWriteModalOpen(false)} 
              className="absolute top-5 right-5 text-xl text-slate-400 hover:text-slate-600 transition-all bg-none border-none cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>
              <i className="fa-solid fa-pen-nib"></i> 생생한 여행 추억 기록하기
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              회원님의 온데 여행 이야기를 남겨주세요. 공유는 다른 여행자들에게 큰 힘이 됩니다!
            </p>

            <form onSubmit={handleSubmitFeed} className="space-y-4">
              
              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">여행 테마 카테고리</label>
                <select 
                  className="form-input border border-slate-200 p-2.5 rounded-lg text-sm bg-white"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                >
                  <option value="STAY">🏡 감성숙소 리뷰</option>
                  <option value="FOOD">🍳 로컬 맛집탐방</option>
                  <option value="PHOTO">📸 인생샷 스팟 정보</option>
                  <option value="TIP">💡 여행 꿀팁공유</option>
                </select>
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">여행지 (도시명)</label>
                <input 
                  type="text" 
                  className="form-input border border-slate-200 p-2.5 rounded-lg text-sm bg-white"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="예: 도쿄, 파리, 스위스"
                  required
                />
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">만족 평점 (별점 선택)</label>
                <select 
                  className="form-input border border-slate-200 p-2.5 rounded-lg text-sm bg-white cursor-pointer"
                  value={newRating}
                  onChange={(e) => setNewRating(Number(e.target.value))}
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5.0 (최고의 경험)</option>
                  <option value="4">⭐⭐⭐⭐ 4.0 (만족스러움)</option>
                  <option value="3">⭐⭐⭐ 3.0 (무난하고 괜찮음)</option>
                  <option value="2">⭐⭐ 2.0 (조금 아쉬움)</option>
                  <option value="1">⭐ 1.0 (개선이 필요함)</option>
                </select>
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">여행 이야기</label>
                <textarea 
                  className="form-input border border-slate-200 p-2.5 rounded-lg text-sm bg-white h-24"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="공유하고 싶은 상세 여행 일기나 정보를 넉넉하게 써보세요."
                  required
                />
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">감성 사진 첨부 (Mock Upload)</label>
                <div 
                  style={{ border: '2px dashed var(--border-color)', padding: '1.2rem', borderRadius: '12px', textAlign: 'center', background: 'var(--bg-body)', cursor: 'pointer' }}
                  onClick={handleMockUpload}
                  className="hover:bg-slate-100 transition-colors"
                >
                  <i className="fa-solid fa-cloud-arrow-up text-slate-400 text-2xl mb-1.5 block"></i>
                  <span className="text-xs text-slate-400 font-bold block">드래그 앤 드롭 하거나 클릭하여 사진 첨부</span>
                  {newImg && newImg !== 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800' && (
                    <span className="text-[10px] text-primary font-bold block mt-1.5">✓ 이미지 가상 업로드 완료</span>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary w-full py-3.5 mt-2 rounded-xl text-white font-black text-sm select-none hover:scale-[1.01] transition-all"
              >
                최종 후기 등록 완료
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
