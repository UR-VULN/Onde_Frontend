import React, { useState } from 'react';
import InventoryCalendar from './InventoryCalendar';
import { useTravelStore } from '@/store/useTravelStore';

const SellerBackOffice: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'inventory'>('register');
  const { addToast } = useTravelStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    region: '서울',
    city: '',
    starRating: 5,
    amenities: [] as string[]
  });

  const amenitiesOptions = ['WiFi', '수영장', '주차장', '조식', '피트니스', '스파'];

  const handleToggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity) 
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registering accommodation:', formData);
    addToast('숙소 등록 신청이 완료되었습니다. 관리자 승인 후 노출됩니다.', 'success');
  };

  return (
    <div className="seller-backoffice max-w-6xl mx-auto animate-[fadeIn_0.4s_ease]">
      <div className="flex gap-4 mb-8">
        <button 
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'register' ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setActiveTab('register')}
        >
          <i className="fa-solid fa-plus-circle mr-2"></i>상품 등록 신청
        </button>
        <button 
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'inventory' ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setActiveTab('inventory')}
        >
          <i className="fa-solid fa-calendar-days mr-2"></i>재고 및 가격 관리
        </button>
      </div>

      {activeTab === 'register' ? (
        <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-hotel"></i>
            </div>
            새로운 숙소 등록
          </h2>
          
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase">숙소 이름</label>
                <input 
                  type="text" 
                  placeholder="예: 시그니엘 서울"
                  className="bg-slate-50 border-none outline-none p-4 rounded-2xl font-bold text-sm focus:ring-2 ring-primary/20 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase">숙소 설명</label>
                <textarea 
                  placeholder="숙소에 대한 상세 설명을 입력해주세요."
                  className="bg-slate-50 border-none outline-none p-4 rounded-2xl font-bold text-sm h-32 focus:ring-2 ring-primary/20 transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase">지역</label>
                  <select 
                    className="bg-slate-50 border-none outline-none p-4 rounded-2xl font-bold text-sm appearance-none"
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                  >
                    <option value="서울">서울</option>
                    <option value="부산">부산</option>
                    <option value="제주">제주</option>
                    <option value="강원">강원</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase">성급</label>
                  <select 
                    className="bg-slate-50 border-none outline-none p-4 rounded-2xl font-bold text-sm appearance-none"
                    value={formData.starRating}
                    onChange={(e) => setFormData({...formData, starRating: parseInt(e.target.value)})}
                  >
                    <option value={5}>5성급</option>
                    <option value={4}>4성급</option>
                    <option value={3}>3성급</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs font-black text-slate-400 uppercase">편의시설</label>
                <div className="flex flex-wrap gap-2">
                  {amenitiesOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.amenities.includes(opt) ? 'bg-primary text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                      onClick={() => handleToggleAmenity(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all mt-4"
              >
                숙소 등록 신청하기
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
              실시간 재고 및 가격 제어
            </h2>
            <div className="flex gap-2">
              <select className="bg-slate-50 border-none outline-none px-4 py-2 rounded-xl font-bold text-xs appearance-none">
                <option>디럭스 더블룸</option>
                <option>프리미어 스위트</option>
              </select>
            </div>
          </div>
          <InventoryCalendar initialData={[]} onUpdate={(data) => console.log('Updated inventory:', data)} />
          <div className="mt-8 flex justify-end">
            <button 
              className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
              onClick={() => addToast('변경사항이 저장되었습니다.', 'success')}
            >
              설정 저장하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerBackOffice;
