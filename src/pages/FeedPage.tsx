import React from 'react';
import { useTravelStore } from '@/store/useTravelStore';

export const FeedPage: React.FC = () => {
  const { addToast } = useTravelStore();

  return (
    <div className="w-full mt-8 mb-20 transition-all duration-300 animate-[fadeIn_0.35s_ease]">
      
      {/* Feed Layout header */}
      <div className="flex justify-between items-end mb-8 border-b border-slate-200/80 pb-4">
        <div>
          <h4 className="font-logo font-black text-2xl text-slate-800 tracking-tight">실시간 여행기 피드</h4>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Live travel feeds from ONDE users</p>
        </div>
        <button
          type="button"
          className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
          onClick={() => addToast("여행기 글작성 작성 폼이 활성화됩니다.", "info")}
        >
          <i className="fa-solid fa-pen-to-square"></i> 내 여행기 작성
        </button>
      </div>

      {/* Feed Grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            id: 'feed-1',
            title: '도쿄 3박 4일 미식 코스 공유합니다! 🍣✨',
            author: '김현민',
            date: '2026.05.26',
            likes: 124,
            comments: 42,
            img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=600',
            desc: '인천공항에서 대한항공 비즈니스석 탑승 후 도쿄 나리타로 향했던 신주쿠 펜트하우스 여행기. 미슐랭 초밥 맛집부터 소소한 현지 이자카야 추천까지!'
          },
          {
            id: 'feed-2',
            title: '나홀로 떠난 제주 애월 독채 힐링 일기 🏡🌊',
            author: '이영희',
            date: '2026.05.24',
            likes: 89,
            comments: 18,
            img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
            desc: '제주의 시원한 바닷바람과 고즈넉한 한옥 독채에서의 조용한 3박. 온데에서 가입한 여행자 보험 덕분에 안심하고 온전히 휴식에 집중할 수 있었어요.'
          }
        ].map((item) => (
          <div 
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col group"
            onClick={() => addToast(`"${item.title}" 여행기 상세 페이지가 열립니다.`, "info")}
          >
            <div className="h-56 overflow-hidden relative select-none">
              <img 
                src={item.img} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
              />
              <span className="absolute bottom-4 left-4 bg-slate-900/60 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-black text-white shadow-sm uppercase tracking-widest">
                ONDE Travel Story
              </span>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase">
                  <span>작성자: {item.author}</span>
                  <span>{item.date}</span>
                </div>
                
                <strong className="text-base font-black text-slate-800 leading-snug group-hover:text-[#005ce6] transition-colors block">
                  {item.title}
                </strong>
                
                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">
                  {item.desc}
                </p>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-6">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">스토리 피드</span>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                    <i className="fa-regular fa-heart"></i> {item.likes}
                  </span>
                  <span className="flex items-center gap-1 hover:text-[#005ce6] transition-colors">
                    <i className="fa-regular fa-comment"></i> {item.comments}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
