import React, { useState } from 'react';
import { StaySearchForm, type StaySearchParams } from '@/components/stay/StaySearchForm';
import { StayRecommendationList } from '@/components/stay/StayRecommendationList';

export const StayPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState<StaySearchParams | null>(null);

  return (
    <div className="w-full !-mt-[40px] relative z-20 transition-all duration-300 animate-[fadeIn_0.35s_ease]">
      
      {/* Stay Search Form */}
      <StaySearchForm onSearch={setSearchParams} />

      {/* Spacer — compensates for the hero overlap (-mt-[40px]) + shadow bleed */}
      <div style={{ height: '4rem' }} />

      {/* Popular Stay Recommendations (lazy loading grid) */}
      <StayRecommendationList searchParams={searchParams} />

    </div>
  );
};
