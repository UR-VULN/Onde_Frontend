import React from 'react';

export const InsuranceHeader: React.FC = () => {
  return (
    <div className="text-center space-y-10 pt-16">
      {/* Explicit spacer in the exact position of the removed badge */}
      <div className="h-16 w-full"></div>
      
      <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
        낯선 곳에서의 일상도 안심할 수 있도록,<br />
        <span className="highlight-text">온데 안심 여행자 보험</span>
      </h2>
      <div 
        style={{ margin: '16px 0' }}
        className="flex justify-center w-full"
      >
        <p className="text-slate-500 font-medium max-w-2xl text-lg leading-relaxed text-center">
          복잡한 서류 없이 1분 만에 가입하고, 해외 상해부터 수하물 지연까지<br />
          당신의 모든 여정을 든든하게 지켜드립니다.
        </p>
      </div>
    </div>
  );
};
