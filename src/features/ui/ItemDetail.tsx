import React from 'react';
import { useTravelStore } from '@/store/useTravelStore';

interface ItemDetailProps {
  item: any;
  type: 'stay' | 'car';
  onClose: () => void;
}

const ItemDetail: React.FC<ItemDetailProps> = ({ item, type, onClose }) => {
  const { addToast, addReservation } = useTravelStore();

  const handleBooking = () => {
    const newRes = {
      id: `res-${Math.random().toString(36).substr(2, 9)}`,
      category: type,
      title: item.name,
      badge: '예약 확정',
      badgeType: 'reserved',
      date: type === 'stay' ? '2026. 10. 24 ~ 10. 27 (3박 4일)' : '2026. 10. 24 ~ 10. 29 (5일 대여)',
      details: type === 'stay' ? `정원: 게스트 2명 | 결제: ${item.price}` : `인수: ${item.location} | 결제: ${item.price}`,
      price: item.price
    };
    
    addReservation(newRes);
    addToast(`${item.name} 예약이 완료되었습니다!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
      <div className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-[scaleUp_0.3s_ease]">
        <div className="md:w-1/2 h-64 md:h-auto relative">
          <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <div className="md:w-1/2 p-10 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 inline-block ${type === 'stay' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                {type === 'stay' ? 'Accommodation' : 'Rental Car'}
              </span>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">{item.name}</h2>
            </div>
            {type === 'stay' && (
              <div className="flex text-yellow-400 gap-0.5">
                {'★'.repeat(item.rating)}
              </div>
            )}
          </div>
          
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            {type === 'stay' 
              ? `${item.region}의 중심부에 위치한 이 숙소는 최고의 서비스와 편안함을 제공합니다. 세련된 인테리어와 최신 편의시설을 갖추고 있어 여행객들에게 완벽한 휴식을 선사합니다.`
              : `${item.location} 어디서든 편리하게 인수하고 반납할 수 있는 최고의 ${item.type} 차량입니다. 철저한 정비와 청결 관리로 안전하고 쾌적한 드라이빙을 보장합니다.`
            }
          </p>
          
          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                <i className={type === 'stay' ? 'fa-solid fa-location-dot' : 'fa-solid fa-car-side'}></i>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">위치 정보</p>
                <p className="text-sm font-bold text-slate-700">{type === 'stay' ? item.region : item.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                <i className="fa-solid fa-tag"></i>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">가격 요금</p>
                <p className="text-sm font-bold text-slate-700">{item.price} <span className="text-xs font-normal text-slate-400">/ {type === 'stay' ? '1박' : '24시간'}</span></p>
              </div>
            </div>
          </div>
          
          <div className="mt-auto flex gap-4">
            <button 
              className="flex-1 bg-slate-100 text-slate-600 h-14 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
              onClick={onClose}
            >
              나중에 하기
            </button>
            <button 
              className={`flex-[2] text-white h-14 rounded-2xl font-black text-sm hover:brightness-110 transition-all shadow-lg ${type === 'stay' ? 'bg-primary shadow-primary/20' : 'bg-secondary shadow-secondary/20'}`}
              onClick={handleBooking}
            >
              지금 바로 예약하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
