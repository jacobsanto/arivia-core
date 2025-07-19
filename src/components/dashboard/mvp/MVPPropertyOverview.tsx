
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MapPin, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const MVPPropertyOverview: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties-overview'],
    queryFn: async () => {
      const { data } = await supabase
        .from('guesty_listings')
        .select('*')
        .eq('sync_status', 'active')
        .limit(6);
      
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Property Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Property Overview</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/properties")}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {properties?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No properties found</p>
            <p className="text-sm mt-1">Sync your properties from Guesty to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {properties?.map((property) => (
              <div
                key={property.id}
                className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/properties/listings/${property.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-foreground truncate pr-2">
                    {property.title}
                  </h3>
                  <Badge 
                    variant={property.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {property.status}
                  </Badge>
                </div>
                
                {property.address && (
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">
                      {typeof property.address === 'object' 
                        ? `${property.address.city || ''}, ${property.address.country || ''}`
                        : property.address
                      }
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{property.property_type || 'Property'}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/properties/listings/${property.id}`);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
