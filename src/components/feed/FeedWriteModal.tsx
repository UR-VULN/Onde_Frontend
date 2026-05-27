import React, { useState, useEffect } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { MOCK_FEED_IMAGES, DEFAULT_FEED_PLACEHOLDER_IMG } from '@/constants/mockFeeds';

interface FeedWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: 'STAY' | 'FOOD' | 'PHOTO' | 'TIP', location: string, rating: number, content: string, img: string) => void;
}

export const FeedWriteModal: React.FC<FeedWriteModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { addToast } = useTravelStore();

  // Form State
  const [newCategory, setNewCategory] = useState<'STAY' | 'FOOD' | 'PHOTO' | 'TIP'>('PHOTO');
  const [newLocation, setNewLocation] = useState('');
  const [newRating, setNewRating] = useState<number>(5);
  const [newContent, setNewContent] = useState('');
  const [newImg, setNewImg] = useState(DEFAULT_FEED_PLACEHOLDER_IMG);

  // Gracefully close on Escape keydown
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Process Mock Image Upload
  const handleMockUpload = () => {
    const randomImg = MOCK_FEED_IMAGES[Math.floor(Math.random() * MOCK_FEED_IMAGES.length)];
    setNewImg(randomImg);
    addToast("📷 이미지가 업로드되었습니다!", "success");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Validations with beautiful Custom Toast Messages
    if (!newLocation.trim()) {
      addToast("📍 여행지(도시명)를 입력해 주세요.", "warning");
      return;
    }
    if (!newContent.trim()) {
      addToast("✍️ 소중한 여행 이야기를 채워주세요.", "warning");
      return;
    }
    // Force a required photo upload
    if (!newImg || newImg === DEFAULT_FEED_PLACEHOLDER_IMG) {
      addToast("📷 감성 여행 사진을 필수로 첨부해 주세요.", "warning");
      return;
    }

    // Call the custom Confirm Modal matching our premium global UI
    const { openConfirmPopup } = useTravelStore.getState();
    openConfirmPopup((confirmed) => {
      if (confirmed) {
        onSubmit(newCategory, newLocation, newRating, newContent, newImg);
        
        // Reset fields upon successful confirmation and submit
        setNewLocation('');
        setNewContent('');
        setNewCategory('PHOTO');
        setNewRating(5);
        setNewImg(DEFAULT_FEED_PLACEHOLDER_IMG);
      } else {
        addToast("등록이 취소 되었습니다!", "info");
      }
    }, {
      title: "후기를 등록하시겠습니까?",
      description: "작성하신 소중한 온데 여행 이야기와 평점 사진이 광장에 공개됩니다.",
      yesLabel: "등록하기",
      noLabel: "취소"
    });
  };

  return (
    <div 
      className="premium-popup-backdrop"
      style={{ display: 'flex' }}
      // onClick={onClose} has been completely removed to prevent accidental close on backdrop click!
    >
      <div 
        className="app-modal max-w-[500px] w-full p-8 select-none animate-[zoomIn_0.25s_ease]" 
        style={{ borderRadius: '24px', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose} 
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

        {/* noValidate is added to completely disable native browser bubble tooltips */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          
          <div className="form-group flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">여행 테마 카테고리</label>
            {/* style={{ paddingLeft: '10px' }} overrides the default browser padding-left to force perfect left-alignment */}
            <select 
              className="form-input border border-slate-200 py-2.5 rounded-lg text-sm bg-white cursor-pointer"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              style={{ paddingLeft: '10px', paddingRight: '2rem' }}
            >
              <option value="STAY">🏡 감성숙소 리뷰</option>
              <option value="FOOD">🍳 로컬 맛집탐방</option>
              <option value="PHOTO">📸 인생샷 스팟 정보</option>
              <option value="TIP">💡 여행 꿀팁공유</option>
            </select>
          </div>

          <div className="form-group flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              여행지 (도시명) <span className="text-[#ff5a5f] font-bold">* 필수</span>
            </label>
            <input 
              type="text" 
              className="form-input border border-slate-200 p-2.5 rounded-lg text-sm bg-white"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="예: 도쿄, 파리, 스위스"
            />
          </div>

          <div className="form-group flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">만족 평점 (별점 선택)</label>
            {/* style={{ paddingLeft: '10px' }} overrides the default browser padding-left to force perfect left-alignment */}
            <select 
              className="form-input border border-slate-200 py-2.5 rounded-lg text-sm bg-white cursor-pointer"
              value={newRating}
              onChange={(e) => setNewRating(Number(e.target.value))}
              style={{ paddingLeft: '10px', paddingRight: '2rem' }}
            >
              <option value="5">⭐⭐⭐⭐⭐ 5.0 (최고의 경험)</option>
              <option value="4">⭐⭐⭐⭐ 4.0 (만족스러움)</option>
              <option value="3">⭐⭐⭐ 3.0 (무난하고 괜찮음)</option>
              <option value="2">⭐⭐ 2.0 (조금 아쉬움)</option>
              <option value="1">⭐ 1.0 (개선이 필요함)</option>
            </select>
          </div>

          <div className="form-group flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              여행 이야기 <span className="text-[#ff5a5f] font-bold">* 필수</span>
            </label>
            <textarea 
              className="form-input border border-slate-200 p-2.5 rounded-lg text-sm bg-white h-24"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="공유하고 싶은 상세 여행 일기나 정보를 넉넉하게 써보세요."
            />
          </div>

          <div className="form-group flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              감성 사진 첨부 <span className="text-[#ff5a5f] font-bold">* 필수</span>
            </label>
            <div 
              style={{ border: '2px dashed var(--border-color)', padding: '1.2rem', borderRadius: '12px', textAlign: 'center', background: 'var(--bg-body)', cursor: 'pointer' }}
              onClick={handleMockUpload}
              className="hover:bg-slate-100 transition-colors"
            >
              <i className="fa-solid fa-cloud-arrow-up text-slate-400 text-2xl mb-1.5 block"></i>
              <span className="text-xs text-slate-400 font-bold block">드래그 앤 드롭 하거나 클릭하여 사진 첨부</span>
              {newImg && newImg !== DEFAULT_FEED_PLACEHOLDER_IMG ? (
                <span className="text-[10px] text-emerald-600 font-bold block mt-1.5">✓ 이미지 업로드 완료</span>
              ) : (
                <span className="text-[10px] text-[#ff5a5f] font-bold block mt-1.5">⚠ 사진 업로드 필요 (미등록 상태)</span>
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
  );
};
