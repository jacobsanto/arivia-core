import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Calendar as CalendarIcon, Home, User, MessageSquare, DollarSign, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import PropertyForm from "@/components/properties/PropertyForm";
import BookingCalendar from "@/components/properties/bookings";
import PricingConfig from "@/components/properties/PricingConfig";
import GuestManagement from "@/components/properties/GuestManagement";
import { useProperties, Property } from "@/hooks/useProperties";
import { Skeleton } from "@/components/ui/skeleton";

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeView, setActiveView] = useState("properties");
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  
  const { 
    properties, 
    isLoading, 
    error, 
    fetchProperties, 
    addProperty, 
    updateProperty, 
    deleteProperty 
  } = useProperties();

  useEffect(() => {
    if (error) {
      toast.error('Failed to load properties', {
        description: error
      });
    }
  }, [error]);

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "occupied" && property.status === "Occupied") ||
      (activeTab === "vacant" && property.status === "Vacant") ||
      (activeTab === "maintenance" && property.status === "Maintenance");

    return matchesSearch && matchesTab;
  });

  const handleAddProperty = () => {
    setIsAddPropertyOpen(true);
  };

  const handlePropertyCreated = async (newProperty: any) => {
    try {
      await addProperty(newProperty);
      toast.success(`${newProperty.name} has been added to your properties`);
      setIsAddPropertyOpen(false);
    } catch (err: any) {
    }
  };

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
    setActiveView("details");
  };

  const handleBookingManagement = (property: Property) => {
    setSelectedProperty(property);
    setActiveView("bookings");
  };
  
  const handlePricingConfig = (property: Property) => {
    setSelectedProperty(property);
    setActiveView("pricing");
  };
  
  const handleGuestManagement = (property: Property) => {
    setSelectedProperty(property);
    setActiveView("guests");
  };

  const handleBackToProperties = () => {
    setActiveView("properties");
    setSelectedProperty(null);
  };

  const handleDeleteProperty = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await deleteProperty(id);
        toast.success(`${name} has been deleted`);
      } catch (err) {
      }
    }
  };

  if (activeView === "details" && selectedProperty) {
    return <PropertyDetails property={selectedProperty} onBack={handleBackToProperties} />;
  }
  
  if (activeView === "bookings" && selectedProperty) {
    return <BookingCalendar property={selectedProperty} onBack={handleBackToProperties} />;
  }
  
  if (activeView === "pricing" && selectedProperty) {
    return <PricingConfig property={selectedProperty} onBack={handleBackToProperties} />;
  }
  
  if (activeView === "guests" && selectedProperty) {
    return <GuestManagement property={selectedProperty} onBack={handleBackToProperties} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">
            Manage your portfolio of luxury villas.
          </p>
        </div>
        <Button onClick={handleAddProperty}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs
          defaultValue="all"
          className="w-full sm:w-auto"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="occupied">Occupied</TabsTrigger>
            <TabsTrigger value="vacant">Vacant</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <Card key={key} className="overflow-hidden">
              <div className="relative h-48">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex justify-between w-full">
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No properties found</h3>
          <p className="text-muted-foreground mb-6">
            {properties.length === 0
              ? "You haven't added any properties yet."
              : "No properties match your current search or filter."}
          </p>
          {properties.length === 0 && (
            <Button onClick={handleAddProperty}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Property
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              onViewDetails={handleViewDetails}
              onBookingManagement={handleBookingManagement}
              onPricingConfig={handlePricingConfig}
              onGuestManagement={handleGuestManagement}
              onDelete={handleDeleteProperty}
            />
          ))}
        </div>
      )}

      <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
          </DialogHeader>
          <PropertyForm onSubmit={handlePropertyCreated} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PropertyDetails = ({ property, onBack }: { property: Property, onBack: () => void }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <h1 className="text-2xl font-bold">{property.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{property.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{property.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={property.status === "Occupied" ? "default" : property.status === "Vacant" ? "secondary" : "outline"}>
                  {property.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bedrooms:</span>
                <span className="font-medium">{property.bedrooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bathrooms:</span>
                <span className="font-medium">{property.bathrooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Price:</span>
                <span className="font-medium">€{property.price}/night</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address:</span>
                <span className="font-medium">{property.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Guests:</span>
                <span className="font-medium">{property.max_guests}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingStatusContent property={property} />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" onClick={() => onBack()}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Manage Bookings
              </Button>
              <Button variant="outline" onClick={() => onBack()}>
                <DollarSign className="mr-2 h-4 w-4" />
                Configure Pricing
              </Button>
              <Button variant="outline" onClick={() => onBack()}>
                <User className="mr-2 h-4 w-4" />
                Guest Management
              </Button>
              <Button variant="outline" onClick={() => onBack()}>
                <Home className="mr-2 h-4 w-4" />
                Edit Property
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const BookingStatusContent = ({ property }: { property: Property }) => {
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [nextBooking, setNextBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { getPropertyBookings } = useProperties();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookings = await getPropertyBookings(property.id);
        
        const today = new Date();
        const current = bookings.find(booking => 
          new Date(booking.check_in_date) <= today && 
          new Date(booking.check_out_date) >= today
        );
        setCurrentBooking(current || null);
        
        const upcoming = bookings
          .filter(booking => new Date(booking.check_in_date) > today)
          .sort((a, b) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime())[0];
        setNextBooking(upcoming || null);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setIsLoading(false);
      }
    };
    
    if (property.id) {
      fetchBookings();
    }
  }, [property.id]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/4" />
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  return (
    <>
      {currentBooking ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Current Guests</h3>
            <p>{currentBooking.guest_name}</p>
            <div className="text-sm text-muted-foreground">
              {new Date(currentBooking.check_in_date).toLocaleDateString()} to {new Date(currentBooking.check_out_date).toLocaleDateString()}
            </div>
          </div>
          <div>
            <Button variant="outline" size="sm" className="mr-2">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message Guests
            </Button>
          </div>
        </div>
      ) : nextBooking ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Next Booking</h3>
            <p>{nextBooking.guest_name}</p>
            <div className="text-sm text-muted-foreground">
              {new Date(nextBooking.check_in_date).toLocaleDateString()} to {new Date(nextBooking.check_out_date).toLocaleDateString()}
            </div>
          </div>
          <div>
            <Button variant="outline" size="sm">Prepare Welcome Package</Button>
          </div>
        </div>
      ) : (
        <div>
          <p>No current or upcoming bookings.</p>
          <Button className="mt-4" size="sm" variant="outline">Create Booking</Button>
        </div>
      )}
    </>
  );
};

interface PropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
  onBookingManagement: (property: Property) => void;
  onPricingConfig: (property: Property) => void;
  onGuestManagement: (property: Property) => void;
  onDelete: (id: string, name: string) => void;
}

const PropertyCard = ({ 
  property, 
  onViewDetails,
  onBookingManagement,
  onPricingConfig,
  onGuestManagement,
  onDelete
}: PropertyCardProps) => {
  const statusColors = {
    Occupied: "bg-green-100 text-green-800",
    Vacant: "bg-blue-100 text-blue-800",
    Maintenance: "bg-amber-100 text-amber-800",
  };

  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [nextBooking, setNextBooking] = useState<any>(null);
  const { getPropertyBookings } = useProperties();

  useEffect(() => {
    const fetchBookings = async () => {
      const bookings = await getPropertyBookings(property.id);
      
      const today = new Date();
      const current = bookings.find(booking => 
        new Date(booking.check_in_date) <= today && 
        new Date(booking.check_out_date) >= today
      );
      setCurrentBooking(current || null);
      
      const upcoming = bookings
        .filter(booking => new Date(booking.check_in_date) > today)
        .sort((a, b) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime())[0];
      setNextBooking(upcoming || null);
    };
    
    fetchBookings();
  }, [property.id]);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.name}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
        />
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium ${statusColors[property.status as keyof typeof statusColors]}`}>
          {property.status}
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{property.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(property)}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBookingManagement(property)}>Manage Bookings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPricingConfig(property)}>Configure Pricing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGuestManagement(property)}>Guest Management</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete(property.id, property.name)}>
                Delete Property
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>{property.location}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{property.type}</Badge>
          </div>
          <div className="font-medium">€{property.price}/night</div>
        </div>
        
        {currentBooking && (
          <div className="mt-2 pt-2 border-t text-xs">
            <p className="font-medium">Currently occupied by:</p>
            <p className="text-muted-foreground">{currentBooking.guest_name}</p>
            <p className="text-muted-foreground">Until {new Date(currentBooking.check_out_date).toLocaleDateString()}</p>
          </div>
        )}
        
        {!currentBooking && nextBooking && (
          <div className="mt-2 pt-2 border-t text-xs">
            <p className="font-medium">Next booking:</p>
            <p className="text-muted-foreground">{nextBooking.guest_name}</p>
            <p className="text-muted-foreground">From {new Date(nextBooking.check_in_date).toLocaleDateString()}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex justify-between w-full text-xs text-muted-foreground">
          <span>{property.bedrooms} Bedrooms</span>
          <span>{property.bathrooms} Bathrooms</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Properties;
