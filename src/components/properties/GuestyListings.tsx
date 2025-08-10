
// @ts-nocheck
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCcw } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { guestyService } from '@/services/guesty/guesty.service';
import { Skeleton } from "@/components/ui/skeleton";
import GuestyListingCard from './GuestyListingCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function GuestyListings() {
  // Query to fetch listings from Supabase
  const { data: listings, isLoading, error, refetch } = useQuery({
    queryKey: ['guesty-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guesty_listings')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data;
    }
  });

  // Sync with Guesty API
  const handleSync = async () => {
    try {
      await guestyService.syncListings();
      toast.success('Listings synced successfully');
      refetch();
    } catch (error) {
      console.error('Error syncing listings:', error);
      toast.error('Failed to sync listings');
    }
  };

  // Format the listing data to match the expected props for GuestyListingCard
  const formatListing = (listing: any) => {
    return {
      id: listing.id,
      title: listing.title,
      status: listing.status,
      thumbnail_url: listing.thumbnail_url,
      address: typeof listing.address === 'object' ? listing.address : { full: '' }
    };
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-medium">Error loading listings</p>
        <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Property Listings</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSync}
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
      ) : listings?.length ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <GuestyListingCard 
              key={listing.id} 
              listing={formatListing(listing)} 
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No listings found
          </CardContent>
        </Card>
      )}
    </div>
  );
}
