
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { guestyClient } from "@/integrations/guesty/client";
import { GuestyReservation, GuestyPaginatedResponse } from "@/types/guesty";
import { useState } from "react";
import { toastService } from "@/services/toast/toast.service";

interface ReservationsQueryParams {
  limit?: number;
  skip?: number;
  listingId?: string;
  guestId?: string;
  status?: string;
  checkInFrom?: string;
  checkInTo?: string;
  checkOutFrom?: string;
  checkOutTo?: string;
  sort?: string;
}

export const useGuestyReservations = (initialParams: ReservationsQueryParams = { limit: 20, skip: 0 }) => {
  const [queryParams, setQueryParams] = useState<ReservationsQueryParams>(initialParams);
  const queryClient = useQueryClient();

  // Fetch reservations with filters
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['guestyReservations', queryParams],
    queryFn: async () => {
      const params: Record<string, string> = {};
      
      if (queryParams.limit) params.limit = queryParams.limit.toString();
      if (queryParams.skip) params.skip = queryParams.skip.toString();
      if (queryParams.listingId) params.listingId = queryParams.listingId;
      if (queryParams.guestId) params.guestId = queryParams.guestId;
      if (queryParams.status) params.status = queryParams.status;
      if (queryParams.checkInFrom) params.checkInFrom = queryParams.checkInFrom;
      if (queryParams.checkInTo) params.checkInTo = queryParams.checkInTo;
      if (queryParams.checkOutFrom) params.checkOutFrom = queryParams.checkOutFrom;
      if (queryParams.checkOutTo) params.checkOutTo = queryParams.checkOutTo;
      if (queryParams.sort) params.sort = queryParams.sort;
      
      return guestyClient.get<GuestyPaginatedResponse<GuestyReservation>>('/reservations', params);
    }
  });

  // Get a single reservation by ID
  const getReservation = async (id: string) => {
    return guestyClient.get<GuestyReservation>(`/reservations/${id}`);
  };

  // Update a reservation
  const updateReservation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GuestyReservation> }) => {
      return guestyClient.put<GuestyReservation>(`/reservations/${id}`, data);
    },
    onSuccess: (updatedReservation) => {
      // Invalidate and refetch the reservations query after an update
      queryClient.invalidateQueries({ queryKey: ['guestyReservations'] });
      // Update the individual reservation in the cache
      queryClient.setQueryData(['guestyReservation', updatedReservation._id], updatedReservation);
      
      toastService.success('Reservation updated successfully', {
        description: `Reservation for guest ${updatedReservation.guest.firstName} ${updatedReservation.guest.lastName} has been updated.`
      });
    },
    onError: (error) => {
      toastService.error('Failed to update reservation', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });

  // Create a new reservation
  const createReservation = useMutation({
    mutationFn: (data: Partial<GuestyReservation>) => {
      return guestyClient.post<GuestyReservation>('/reservations', data);
    },
    onSuccess: () => {
      // Invalidate and refetch the reservations query after creating a new one
      queryClient.invalidateQueries({ queryKey: ['guestyReservations'] });
      
      toastService.success('Reservation created successfully', {
        description: 'The new reservation has been added to Guesty.'
      });
    },
    onError: (error) => {
      toastService.error('Failed to create reservation', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });

  // Pagination controls
  const nextPage = () => {
    if (data && data.results.length === queryParams.limit) {
      setQueryParams({
        ...queryParams,
        skip: (queryParams.skip || 0) + (queryParams.limit || 20)
      });
    }
  };

  const prevPage = () => {
    if ((queryParams.skip || 0) > 0) {
      setQueryParams({
        ...queryParams,
        skip: Math.max(0, (queryParams.skip || 0) - (queryParams.limit || 20))
      });
    }
  };

  return {
    reservations: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    isError,
    error,
    refetch,
    queryParams,
    setQueryParams,
    nextPage,
    prevPage,
    getReservation,
    updateReservation,
    createReservation
  };
};
