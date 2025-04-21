
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCcw, MapPin } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { guestyService } from '@/services/guesty/guesty.service';
import { Skeleton } from "@/components/ui/skeleton";

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
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : data?.results?.length ? (
        <div className="grid gap-4">
          {data.results.map((listing) => (
            <Card key={listing._id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{listing.title}</h3>
                    {listing.address?.full && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{listing.address.full}</span>
                      </div>
                    )}
                  </div>
                  {listing.cleaningStatus?.value && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      listing.cleaningStatus.value === 'clean' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {listing.cleaningStatus.value}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
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
