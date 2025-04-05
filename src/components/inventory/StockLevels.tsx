
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { inventoryData } from "@/data/inventoryData";

const StockLevels = () => {
  const [location, setLocation] = useState("all");
  const [search, setSearch] = useState("");

  // Filter inventory items based on search and selected location
  const filteredItems = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = location === "all" || item.location === location;
    return matchesSearch && matchesLocation;
  });

  const getStockStatusBadge = (current: number, min: number) => {
    if (current === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (current <= min) {
      return <Badge variant="outline" className="text-amber-500 border-amber-500">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="text-green-500 border-green-500">In Stock</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-1/4">
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="main">Main Storage</SelectItem>
              <SelectItem value="villa_caldera">Villa Caldera</SelectItem>
              <SelectItem value="villa_oceana">Villa Oceana</SelectItem>
              <SelectItem value="villa_azure">Villa Azure</SelectItem>
              <SelectItem value="villa_sunset">Villa Sunset</SelectItem>
              <SelectItem value="villa_paradiso">Villa Paradiso</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Current Stock</TableHead>
              <TableHead className="text-right">Min. Level</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={`${item.id}-${item.location}`}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  {item.location === "main" ? "Main Storage" : 
                   item.location === "villa_caldera" ? "Villa Caldera" :
                   item.location === "villa_oceana" ? "Villa Oceana" :
                   item.location === "villa_azure" ? "Villa Azure" :
                   item.location === "villa_sunset" ? "Villa Sunset" :
                   "Villa Paradiso"}
                </TableCell>
                <TableCell className="text-right">{item.currentStock}</TableCell>
                <TableCell className="text-right">{item.minLevel}</TableCell>
                <TableCell className="text-center">
                  {getStockStatusBadge(item.currentStock, item.minLevel)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StockLevels;
