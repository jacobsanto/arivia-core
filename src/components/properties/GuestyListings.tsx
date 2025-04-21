
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCcw } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { guestyService } from '@/services/guesty/guesty.service';
import { Skeleton } from "@/components/ui/skeleton";
import GuestyListingCard from './GuestyListingCard';

export function GuestyListings() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['guesty-listings'],
    queryFn: () => guestyService.getGuestyListings(),
    retry: 1
  });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-medium">Error loading Guesty listings</p>
        <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Guesty Listings</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Sync Listings
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full" />
          ))}
        </div>
      ) : data?.results?.length ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {data.results.map((listing) => (
            <GuestyListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No Guesty listings found
          </CardContent>
        </Card>
      )}
    </div>
  );
}
