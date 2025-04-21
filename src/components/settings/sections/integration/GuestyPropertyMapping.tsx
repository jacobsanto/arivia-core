
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
import { guestyService, GuestyListingItem, type GuestyPropertyMappingType } from '@/services/integrations/guesty.service';
import { useProperties } from '@/hooks/useProperties';
import { Property } from '@/types/property.types';
import { Loader2, Link, Trash2 } from "lucide-react";

const GuestyPropertyMapping = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [guestyListings, setGuestyListings] = useState<GuestyListingItem[]>([]);
  const [mappings, setMappings] = useState<GuestyPropertyMappingType[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string | undefined>();
  const [selectedListing, setSelectedListing] = useState<string | undefined>();

  const { properties } = useProperties();
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Fix: always pass string for cursor param
        const listings = await guestyService.fetchListings(100, "0");
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
            Connect your internal properties to Guesty listings for synchronization. Please select one internal property and the Guesty listing to link it with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Property Dropdown */}
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger>
                <SelectValue placeholder="Select Property" />
              </SelectTrigger>
              <SelectContent>
                {properties
                  .filter(p => !mappings.some(m => m.property_id === p.id))
                  .map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      <span className="flex flex-col text-left">
                        <span className="font-medium">{property.name}</span>
                        {property.address && (
                          <span className="text-xs text-muted-foreground">{property.address}</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Guesty Listing Dropdown */}
            <Select value={selectedListing} onValueChange={setSelectedListing}>
              <SelectTrigger>
                <SelectValue placeholder="Select Guesty Listing" />
              </SelectTrigger>
              <SelectContent>
                {guestyListings.map(listing => (
                  <SelectItem key={listing.id} value={listing.id}>
                    <span className="flex flex-col text-left">
                      <span className="font-medium">
                        {listing.title || listing.nickname || "Untitled"}
                      </span>
                      {listing.address && typeof listing.address === 'object' && listing.address.full && (
                        <span className="text-xs text-muted-foreground">{listing.address.full}</span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Map Button */}
            <Button
              onClick={handleSyncProperty}
              disabled={!selectedProperty || !selectedListing || isSyncing}
              className="w-full md:w-auto"
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
              Properties currently linked to Guesty listings below. You can remove or update these mappings at any time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Property</th>
                    <th className="px-4 py-2 text-left">Guesty Listing</th>
                    <th className="px-4 py-2 text-left">Guesty Address</th>
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
                          <span className="font-medium">{property?.name || mapping.property_id}</span>
                          {property?.address && (
                            <div className="text-xs text-muted-foreground">{property.address}</div>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {listing ? (
                            <div className="flex flex-col">
                              <span className="font-medium">{listing.title || listing.nickname}</span>
                              {listing.picture?.thumbnail && (
                                <img
                                  src={listing.picture.thumbnail}
                                  alt={listing.title}
                                  className="w-8 h-8 object-cover mt-1 rounded"
                                />
                              )}
                            </div>
                          ) : (
                            <span>{mapping.guesty_listing_id}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {listing?.address && typeof listing.address === 'object' && listing.address.full ? (
                            <span>{listing.address.full}</span>
                          ) : (
                            <span className="text-muted-foreground">No address</span>
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
