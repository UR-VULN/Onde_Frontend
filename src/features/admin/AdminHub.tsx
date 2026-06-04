import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';

const AdminHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'approval' | 'reservation'>('approval');
  const { addToast } = useTravelStore();

  const mockPendingApprovals = [
    { id: 1, category: '숙소', name: '제주 신라호텔', seller: 'seller_jeju', date: '2026-05-25' },
    { id: 2, category: '렌터카', name: '현대 팰리세이드', seller: 'car_rent_1', date: '2026-05-26' },
  ];

  const mockReservations = [
    { id: 'RES-101', category: '숙소', title: '그랜드 하얏트 서울', user: 'user_kim', status: '이용 중', date: '2026-05-24 ~ 2026-05-27' },
    { id: 'RES-102', category: '렌터카', title: '제네시스 G80', user: 'user_lee', status: '이용 완료 대기', date: '2026-05-25 ~ 2026-05-26' },
  ];

  const handleApprove = (id: number) => {
    addToast('상품이 승인되었습니다. 즉시 노출이 시작됩니다.', 'success');
  };

  const handleReject = (id: number) => {
    addToast('상품이 반려되었습니다. 판매자에게 사유가 발송됩니다.', 'warning');
  };

  const handleComplete = (id: string) => {
    addToast('예약 상태가 이용 완료로 강제 업데이트되었습니다.', 'info');
  };

  return (
    <div className="admin-hub max-w-6xl mx-auto animate-[fadeIn_0.4s_ease]">
      <div className="flex gap-4 mb-8">
        <button 
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'approval' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setActiveTab('approval')}
        >
          <i className="fa-solid fa-clipboard-check mr-2"></i>입점 상품 검수
        </button>
        <button 
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'reservation' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setActiveTab('reservation')}
        >
          <i className="fa-solid fa-list-check mr-2"></i>전사 예약 현황 관리
        </button>
      </div>

      {activeTab === 'approval' ? (
        <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-stamp"></i>
            </div>
            대기 중인 입점 신청 목록
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="pb-4 px-4">카테고리</th>
                  <th className="pb-4 px-4">상품명</th>
                  <th className="pb-4 px-4">판매자</th>
                  <th className="pb-4 px-4">신청일</th>
                  <th className="pb-4 px-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold">
                {mockPendingApprovals.map(item => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] ${item.category === '숙소' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-800">{item.name}</td>
                    <td className="py-4 px-4 text-slate-500">{item.seller}</td>
                    <td className="py-4 px-4 text-slate-400 font-mono">{item.date}</td>
                    <td className="py-4 px-4 text-right flex justify-end gap-2">
                      <button 
                        className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-100 transition-all"
                        onClick={() => handleApprove(item.id)}
                      >
                        승인
                      </button>
                      <button 
                        className="bg-rose-50 text-rose-500 px-3 py-1.5 rounded-lg text-xs hover:bg-rose-100 transition-all"
                        onClick={() => handleReject(item.id)}
                      >
                        반려
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-database"></i>
            </div>
            전사 예약 데이터 모니터링
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="pb-4 px-4">예약번호</th>
                  <th className="pb-4 px-4">상품명</th>
                  <th className="pb-4 px-4">이용자</th>
                  <th className="pb-4 px-4">상태</th>
                  <th className="pb-4 px-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold">
                {mockReservations.map(res => (
                  <tr key={res.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                    <td className="py-4 px-4 text-slate-400 font-mono">{res.id}</td>
                    <td className="py-4 px-4 text-slate-800">
                      <div className="flex flex-col">
                        <span>{res.title}</span>
                        <span className="text-[10px] text-slate-400">{res.date}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{res.user}</td>
                    <td className="py-4 px-4">
                      <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-md text-[10px]">
                        {res.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-slate-800 transition-all"
                        onClick={() => handleComplete(res.id)}
                      >
                        이용 완료 처리
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHub;
