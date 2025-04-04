
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
import { MoreHorizontal, Search, Plus } from "lucide-react";
import { toast } from "sonner";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">
            Manage your portfolio of luxury villas.
          </p>
        </div>
        <Button onClick={() => toast.info("Property creation form would open here.")}>
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
          <PropertyCard key={property.id} property={property} />
        ))}
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
  };
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const statusColors = {
    Occupied: "bg-green-100 text-green-800",
    Vacant: "bg-blue-100 text-blue-800",
    Maintenance: "bg-amber-100 text-amber-800",
  };

  const handleViewDetails = () => {
    toast.info(`Viewing details for ${property.name}`);
  };

  const handleAssignTasks = () => {
    toast.info(`Assigning tasks for ${property.name}`);
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
              <DropdownMenuItem onClick={handleViewDetails}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={handleAssignTasks}>Assign Tasks</DropdownMenuItem>
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
      </CardContent>
      <CardFooter className="pt-2 text-xs text-muted-foreground">
        <div className="flex justify-between w-full">
          <span>{property.bedrooms} Bedrooms</span>
          <span>{property.bathrooms} Bathrooms</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Properties;
