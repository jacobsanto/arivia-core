
import { useQuery } from "@tanstack/react-query";
import { guestyApiService } from "@/integrations/guesty/api";
import { adaptGuestyReservation } from "@/integrations/guesty/adapters";
import { useEffect, useState } from "react";

export const useGuestyBookings = (options: {
  limit?: number;
  propertyIds?: string[];
  statuses?: ('inquiry' | 'pendingOwnerConfirmation' | 'canceled' | 'confirmed' | 'declined')[];
  startDate?: Date;
  endDate?: Date;
} = {}) => {
  const [limit, setLimit] = useState(options.limit || 10);
  const [skip, setSkip] = useState(0);
  
  // Reset skip when filters change
  useEffect(() => {
    setSkip(0);
  }, [options.propertyIds, options.statuses, options.startDate, options.endDate, limit]);
  
  const query = useQuery({
    queryKey: [
      'guestyBookings', 
      limit, 
      skip, 
      options.propertyIds, 
      options.statuses, 
      options.startDate, 
      options.endDate
    ],
    queryFn: async () => {
      const response = await guestyApiService.getReservations({
        limit,
        skip,
        listingIds: options.propertyIds,
        statuses: options.statuses,
        checkInDateGte: options.startDate ? options.startDate.toISOString() : undefined,
        checkOutDateLte: options.endDate ? options.endDate.toISOString() : undefined
      });
      
      return {
        bookings: response.results.map(adaptGuestyReservation),
        pagination: {
          total: response.total,
          count: response.count,
          limit: response.limit,
          skip: response.skip
        }
      };
    },
    retry: 1,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  const loadMore = () => {
    if (!query.data) return;
    setSkip(skip + limit);
  };
  
  const hasMore = query.data ? (skip + query.data.pagination.count) < query.data.pagination.total : false;
  
  return {
    ...query,
    bookings: query.data?.bookings || [],
    pagination: query.data?.pagination,
    setLimit,
    loadMore,
    hasMore
  };
};

export const useGuestyBooking = (bookingId: string) => {
  return useQuery({
    queryKey: ['guestyBooking', bookingId],
    queryFn: async () => {
      const booking = await guestyApiService.getReservation(bookingId);
      return adaptGuestyReservation(booking);
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!bookingId
  });
};
