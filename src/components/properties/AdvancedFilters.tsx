
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal } from "lucide-react";

interface FilterOptions {
  priceRange: [number, number];
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  locations: string[];
}

interface AdvancedFiltersProps {
  onApplyFilters: (filters: FilterOptions) => void;
  activeFiltersCount?: number;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ 
  onApplyFilters, 
  activeFiltersCount = 0 
}) => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [50, 1000],
    bedrooms: "",
    bathrooms: "",
    propertyType: "",
    locations: [],
  });
  
  const handleApply = () => {
    onApplyFilters(filters);
    setOpen(false);
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal size={16} />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[340px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label>Price Range (per night)</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm">€{filters.priceRange[0]}</span>
              <span className="text-sm">€{filters.priceRange[1]}</span>
            </div>
            <Slider 
              defaultValue={filters.priceRange} 
              min={50} 
              max={1000} 
              step={50}
              onValueChange={(value) => setFilters({...filters, priceRange: value as [number, number]})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Select 
                value={filters.bedrooms}
                onValueChange={(value) => setFilters({...filters, bedrooms: value})}
              >
                <SelectTrigger id="bedrooms">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {[1, 2, 3, 4, 5, "6+"].map((num) => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Select 
                value={filters.bathrooms}
                onValueChange={(value) => setFilters({...filters, bathrooms: value})}
              >
                <SelectTrigger id="bathrooms">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {[1, 2, 3, 4, "5+"].map((num) => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type</Label>
            <Select 
              value={filters.propertyType}
              onValueChange={(value) => setFilters({...filters, propertyType: value})}
            >
              <SelectTrigger id="propertyType">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="villa">Luxury Villa</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="suite">Suite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4 space-x-2 flex justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdvancedFilters;
