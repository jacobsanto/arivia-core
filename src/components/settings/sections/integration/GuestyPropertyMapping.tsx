
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { guestyService, GuestyListingItem } from '@/services/integrations/guesty.service';
import type { GuestyPropertyMapping } from '@/services/integrations/guesty.service';
import { useProperties } from '@/hooks/useProperties';
import { Property } from '@/types/property.types';
import { Loader2, Link, Trash2 } from "lucide-react";

const GuestyPropertyMapping = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [guestyListings, setGuestyListings] = useState<GuestyListingItem[]>([]);
  const [mappings, setMappings] = useState<GuestyPropertyMapping[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string | undefined>();
  const [selectedListing, setSelectedListing] = useState<string | undefined>();
  
  const { properties } = useProperties();
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const listings = await guestyService.fetchListings(100, 0);
        setGuestyListings(listings);
        
        const existingMappings = await guestyService.getMappings();
        setMappings(existingMappings);
      } catch (error) {
        console.error("Failed to load Guesty data:", error);
        toast({
          title: "Error",
          description: "Failed to load Guesty data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleSyncProperty = async () => {
    if (!selectedProperty || !selectedListing) {
      toast({
        title: "Missing selection",
        description: "Please select both a property and a Guesty listing",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSyncing(true);
      
      const result = await guestyService.syncProperty(selectedProperty, selectedListing);
      
      setMappings(prev => {
        const existingIndex = prev.findIndex(m => m.property_id === selectedProperty);
        if (existingIndex >= 0) {
          return [
            ...prev.slice(0, existingIndex),
            result,
            ...prev.slice(existingIndex + 1)
          ];
        }
        return [...prev, result];
      });
      
      setSelectedProperty(undefined);
      setSelectedListing(undefined);
      
      toast({
        title: "Success",
        description: "Property successfully mapped to Guesty listing",
      });
    } catch (error) {
      console.error("Failed to sync property:", error);
      toast({
        title: "Error",
        description: "Failed to sync property with Guesty",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteMapping = async (propertyId: string) => {
    try {
      const success = await guestyService.deleteMapping(propertyId);
      
      if (success) {
        setMappings(prev => prev.filter(m => m.property_id !== propertyId));
        
        toast({
          title: "Success",
          description: "Mapping successfully removed",
        });
      } else {
        throw new Error("Failed to delete mapping");
      }
    } catch (error) {
      console.error("Failed to delete mapping:", error);
      toast({
        title: "Error",
        description: "Failed to remove property mapping",
        variant: "destructive",
      });
    }
  };

  const getPropertyDetails = (propertyId: string): Property | undefined => {
    return properties.find(p => p.id === propertyId);
  };
  
  const getListingDetails = (listingId: string): GuestyListingItem | undefined => {
    return guestyListings.find(l => l.id === listingId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Map Properties to Guesty</CardTitle>
          <CardDescription>
            Connect your properties to Guesty listings for synchronization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger>
                <SelectValue placeholder="Select Property" />
              </SelectTrigger>
              <SelectContent>
                {properties
                  .filter(p => !mappings.some(m => m.property_id === p.id))
                  .map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedListing} onValueChange={setSelectedListing}>
              <SelectTrigger>
                <SelectValue placeholder="Select Guesty Listing" />
              </SelectTrigger>
              <SelectContent>
                {guestyListings.map(listing => (
                  <SelectItem key={listing.id} value={listing.id}>
                    {listing.title || listing.nickname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleSyncProperty} 
              disabled={!selectedProperty || !selectedListing || isSyncing}
            >
              {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Map Property
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {mappings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Property Mappings</CardTitle>
            <CardDescription>
              Properties currently linked to Guesty listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Property</th>
                    <th className="px-4 py-2 text-left">Guesty Listing</th>
                    <th className="px-4 py-2 text-left">Last Updated</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map(mapping => {
                    const property = getPropertyDetails(mapping.property_id);
                    const listing = getListingDetails(mapping.guesty_listing_id);
                    
                    return (
                      <tr key={mapping.property_id} className="border-b">
                        <td className="px-4 py-2">
                          {property?.name || mapping.property_id}
                        </td>
                        <td className="px-4 py-2">
                          {listing ? (
                            <div className="flex items-center">
                              {listing.title || listing.nickname}
                              <Link className="ml-2 h-4 w-4 text-muted-foreground" />
                            </div>
                          ) : (
                            mapping.guesty_listing_id
                          )}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {new Date(mapping.updated_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMapping(mapping.property_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GuestyPropertyMapping;
