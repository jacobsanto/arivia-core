
import React, { createContext, useContext, ReactNode } from 'react';
import { useGuestyListings } from '@/hooks/useGuestyListings';
import { useGuestyReservations } from '@/hooks/useGuestyReservations';
import { useGuestyTasks } from '@/hooks/useGuestyTasks';

interface GuestyContextType {
  listings: ReturnType<typeof useGuestyListings>;
  reservations: ReturnType<typeof useGuestyReservations>;
  tasks: ReturnType<typeof useGuestyTasks>;
}

const GuestyContext = createContext<GuestyContextType | undefined>(undefined);

export const GuestyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const listings = useGuestyListings();
  const reservations = useGuestyReservations();
  const tasks = useGuestyTasks();

  return (
    <GuestyContext.Provider 
      value={{
        listings,
        reservations,
        tasks
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
