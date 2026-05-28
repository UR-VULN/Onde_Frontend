import React, { useState } from 'react';
import { FlightSearchForm, type FlightSearchParams } from '@/components/flight/FlightSearchForm';
import { FlightRecommendationList } from '@/components/flight/FlightRecommendationList';
import { FlightReservationModal } from '@/components/flight/FlightReservationModal';

export const FlightPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState<FlightSearchParams | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);

  return (
    <div className="w-full transition-all duration-300 animate-[fadeIn_0.35s_ease]">

      {/* Flight search form */}
      <FlightSearchForm onSearch={setSearchParams} />

      {/* Spacer */}
      <div style={{ height: '4rem' }} />

      {/* Flight recommendation list — mock data, filtered by search params */}
      <FlightRecommendationList searchParams={searchParams} />

      {/* Reservation modal */}
      {selectedFlight && selectedSeat && (
        <FlightReservationModal
          flight={selectedFlight}
          seat={selectedSeat}
          onClose={() => {
            setSelectedFlight(null);
            setSelectedSeat(null);
          }}
        />
      )}
    </div>
  );
};
