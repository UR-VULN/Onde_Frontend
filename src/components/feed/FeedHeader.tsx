import React from 'react';

export const FeedHeader: React.FC = () => {
  return (
    <div className="text-center space-y-10 pt-16 select-none">
      {/* Spacer to balance the layout offset */}
      <div className="h-16 w-full"></div>
      
      <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
        새로운 세상으로 향하는 모든 순간의 기록,<br />
        <span className="highlight-text">온데 여행자 광장</span>
      </h2>
      
      <div className="flex justify-center w-full">
        <p className="text-slate-500 font-medium max-w-2xl text-lg leading-relaxed text-center">
          기억은 서서히 흐려져도, 당신의 기록은 이곳에서 온전히 빛납니다.<br />
          생생한 리뷰와 인생 사진을 공유하고 서로의 여정에 새로운 영감을 더해 보세요.
        </p>
      </div>
    </div>
  );
};
