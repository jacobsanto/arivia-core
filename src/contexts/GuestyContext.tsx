
import React, { createContext, useContext, ReactNode } from 'react';
import { useGuestyListings } from '@/hooks/useGuestyListings';
import { useGuestyReservations } from '@/hooks/useGuestyReservations';

interface GuestyContextType {
  listings: ReturnType<typeof useGuestyListings>;
  reservations: ReturnType<typeof useGuestyReservations>;
}

const GuestyContext = createContext<GuestyContextType | undefined>(undefined);

export const GuestyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const listings = useGuestyListings();
  const reservations = useGuestyReservations({
    limit: 20,
    skip: 0,
    checkInFrom: new Date(2024, 0, 1).toISOString() // Starting from January 1, 2024
  });

  return (
    <GuestyContext.Provider 
      value={{
        listings,
        reservations
      }}
    >
      {children}
    </GuestyContext.Provider>
  );
};

export const useGuesty = (): GuestyContextType => {
  const context = useContext(GuestyContext);
  if (!context) {
    throw new Error('useGuesty must be used within a GuestyProvider');
  }
  return context;
};
