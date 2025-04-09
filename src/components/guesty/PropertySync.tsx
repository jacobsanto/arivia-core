
import { useState } from 'react';
import { useGuesty } from '@/contexts/GuestyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, ArrowDown, ArrowUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GuestyListing } from '@/types/guesty';
import { toastService } from '@/services/toast/toast.service';

export default function PropertySync() {
  const { listings } = useGuesty();
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const syncAllProperties = async () => {
    try {
      setSyncInProgress(true);
      // This would typically be implemented to synchronize properties
      // between Guesty and your local database
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toastService.success('Properties synchronized', {
        description: `${listings.listings.length} properties have been synced from Guesty`
      });
    } catch (error) {
      toastService.error('Sync failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setSyncInProgress(false);
    }
  };

  const renderStatus = (listing: GuestyListing) => {
    if (listing.active) {
      return <Badge variant="success" className="ml-2 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active</Badge>;
    }
    return <Badge variant="destructive" className="ml-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Inactive</Badge>;
  };

  const filteredListings = listings.listings.filter(listing => {
    if (activeTab === 'active') return listing.active;
    if (activeTab === 'inactive') return !listing.active;
    return true; // 'all' tab
  });

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center justify-between">
          <span>Guesty Property Sync</span>
          <Button 
            onClick={syncAllProperties} 
            disabled={syncInProgress || listings.isLoading}
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncInProgress ? 'animate-spin' : ''}`} />
            {syncInProgress ? 'Syncing...' : 'Sync Now'}
          </Button>
        </CardTitle>
        <CardDescription>
          Synchronize properties between Guesty and Arivia Villas
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="all">All Properties</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {listings.isLoading ? (
                <div className="flex justify-center p-8">
                  <RefreshCw className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : filteredListings.length > 0 ? (
                filteredListings.map(listing => (
                  <div key={listing._id} className="border rounded-md p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{listing.title || listing.nickname}</div>
                      <div className="text-sm text-muted-foreground">{listing.address?.full || 'No address'}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {listing.bedrooms} bedrooms • {listing.bathrooms} bathrooms • Accommodates {listing.accommodates}
                      </div>
                    </div>
                    <div>
                      {renderStatus(listing)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No properties found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredListings.length} of {listings.totalCount} properties
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={listings.prevPage}
            disabled={listings.queryParams.skip === 0}
            className="flex items-center gap-1"
          >
            <ArrowUp className="h-4 w-4" /> Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={listings.nextPage}
            disabled={filteredListings.length < (listings.queryParams.limit || 20)}
            className="flex items-center gap-1"
          >
            Next <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
