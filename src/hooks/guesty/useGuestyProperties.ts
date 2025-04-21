
import { useQuery } from "@tanstack/react-query";
import { guestyApiService } from "@/integrations/guesty/api";
import { adaptGuestyProperty } from "@/integrations/guesty/adapters";
import { useEffect, useState } from "react";

export const useGuestyProperties = (initialLimit: number = 10) => {
  const [limit, setLimit] = useState(initialLimit);
  const [skip, setSkip] = useState(0);
  
  // Reset skip when limit changes
  useEffect(() => {
    setSkip(0);
  }, [limit]);
  
  const query = useQuery({
    queryKey: ['guestyProperties', limit, skip],
    queryFn: async () => {
      const response = await guestyApiService.getProperties({ limit, skip });
      
      return {
        properties: response.results.map(adaptGuestyProperty),
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
    properties: query.data?.properties || [],
    pagination: query.data?.pagination,
    setLimit,
    loadMore,
    hasMore
  };
};

export const useGuestyProperty = (propertyId: string) => {
  return useQuery({
    queryKey: ['guestyProperty', propertyId],
    queryFn: async () => {
      const property = await guestyApiService.getProperty(propertyId);
      return adaptGuestyProperty(property);
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!propertyId
  });
};
