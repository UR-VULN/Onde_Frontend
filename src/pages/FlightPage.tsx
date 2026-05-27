import React, { useState } from 'react';
import { FlightSearchForm } from '@/components/flight/FlightSearchForm';
import { FlightSearchResultList } from '@/components/flight/FlightSearchResultList';
import { FlightReservationModal } from '@/components/flight/FlightReservationModal';

export const FlightPage: React.FC = () => {
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);

  return (
    <div className="w-full transition-all duration-300 animate-[fadeIn_0.35s_ease]">
      {/* Flight search widget with inputs and calendar configurations */}
      <FlightSearchForm />

      {/* Flight search result cards listing available schedules & seats */}
      <FlightSearchResultList 
        on_select_seat={(flight, seat) => {
          setSelectedFlight(flight);
          setSelectedSeat(seat);
        }}
      />

      {/* Global reservation hold & passenger manifest form modal */}
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
