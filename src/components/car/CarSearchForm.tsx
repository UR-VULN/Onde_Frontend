import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { SearchDateField } from '@/components/common/SearchDateField';
import { SearchListPicker } from '@/components/common/SearchListPicker';
import { CAR_RENTAL_CITIES, DEFAULT_CAR_RENTAL_CITY } from '@/constants/carRentalCities';
import { CAR_TYPE_OPTIONS, DEFAULT_CAR_TYPE } from '@/constants/carTypes';
import { todayStr, toDateStr } from '@/utils/calendarUtils';

export interface CarSearchParams {
  pickupSpot: string;
  pickupDate: string;
  returnDate: string;
  carType: string;
}

interface CarSearchFormProps {
  onSearch?: (params: CarSearchParams) => void;
  loading?: boolean;
}

export const CarSearchForm: React.FC<CarSearchFormProps> = ({ onSearch, loading = false }) => {
  const { addToast } = useTravelStore();

  const [pickupSpot, setPickupSpot] = useState(DEFAULT_CAR_RENTAL_CITY);
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [returnDate, setReturnDate] = useState(() => {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    return toDateStr(next);
  });
  const [carType, setCarType] = useState(DEFAULT_CAR_TYPE);

  const handlePickupChange = (value: string) => {
    setPickupDate(value);
    if (returnDate <= value) {
      const next = new Date(`${value}T00:00:00`);
      next.setDate(next.getDate() + 1);
      setReturnDate(toDateStr(next));
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const params = { pickupSpot, pickupDate, returnDate, carType };
    addToast('실시간 렌터카를 조회 중입니다...', 'info');
    onSearch?.(params);
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col select-none overflow-visible">
      <div className="lg:hidden h-1 w-full" style={{ background: 'linear-gradient(135deg, #005ce6 0%, #ff5a5f 100%)' }} />
      <div className="flex flex-col">
      <form onSubmit={handleSearchSubmit} className="w-full">
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col lg:flex-row items-stretch min-h-[64px] lg:h-[68px] relative overflow-visible">

            <SearchListPicker
              label="인수 / 반납 장소"
              value={pickupSpot}
              options={CAR_RENTAL_CITIES}
              onChange={setPickupSpot}
              iconClass="fa-solid fa-car-tunnel text-[#005ce6]"
              panelTitle="어디서 대여하시나요?"
              panelSubtitle="도시를 선택하세요"
              listLabel="도시"
              panelWidth={320}
            />

            <div className="lg:hidden" style={{ height: '1px', background: '#e2e8f0', margin: '0 0.75rem' }}></div>
            <div className="hidden lg:block" style={{ width: '1px', background: '#e2e8f0', margin: '0.625rem 0' }}></div>

            <SearchDateField
              label="대여 일시"
              value={pickupDate}
              onChange={handlePickupChange}
              min={todayStr()}
            />

            <div className="lg:hidden" style={{ height: '1px', background: '#e2e8f0', margin: '0 0.75rem' }}></div>
            <div className="hidden lg:block" style={{ width: '1px', background: '#e2e8f0', margin: '0.625rem 0' }}></div>

            <SearchDateField
              label="반납 일시"
              value={returnDate}
              onChange={setReturnDate}
              min={pickupDate}
            />

            <div className="lg:hidden" style={{ height: '1px', background: '#e2e8f0', margin: '0 0.75rem' }}></div>
            <div className="hidden lg:block" style={{ width: '1px', background: '#e2e8f0', margin: '0.625rem 0' }}></div>

            <SearchListPicker
              label="차종 선택"
              value={carType}
              options={CAR_TYPE_OPTIONS}
              onChange={setCarType}
              iconClass="fa-solid fa-car text-slate-500"
              panelTitle="어떤 차량을 찾으시나요?"
              panelSubtitle="차종을 선택하세요"
              listLabel="차종"
              panelWidth={380}
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-[48px] lg:h-[68px] w-full lg:w-[68px] rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0 shadow-[0_4px_12px_rgba(255,90,95,0.2)] hover:shadow-[0_6px_20px_rgba(255,90,95,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #005ce6 0%, #ff5a5f 100%)', color: '#ffffff', opacity: loading ? 0.6 : 1 }}
            title="렌터카 검색"
          >
            <i className="fa-solid fa-magnifying-glass text-lg text-white"></i>
          </button>

        </div>
      </form>
      </div>
    </div>
  );
};

