import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailedProperty } from "@/hooks/useDetailedProperties";
import { PropertyGallery } from "./PropertyGallery";
import { PropertyOverviewTab } from "./PropertyOverviewTab";
import { PropertyOperationsTab } from "./PropertyOperationsTab";
import { PropertyDamageReportsTab } from "./PropertyDamageReportsTab";
import { PropertyFinancialsTab } from "./PropertyFinancialsTab";
import { PropertyNotesTab } from "./PropertyNotesTab";
import { 
  ArrowLeft, 
  Edit, 
  Share2, 
  MapPin,
  Users,
  Calendar,
  AlertTriangle
} from "lucide-react";

export const PropertyDetailView: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { property, isLoading, error } = useDetailedProperty(propertyId || null);
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return <PropertyDetailSkeleton />;
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-lg font-semibold text-foreground">Property not found</div>
          <div className="text-muted-foreground">The property you're looking for doesn't exist.</div>
          <Button onClick={() => navigate('/properties')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'occupied': return 'default';
      case 'vacant': return 'secondary';
      case 'maintenance': return 'destructive';
      default: return 'outline';
    }
  };

  const getRoomStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ready': return 'default';
      case 'cleaned': return 'secondary';
      case 'cleaning': return 'outline';
      case 'inspected': return 'default';
      case 'dirty': return 'destructive';
      default: return 'outline';
    }
  };

  const totalOpenIssues = property.open_tasks.housekeeping + property.open_tasks.maintenance + property.open_tasks.damage_reports;

  return (
    <>
      <Helmet>
        <title>{property.name} - Property Details - Arivia Villas</title>
        <meta name="description" content={`Detailed view of ${property.name} property including amenities, operations, and financial information.`} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/properties')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {property.name}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    {property.address}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Property
                </Button>
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(property.status)} className="capitalize">
                  {property.status}
                </Badge>
                <Badge variant={getRoomStatusBadgeVariant(property.room_status)} className="capitalize">
                  Room: {property.room_status}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {property.property_type}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Up to {property.max_guests} guests
                </div>
                {property.next_checkin && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Next check-in: {new Date(property.next_checkin).toLocaleDateString()}
                  </div>
                )}
                {totalOpenIssues > 0 && (
                  <div className="flex items-center gap-1 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    {totalOpenIssues} open issue{totalOpenIssues !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Gallery */}
            <div className="lg:col-span-2">
              <PropertyGallery images={property.images} propertyName={property.name} />
            </div>

            {/* Right Column - Quick Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Bedrooms</div>
                      <div className="text-muted-foreground">{property.num_bedrooms}</div>
                    </div>
                    <div>
                      <div className="font-medium">Bathrooms</div>
                      <div className="text-muted-foreground">{property.num_bathrooms}</div>
                    </div>
                    <div>
                      <div className="font-medium">Max Guests</div>
                      <div className="text-muted-foreground">{property.max_guests}</div>
                    </div>
                    {property.square_feet && (
                      <div>
                        <div className="font-medium">Size</div>
                        <div className="text-muted-foreground">{property.square_feet} sq ft</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Open Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Housekeeping</span>
                      <Badge variant={property.open_tasks.housekeeping > 0 ? "destructive" : "secondary"}>
                        {property.open_tasks.housekeeping}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Maintenance</span>
                      <Badge variant={property.open_tasks.maintenance > 0 ? "destructive" : "secondary"}>
                        {property.open_tasks.maintenance}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Damage Reports</span>
                      <Badge variant={property.open_tasks.damage_reports > 0 ? "destructive" : "secondary"}>
                        {property.open_tasks.damage_reports}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabbed Content */}
          <div className="mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="operations">Operations</TabsTrigger>
                <TabsTrigger value="damage-reports">Damage Reports</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <PropertyOverviewTab property={property} />
              </TabsContent>

              <TabsContent value="operations" className="mt-6">
                <PropertyOperationsTab propertyId={property.id} />
              </TabsContent>

              <TabsContent value="damage-reports" className="mt-6">
                <PropertyDamageReportsTab propertyId={property.id} />
              </TabsContent>

              <TabsContent value="financials" className="mt-6">
                <PropertyFinancialsTab property={property} />
              </TabsContent>

              <TabsContent value="notes" className="mt-6">
                <PropertyNotesTab propertyId={property.id} notes={property.notes} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

const PropertyDetailSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-20" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>
    </div>
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  </div>
);