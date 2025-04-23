
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import PropertyInfoSection from '@/components/properties/listing-details/PropertyInfoSection';
import ManageBookingsSection from '@/components/properties/listing-details/ManageBookingsSection';
import GuestManagementSection from '@/components/properties/listing-details/GuestManagementSection';

const ListingDetails = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("property-info");

  // Query the listing details
  const { data: listing, isLoading: listingLoading } = useQuery({
    queryKey: ['guesty-listing', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guesty_listings')
        .select('*')
        .eq('id', listingId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!listingId,
  });

  if (listingLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-start h-10">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="w-10 h-10 p-0 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="animate-pulse space-y-4 mt-4">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-28 bg-muted rounded"></div>
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
        <div className="text-center p-6 border rounded-lg">
          <p className="text-muted-foreground">Listing not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Back button and header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="w-10 h-10 p-0 mr-2 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold truncate">{listing.title}</h1>
        </div>
      </div>

      {/* Tabs UI */}
      <Tabs
        defaultValue="property-info"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger 
            value="property-info" 
            className="text-center py-2 flex flex-col items-center"
          >
            <span className="inline-block w-full text-center">Property</span>
          </TabsTrigger>
          <TabsTrigger 
            value="bookings" 
            className="text-center py-2 flex flex-col items-center"
          >
            <span className="inline-block w-full text-center">Bookings</span>
          </TabsTrigger>
          <TabsTrigger 
            value="guests" 
            className="text-center py-2 flex flex-col items-center"
          >
            <span className="inline-block w-full text-center">Guests</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="property-info" className="mt-6">
          <PropertyInfoSection listing={listing} />
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <ManageBookingsSection 
            listing={listing} 
            isLoading={listingLoading} 
          />
        </TabsContent>

        <TabsContent value="guests" className="mt-6">
          <GuestManagementSection 
            listing={listing} 
            isLoading={listingLoading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ListingDetails;
