
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, ArrowDownUp, ArrowUp, ArrowDown } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MobileStockLevels = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  // Mock data
  const items = [
    { id: 1, name: "Bath Towels", category: "Bathroom", location: "Main Storage", stock: 42, minStock: 20, status: "In Stock" },
    { id: 2, name: "Toilet Paper", category: "Bathroom", location: "Main Storage", stock: 56, minStock: 30, status: "In Stock" },
    { id: 3, name: "Hand Soap", category: "Bathroom", location: "Villa Caldera", stock: 8, minStock: 5, status: "In Stock" },
    { id: 4, name: "Dishwasher Tablets", category: "Kitchen", location: "Villa Azure", stock: 3, minStock: 10, status: "Low Stock" },
    { id: 5, name: "Coffee Pods", category: "Kitchen", location: "Main Storage", stock: 24, minStock: 30, status: "Low Stock" }
  ];

  return (
    <div className="space-y-4">
      {/* Search and filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => setIsFilterSheetOpen(true)}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Quick filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mobile-scroll">
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="main">Main Storage</SelectItem>
            <SelectItem value="villa1">Villa Caldera</SelectItem>
            <SelectItem value="villa2">Villa Azure</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="stock-asc">Stock (Low-High)</SelectItem>
            <SelectItem value="stock-desc">Stock (High-Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Items list */}
      <div className="space-y-3">
        {items.map(item => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <Badge variant={item.status === "Low Stock" ? "destructive" : "outline"}>
                  {item.status}
                </Badge>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span>{item.location}</span>
                <span>{item.stock}/{item.minStock} units</span>
              </div>
              <Progress value={(item.stock / Math.max(item.minStock, item.stock)) * 100} 
                className={`h-1.5 ${item.stock < item.minStock ? "text-red-500" : ""}`} />
              <div className="flex justify-between mt-3">
                <Button size="sm" variant="outline" className="text-xs h-8 px-2">Adjust</Button>
                <Button size="sm" variant="outline" className="text-xs h-8 px-2">History</Button>
                <Button size="sm" className="text-xs h-8 px-2">Transfer</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MobileStockLevels;
