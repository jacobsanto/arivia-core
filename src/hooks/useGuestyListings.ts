
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { guestyClient } from "@/integrations/guesty/client";
import { GuestyListing, GuestyPaginatedResponse } from "@/types/guesty";
import { useState } from "react";
import { toastService } from "@/services/toast/toast.service";

interface ListingsQueryParams {
  limit?: number;
  skip?: number;
  active?: boolean;
  sort?: string;
  fields?: string;
}

export const useGuestyListings = (initialParams: ListingsQueryParams = { limit: 20, skip: 0 }) => {
  const [queryParams, setQueryParams] = useState<ListingsQueryParams>(initialParams);
  const queryClient = useQueryClient();

  // Fetch all listings with pagination
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['guestyListings', queryParams],
    queryFn: async () => {
      const params: Record<string, string> = {};
      
      if (queryParams.limit) params.limit = queryParams.limit.toString();
      if (queryParams.skip) params.skip = queryParams.skip.toString();
      if (queryParams.active !== undefined) params.active = queryParams.active.toString();
      if (queryParams.sort) params.sort = queryParams.sort;
      if (queryParams.fields) params.fields = queryParams.fields;
      
      return guestyClient.get<GuestyPaginatedResponse<GuestyListing>>('/listings', params);
    }
  });

  // Get a single listing by ID
  const getListing = async (id: string) => {
    return guestyClient.get<GuestyListing>(`/listings/${id}`);
  };

  // Update a listing
  const updateListing = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GuestyListing> }) => {
      return guestyClient.put<GuestyListing>(`/listings/${id}`, data);
    },
    onSuccess: (updatedListing) => {
      // Invalidate and refetch the listings query after an update
      queryClient.invalidateQueries({ queryKey: ['guestyListings'] });
      // Update the individual listing in the cache
      queryClient.setQueryData(['guestyListing', updatedListing._id], updatedListing);
      
      toastService.success('Listing updated successfully', {
        description: `${updatedListing.title || updatedListing.nickname} has been updated in Guesty.`
      });
    },
    onError: (error) => {
      toastService.error('Failed to update listing', {
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
    listings: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    isError,
    error,
    refetch,
    queryParams,
    setQueryParams,
    nextPage,
    prevPage,
    getListing,
    updateListing
  };
};
