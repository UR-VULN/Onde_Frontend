import React, { useState } from 'react';
import { CarSearchForm, type CarSearchParams } from '@/components/car/CarSearchForm';
import { CarRecommendationList } from '@/components/car/CarRecommendationList';

export const CarPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState<CarSearchParams | null>(null);

  return (
    <div className="w-full !-mt-[40px] relative z-20 transition-all duration-300 animate-[fadeIn_0.35s_ease]">

      {/* Car Search Form */}
      <CarSearchForm onSearch={setSearchParams} />

      {/* Spacer */}
      <div style={{ height: '4rem' }} />

      {/* Popular Car Recommendations (lazy loading grid) */}
      <CarRecommendationList searchParams={searchParams} />

    </div>
  );
};
