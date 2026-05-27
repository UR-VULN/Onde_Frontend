import React, { useState } from 'react';
import { SellerSchedulePanel } from '@/components/flight/SellerSchedulePanel';

export const SellerPage: React.FC = () => {
  const [sellerTab] = useState<'flight' | 'insurance'>('flight');

  return (
    <div className="extranet-layout">
      <aside className="extranet-sidebar">
        <button 
          type="button"
          className="extranet-item active"
        >
          <i className="fa-solid fa-plane"></i> 항공/보험 상품 (B팀)
        </button>
      </aside>

      <main className="flex-1">
        {sellerTab === 'flight' ? (
          <SellerSchedulePanel />
        ) : (
          <div className="bg-white p-12 rounded-[28px] border border-slate-200 shadow-sm text-center max-w-lg mx-auto flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center text-3xl shadow-sm">
              <i className="fa-solid fa-hotel"></i>
            </div>
            <h3 className="font-logo font-extrabold text-xl text-slate-800">C파트 파트너 관리자</h3>
            <p className="text-xs text-slate-500">이 캔버스는 숙소 및 렌터카 파트너 extranet 공간입니다.</p>
          </div>
        )}
      </main>
    </div>
  );
};
