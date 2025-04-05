import React, { useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Search, Plus, Calendar as CalendarIcon, Home, User, MessageSquare, DollarSign, Filter, Map } from "lucide-react";
import { toast } from "sonner";
import PropertyForm from "@/components/properties/PropertyForm";
import BookingCalendar from "@/components/properties/BookingCalendar";
import PricingConfig from "@/components/properties/PricingConfig";
import GuestManagement from "@/components/properties/GuestManagement";

// Sample property data
const properties = [
  {
    id: 1,
    name: "Villa Caldera",
    location: "Santorini, Greece",
    status: "Occupied",
    type: "Luxury Villa",
    bedrooms: 4,
    bathrooms: 3,
    price: 450,
    imageUrl: "/placeholder.svg",
    currentGuests: { name: "John & Sarah Miller", checkIn: "2025-04-01", checkOut: "2025-04-08" },
    nextBooking: { name: "Roberto Garcia", checkIn: "2025-04-09", checkOut: "2025-04-15" }
  },
  {
    id: 2,
    name: "Villa Azure",
    location: "Santorini, Greece",
    status: "Vacant",
    type: "Deluxe Villa",
    bedrooms: 3,
    bathrooms: 2,
    price: 380,
    imageUrl: "/placeholder.svg",
    nextBooking: { name: "Emma Thompson", checkIn: "2025-04-10", checkOut: "2025-04-17" }
  },
  {
    id: 3,
    name: "Villa Sunset",
    location: "Santorini, Greece",
    status: "Occupied",
    type: "Premium Villa",
    bedrooms: 5,
    bathrooms: 4,
    price: 520,
    imageUrl: "/placeholder.svg",
  },
  {
    id: 4,
    name: "Villa Oceana",
    location: "Athens, Greece",
    status: "Vacant",
    type: "Luxury Villa",
    bedrooms: 4,
    bathrooms: 3,
    price: 420,
    imageUrl: "/placeholder.svg",
  },
  {
    id: 5,
    name: "Villa Harmony",
    location: "Athens, Greece",
    status: "Occupied",
    type: "Premium Villa",
    bedrooms: 3,
    bathrooms: 2,
    price: 390,
    imageUrl: "/placeholder.svg",
  },
  {
    id: 6,
    name: "Villa Breeze",
    location: "Santorini, Greece",
    status: "Maintenance",
    type: "Deluxe Villa",
    bedrooms: 4,
    bathrooms: 3,
    price: 410,
    imageUrl: "/placeholder.svg",
  },
];

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeView, setActiveView] = useState("properties");
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);

  const filteredProperties = properties.filter((property) => {
    // Filter by search query
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by tab
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

  const handlePropertyCreated = (newProperty) => {
    toast.success(`${newProperty.name} has been added to your properties`);
    setIsAddPropertyOpen(false);
    // In a real app, we would add the property to the state/database
  };

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setActiveView("details");
  };

  const handleBookingManagement = (property) => {
    setSelectedProperty(property);
    setActiveView("bookings");
  };
  
  const handlePricingConfig = (property) => {
    setSelectedProperty(property);
    setActiveView("pricing");
  };
  
  const handleGuestManagement = (property) => {
    setSelectedProperty(property);
    setActiveView("guests");
  };

  const handleBackToProperties = () => {
    setActiveView("properties");
    setSelectedProperty(null);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            onViewDetails={handleViewDetails}
            onBookingManagement={handleBookingManagement}
            onPricingConfig={handlePricingConfig}
            onGuestManagement={handleGuestManagement}
          />
        ))}
      </div>

      {/* Add Property Dialog */}
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

const PropertyDetails = ({ property, onBack }) => {
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
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            {property.currentGuests ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Current Guests</h3>
                  <p>{property.currentGuests.name}</p>
                  <div className="text-sm text-muted-foreground">
                    {property.currentGuests.checkIn} to {property.currentGuests.checkOut}
                  </div>
                </div>
                <div>
                  <Button variant="outline" size="sm" className="mr-2">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Guests
                  </Button>
                </div>
              </div>
            ) : property.nextBooking ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Next Booking</h3>
                  <p>{property.nextBooking.name}</p>
                  <div className="text-sm text-muted-foreground">
                    {property.nextBooking.checkIn} to {property.nextBooking.checkOut}
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

interface PropertyCardProps {
  property: {
    id: number;
    name: string;
    location: string;
    status: string;
    type: string;
    bedrooms: number;
    bathrooms: number;
    price: number;
    imageUrl: string;
    currentGuests?: { name: string; checkIn: string; checkOut: string };
    nextBooking?: { name: string; checkIn: string; checkOut: string };
  };
  onViewDetails: (property: any) => void;
  onBookingManagement: (property: any) => void;
  onPricingConfig: (property: any) => void;
  onGuestManagement: (property: any) => void;
}

const PropertyCard = ({ 
  property, 
  onViewDetails,
  onBookingManagement,
  onPricingConfig,
  onGuestManagement
}: PropertyCardProps) => {
  const statusColors = {
    Occupied: "bg-green-100 text-green-800",
    Vacant: "bg-blue-100 text-blue-800",
    Maintenance: "bg-amber-100 text-amber-800",
  };

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
              <DropdownMenuItem>Edit Property</DropdownMenuItem>
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
        
        {property.currentGuests && (
          <div className="mt-2 pt-2 border-t text-xs">
            <p className="font-medium">Currently occupied by:</p>
            <p className="text-muted-foreground">{property.currentGuests.name}</p>
            <p className="text-muted-foreground">Until {property.currentGuests.checkOut}</p>
          </div>
        )}
        
        {!property.currentGuests && property.nextBooking && (
          <div className="mt-2 pt-2 border-t text-xs">
            <p className="font-medium">Next booking:</p>
            <p className="text-muted-foreground">{property.nextBooking.name}</p>
            <p className="text-muted-foreground">From {property.nextBooking.checkIn}</p>
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
