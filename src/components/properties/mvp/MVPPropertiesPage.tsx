import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, RefreshCw, Building, MapPin, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { BookingSyncButton } from "@/components/properties/listing-details/BookingSyncButton";
export const MVPPropertiesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  const {
    data: properties,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['properties-list', searchTerm, filterStatus],
    queryFn: async () => {
      let query = supabase.from('guesty_listings').select('*');
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      const {
        data
      } = await query.order('created_at', {
        ascending: false
      });
      return data || [];
    }
  });
  const handleSyncComplete = () => {
    refetch();
  };
  return <>
      <Helmet>
        <title>Properties - Arivia Villas Management</title>
      </Helmet>
      
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Properties</h1>
            <p className="text-muted-foreground">Manage your property portfolio</p>
          </div>
          
          <div className="flex items-center gap-2">
            <BookingSyncButton onSyncComplete={handleSyncComplete} label="Sync from Guesty" />
            <Button onClick={() => refetch()} className="bg-[d1aa7e] text-zinc-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search properties..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant={filterStatus === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('all')}>
                  All
                </Button>
                <Button variant={filterStatus === 'active' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('active')}>
                  Active
                </Button>
                <Button variant={filterStatus === 'inactive' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('inactive')}>
                  Inactive
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-lg"></div>
                  </div>)}
              </div> : properties?.length === 0 ? <div className="text-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Sync your properties from Guesty to get started'}
                </p>
                {!searchTerm && <BookingSyncButton onSyncComplete={handleSyncComplete} label="Sync Properties from Guesty" />}
              </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties?.map(property => <Card key={property.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div onClick={() => navigate(`/properties/listings/${property.id}`)}>
                      {property.thumbnail_url && <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img src={property.thumbnail_url} alt={property.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </div>}
                      
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground truncate pr-2">
                            {property.title}
                          </h3>
                          <Badge variant={property.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {property.status}
                          </Badge>
                        </div>
                        
                        {property.address && <div className="flex items-center text-sm text-muted-foreground mb-3">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {typeof property.address === 'object' && property.address && !Array.isArray(property.address) ? `${(property.address as any).city || ''}, ${(property.address as any).country || ''}` : String(property.address || 'Address not available')}
                            </span>
                          </div>}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {property.property_type || 'Property'}
                          </span>
                          <Button variant="ghost" size="sm" onClick={e => {
                      e.stopPropagation();
                      navigate(`/properties/listings/${property.id}`);
                    }}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>)}
              </div>}
          </CardContent>
        </Card>
      </div>
    </>;
};